import { browser } from '$app/environment';
import { server } from '$utils/constants';
import { flattenObject } from 'flatten-anything';
import { getOperationAST, print, type DocumentNode } from 'graphql';
import type { Readable } from 'svelte/store';
import { derived, get, readable, writable } from 'svelte/store';

export interface GraphqlQueryOptions<VariablesType> {
  tenant: string;
  query: DocumentNode;
  variables?: VariablesType;
  useCache?: boolean;
  /**
   * Millseconds until the cache is considered outdated.
   * If it is not invalid, a persisted copy from localStorage will be used.
   */
  persistCache?: number;
  /**
   * Millseconds until the cache is considered outdated.
   */
  expireCache?: number;
  fetchNextPages?: boolean;
  skip?: boolean;
}

// cache store
const localStorePersistCopy = (browser && localStorage.getItem('store:graphql:cache')) || '{}';
const cache = writable<
  Record<string, Record<string, { time: number; value: ReturnType<unknown>; persist: boolean }>>
>(JSON.parse(localStorePersistCopy));
cache.subscribe((value) => {
  // persist to localStorage only if persist is true
  if (browser) {
    const persistable = Object.fromEntries(
      Object.entries(value).map(([k, v]) => {
        return [k, Object.fromEntries(Object.entries(v).filter(([key, value]) => value.persist))];
      })
    );
    localStorage.setItem('store:graphql:cache', JSON.stringify(persistable));
  }
});

export async function query<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType>
): Promise<GraphqlQueryReturn<DataType>> {
  if (opts.skip) return {};

  const operation = getOperationAST(opts.query);
  const operationName = operation && operation.name && operation.name.value;
  const topSelectionName: string | undefined = (() => {
    const firstSelection = operation?.selectionSet.selections?.[0];
    // @ts-expect-error these exsit
    return firstSelection?.alias || firstSelection?.name.value || undefined;
  })();
  const varKey = createVariableKey(opts.variables || {}, opts.tenant);

  if (operationName && opts.useCache && get(cache)[operationName]?.[varKey]) {
    if (opts.persistCache || opts.expireCache) {
      const { time, value } = get(cache)[operationName][varKey];
      if (new Date(time + (opts.persistCache || opts.expireCache || 0)) > new Date()) {
        // cache data is not yet expired
        return value as ReturnType<DataType>;
      }
    } else {
      return get(cache)[operationName][varKey].value as ReturnType<DataType>;
    }
  }

  return fetch(`${server.location}/v3/${opts.tenant}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(opts.query),
      variables: opts.variables,
    }),
  }).then(async (res) => {
    if (res.ok) {
      const json = (await res.json()) as ReturnType<DataType>;

      // attempt to retrieve the docs from every page (this could take a while)
      // and combine into the main docs array
      const page: number = (opts?.variables as any)?.page || 1;
      if (
        opts?.fetchNextPages &&
        json.data &&
        topSelectionName &&
        (json.data as any)?.[topSelectionName]?.docs?.length > 0
      ) {
        const next = await query<DataType>({ ...opts, variables: { ...opts.variables, page: page + 1 } });
        const nextDocs = (next?.data as any)?.[topSelectionName]?.docs;
        (json.data as any)[topSelectionName]?.docs.push(...nextDocs);
      }

      // cache the result so it can be used immediately (cache is lost on page refresh)
      if (operationName)
        cache.update((state) => ({
          ...state,
          [operationName]: {
            ...state[operationName],
            [varKey]: {
              time: new Date().getTime(),
              value: json as Record<string, unknown>,
              use: opts.useCache,
              persist: !!opts.persistCache,
            },
          },
        }));

      return json;
    }

    return null;
  });
}

export function getQueryStore<DataType = unknown, VariablesType = unknown>(opts: {
  queryName: string;
  variables?: VariablesType;
  tenant: string;
}): Readable<ReturnType<DataType>> {
  const varKey = createVariableKey(opts.variables || {}, opts.tenant);
  return derived(cache, ($cache) => {
    if (!$cache[opts.queryName]?.[varKey]) return {};
    return {
      data: $cache[opts.queryName]?.[varKey].value.data,
      errors: $cache[opts.queryName]?.[varKey].value.errors,
    } as ReturnType<DataType>;
  });
}

export async function queryWithStore<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType> & { waitForQuery?: boolean }
): Promise<Readable<ReturnType<DataType>>> {
  await new Promise<void>(async (resolve) => {
    if (opts.waitForQuery) await query(opts);
    else query(opts);
    resolve();
  });

  const operation = getOperationAST(opts.query);
  const operationName = (operation && operation.name && operation.name.value) || undefined;
  if (!operationName) return readable({});

  return getQueryStore<DataType, VariablesType>({
    queryName: operationName,
    variables: opts.variables,
    tenant: opts.tenant,
  });
}

/**
 * Flattens, alphabetically sorts, and stringifies the variables object.
 *
 * This is useful for creating predictable indentifiers for different sets
 * of variables.
 */
function createVariableKey(variables: Record<string, unknown>, tenant?: string) {
  const flat = flattenObject(variables);
  if (tenant) flat.tenant = tenant; // ensure tenant is included as a variable so different tenants do not overwrite their cache
  const sorted = Object.fromEntries(Object.entries(flat).sort((a, b) => a[0].localeCompare(b[0])));
  return JSON.stringify(sorted);
}

export { cache as queryCacheStore };
export type GraphqlQueryReturn<DataType> = ReturnType<DataType> | null;

interface ReturnType<DataType> {
  data?: DataType;
  errors?: any;
}
