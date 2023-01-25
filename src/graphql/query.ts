import { server } from '$utils/constants';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';

export interface GraphqlQueryOptions<VariablesType> {
  tenant: string;
  query: DocumentNode;
  variables?: VariablesType;
}

export async function query<DataType = unknown, VariablesType = unknown>(
  opts: GraphqlQueryOptions<VariablesType>
): Promise<GraphqlQueryReturn<DataType>> {
  return fetch(`${server.location}/v3/${opts.tenant}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: print(opts.query),
      variables: opts.variables,
    }),
  }).then((res) => {
    if (res.ok) return res.json() as ReturnType<DataType>;
    return null;
  });
}

export type GraphqlQueryReturn<DataType> = ReturnType<DataType> | null;

interface ReturnType<DataType> {
  data?: DataType;
  errors?: any;
}
