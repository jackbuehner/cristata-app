import { BillingStatus, type BillingStatusQuery, type BillingStatusQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  const billingStatus = queryWithStore<BillingStatusQuery, BillingStatusQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: BillingStatus,
    clearStoreBeforeFetch: false,
  });

  return { billingStatus };
}) satisfies PageLoad;
