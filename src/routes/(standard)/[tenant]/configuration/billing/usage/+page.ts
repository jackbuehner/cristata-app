import { ServiceUsage, type ServiceUsageQuery, type ServiceUsageQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  const serviceUsage = queryWithStore<ServiceUsageQuery, ServiceUsageQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: ServiceUsage,
    clearStoreBeforeFetch: false,
  });

  return { serviceUsage };
}) satisfies PageLoad;
