import { browser } from '$app/environment';
import { server } from '$utils/constants';
import { hasKey } from '$utils/hasKey';
import { flattenObject } from 'flatten-anything';
import { getOperationAST, print, type DocumentNode } from 'graphql';
import type { Readable } from 'svelte/store';
import { derived, get, readable, writable } from 'svelte/store';

export interface GraphqlQueryOptions<VariablesType> {
  fetch: typeof fetch;
  /**
   * AbosrtSignal provided to `fetch`
   */
  signal?: AbortSignal;
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
  _varKey?: string;
  /**
   * Whether the store value should be reset to undefined.
   *
   * Default: `false`
   */
  clearStoreBeforeFetch?: boolean;
}

// cache store
const localStorePersistCopy = (browser && localStorage.getItem('store:graphql:cache')) || '{}';
const cache = writable<
  Record<
    string,
    Record<
      string,
      {
        time: number;
        value: ReturnType<unknown>;
        persist: boolean;
        queryOpts: Omit<GraphqlQueryOptions<unknown>, 'fetch'>;
      }
    >
  >
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

// track loading
const loading = writable<Record<string, Record<string, boolean>>>({});

function getOperationInfo(query: DocumentNode) {
  const operation = getOperationAST(query);
  const operationName = operation && operation.name && operation.name.value;
  const topSelectionName: string | undefined = (() => {
    const firstSelection = operation?.selectionSet.selections?.[0];
    // @ts-expect-error these exsit
    return firstSelection?.alias || firstSelection?.name.value || undefined;
  })();

  return { operation, operationName, topSelectionName };
}

export async function query<DataType = unknown, VariablesType = unknown>({
  fetch: _fetch,
  ...opts
}: GraphqlQueryOptions<VariablesType>): Promise<GraphqlQueryReturn<DataType>> {
  const fetch = _fetch;
  if (opts.skip) return {};

  const { operationName, topSelectionName } = getOperationInfo(opts.query);
  const varKey = opts._varKey || createVariableKey(opts.variables || {}, opts.tenant);

  if (operationName && opts.useCache && get(cache)[operationName]?.[varKey]) {
    if (opts.persistCache || opts.expireCache) {
      const { time, value } = get(cache)[operationName][varKey];
      if (new Date(time + (opts.expireCache || opts.persistCache || 0)) > new Date()) {
        // cache data is not yet expired
        return value as ReturnType<DataType>;
      }
    } else {
      return get(cache)[operationName][varKey].value as ReturnType<DataType>;
    }
  }

  // set the loading is occuring
  if (operationName) {
    loading.update((state) => ({
      ...state,
      [operationName]: {
        ...(state[operationName] || {}),
        [varKey]: true,
      },
    }));
  }

  return fetch(`${server.location}/v3/${opts.tenant}${operationName ? `?${operationName}` : ''}`, {
    method: 'POST',
    signal: opts.signal,
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
        const next = await query<DataType>({
          fetch,
          ...opts,
          variables: { ...opts.variables, page: page + 1 },
        });
        const nextDocs = (next?.data as any)?.[topSelectionName]?.docs;
        (json.data as any)[topSelectionName]?.docs.push(...nextDocs);
      }

      // cache the result so it can be used immediately (cache is lost on page refresh)
      if (operationName) {
        cache.update((state) => ({
          ...state,
          [operationName]: {
            ...state[operationName],
            [varKey]: {
              time: new Date().getTime(),
              value: json as Record<string, unknown>,
              use: opts.useCache,
              persist: !!opts.persistCache,
              queryOpts: opts,
            },
          },
        }));
        loading.update((state) => ({
          ...state,
          [operationName]: {
            ...(state[operationName] || {}),
            [varKey]: false,
          },
        }));
      }

      return json;
    }

    return null;
  });
}

