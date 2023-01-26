import { server } from '$utils/constants';
import { hasKey } from '$utils/hasKey';
import { getOperationAST, isSelectionNode, print, type DocumentNode } from 'graphql';
import { get, writable } from 'svelte/store';

export interface GraphqlQueryOptions<VariablesType> {
  tenant: string;
  query: DocumentNode;
  variables?: VariablesType;
  useCache?: boolean;
  fetchNextPages?: boolean;
  skip?: boolean;
}

const cache = writable<Record<string, unknown>>({});

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
      if (opts?.useCache && operationName) cache.update((state) => ({ ...state, [operationName]: json }));

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
