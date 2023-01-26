import { server } from '$utils/constants';
import { getOperationAST, print, type DocumentNode } from 'graphql';
import { get, writable } from 'svelte/store';

export interface GraphqlQueryOptions<VariablesType> {
  tenant: string;
  query: DocumentNode;
  variables?: VariablesType;
  useCache?: boolean;
}

const cache = writable<Record<string, unknown>>({});

export async function query<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType>
): Promise<GraphqlQueryReturn<DataType>> {
  const operation = getOperationAST(opts.query);
  const operationName = operation && operation.name && operation.name.value;

  if (operationName && get(cache)[operationName]) {
    return get(cache)[operationName] as ReturnType<DataType>;
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

      // cache the result so it can be used immediately (cache is lost on page refresh)
      if (opts?.useCache && operationName) cache.set({ ...cache, [operationName]: json });

      return json;
    }

    return null;
  });
}

export type GraphqlQueryReturn<DataType> = ReturnType<DataType> | null;

interface ReturnType<DataType> {
  data?: DataType;
  errors?: any;
}