export function getQueryStore<DataType = unknown, VariablesType = unknown>(opts: {
  queryName: string;
  variables?: VariablesType;
  tenant: string;
}): Readable<StoreReturnType<DataType, VariablesType>> {
  const varKey = createVariableKey(opts.variables || {}, opts.tenant);

  return derived([cache, loading], ([$cache, $loading]) => {
    return {
      data: $cache[opts.queryName]?.[varKey]?.value.data,
      errors: $cache[opts.queryName]?.[varKey]?.value.errors,
      loading: $loading[opts.queryName]?.[varKey] || false,
      refetch: async (updatedVariables) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName]?.[varKey].queryOpts;
        await query({
          fetch,
          ...queryOpts,
          variables: {
            ...(queryOpts.variables || {}),
            ...(updatedVariables || {}),
          },
          expireCache: 1,

          // make sure that the varKey remains the same even though the variables changed
          _varKey: varKey,
        });
      },
      fetchNextPage: async (page: number = (opts?.variables as any)?.page || 1) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName][varKey].queryOpts;

        const next = await query<DataType>({
          fetch,
          ...queryOpts,
          variables: { ...(queryOpts.variables || {}), page: page + 1 },
        });

        return {
          current: $cache[opts.queryName][varKey].value.data as DataType,
          next: next?.data,
          setStore: (merged: DataType) => {
            setUpdatedData(queryOpts, varKey, merged);
            return merged;
          },
        };
      },
      fetchMore: async (offset: number, limit = 10) => {
        if (!$cache[opts.queryName]) return;
        if (!$cache[opts.queryName][varKey]) return;

        const queryOpts = $cache[opts.queryName][varKey].queryOpts;

        const next = await query<DataType>({
          fetch,
          ...queryOpts,
          variables: { ...(queryOpts.variables || {}), offset, limit },
        });

        return {
          current: $cache[opts.queryName][varKey].value.data as DataType,
          next: next?.data,
          setStore: (merged: DataType) => {
            setUpdatedData(queryOpts, varKey, merged);
            return merged;
          },
        };
      },
    } as StoreReturnType<DataType, VariablesType>;
  });
}

function setUpdatedData<DataType = unknown>(
  queryOpts: Omit<GraphqlQueryOptions<unknown>, 'fetch'>,
  varKey: string,
  merged: DataType
) {
  const { operationName } = getOperationInfo(queryOpts.query);

  if (operationName) {
    cache.update((state) => ({
      ...state,
      [operationName]: {
        ...state[operationName],
        [varKey]: {
          ...state[operationName][varKey],
          time: new Date().getTime(),
          value: {
            ...state[operationName][varKey].value,
            data: merged,
          },
        },
      },
    }));
  }
}

function clearStoreData<VariablesType = unknown>(queryOpts: Omit<GraphqlQueryOptions<VariablesType>, 'fetch'>) {
  const { operationName } = getOperationInfo(queryOpts.query);
  const varKey = queryOpts._varKey || createVariableKey(queryOpts.variables || {}, queryOpts.tenant);

  if (operationName) {
    cache.update((state) => {
      if (state[operationName] && typeof state[operationName] === 'object' && state[operationName][varKey]) {
        delete state[operationName][varKey];
      }
      return state;
    });
  }
}

export async function queryWithStore<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType> & { waitForQuery?: boolean }
): Promise<Readable<StoreReturnType<DataType, VariablesType>>> {
  await new Promise<void>(async (resolve) => {
    if (opts.clearStoreBeforeFetch) clearStoreData(opts);

    if (opts.waitForQuery) await query(opts);
    else query(opts);

    resolve();
  });

  const operation = getOperationAST(opts.query);
  const operationName = (operation && operation.name && operation.name.value) || undefined;
  if (!operationName)
    return readable({
      refetch: async () => {},
      fetchNextPage: async () => {
        return {
          setStore: (merged: DataType) => {
            return merged;
          },
        };
      },
      fetchMore: async () => {
        return {
          setStore: (merged: DataType) => {
            return merged;
          },
        };
      },
    });

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
  loading?: boolean;
}

export interface StoreReturnType<DataType, VariablesType> extends ReturnType<DataType> {
  refetch: (updatedVariables?: Partial<VariablesType>) => Promise<void>;
  fetchNextPage: (
    page?: number
  ) => Promise<{ current?: DataType; next?: DataType; setStore: (merged: DataType) => DataType }>;
  fetchMore: (
    offset: number,
    limit?: number
  ) => Promise<{ current?: DataType; next?: DataType; setStore: (merged: DataType) => DataType }>;
}
