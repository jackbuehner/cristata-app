import {
  ExternalAccountsList,
  type ExternalAccountsListQuery,
  type ExternalAccountsListQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  const externalAccountsList = queryWithStore<ExternalAccountsListQuery, ExternalAccountsListQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: ExternalAccountsList,
    variables: { limit: 100 },
  });

  return { externalAccountsList };
}) satisfies PageLoad;
