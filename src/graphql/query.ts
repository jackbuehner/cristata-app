import { browser } from '$app/environment';
import { server } from '$utils/constants';
import { hasKey } from '$utils/hasKey';
import { getOperationAST, isSelectionNode, print, type DocumentNode } from 'graphql';
import { get, writable } from 'svelte/store';

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
  fetchNextPages?: boolean;
  skip?: boolean;
}

// cache store
const localStorePersistCopy = (browser && localStorage.getItem('store:graphql:cache')) || '{}';
const cache = writable<Record<string, { time: number; value: Record<string, unknown>; persist: boolean }>>(
  JSON.parse(localStorePersistCopy)
);
cache.subscribe((value) => {
  if (browser) {
    const persistable = Object.fromEntries(Object.entries(value).filter(([key, value]) => value.persist));
    localStorage.setItem('store:graphql:cache', JSON.stringify(persistable));
  }
});

export async function query<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType>
): Promise<GraphqlQueryReturn<DataType>> {
  if (opts?.skip) return {};

  const operation = getOperationAST(opts.query);
  const operationName = operation && operation.name && operation.name.value;
  const topSelectionName: string | undefined = (() => {
    const firstSelection = operation?.selectionSet.selections?.[0];
    // @ts-expect-error these exsit
    return firstSelection?.alias || firstSelection?.name.value || undefined;
  })();

  if (operationName && get(cache)[operationName]) {
    if (opts?.persistCache) {
      const { time, value } = get(cache)[operationName];
      if (new Date(time + opts.persistCache) > new Date()) {
        // cache data is not yet expired
        return value as ReturnType<DataType>;
      }
    } else {
      return get(cache)[operationName].value as ReturnType<DataType>;
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
      if (opts?.useCache && operationName)
        cache.update((state) => ({
          ...state,
          [operationName]: {
            time: new Date().getTime(),
            value: json as Record<string, unknown>,
            persist: !!opts.persistCache,
          },
        }));

      return json;
    }

    return null;
  });
}

export { cache as queryCacheStore };
export type GraphqlQueryReturn<DataType> = ReturnType<DataType> | null;

interface ReturnType<DataType> {
  data?: DataType;
  errors?: any;
}
