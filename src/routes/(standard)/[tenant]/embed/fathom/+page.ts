import {
  FathomDashboard,
  type FathomDashboardQuery,
  type FathomDashboardQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  const fathomDashboard = await queryWithStore<FathomDashboardQuery, FathomDashboardQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: FathomDashboard,
    waitForQuery: true,
    useCache: true,
    persistCache: 1000 * 60 * 60 * 24 * 14, // 2 weeks
  });

  return { fathomDashboard: get(fathomDashboard).data?.fathomDashboard };
}) satisfies PageLoad;
