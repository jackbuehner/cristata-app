import {
  DashboardConfig,
  WorkflowCounts,
  type DashboardConfigQuery,
  type DashboardConfigQueryVariables,
  type WorkflowCountsQuery,
  type WorkflowCountsQueryVariables,
} from '$graphql/graphql';
import { query } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  // get the configuration
  const dashboardConfig = query<DashboardConfigQuery, DashboardConfigQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: DashboardConfig,
    useCache: true,
  });

  // get the number of documents in each stage
  const workflowCounts = query<WorkflowCountsQuery, WorkflowCountsQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: WorkflowCounts,
    useCache: true,
  });

  return {
    dashboardConfig: (await dashboardConfig)?.data?.configuration?.dashboard,
    workflowCounts: (await workflowCounts)?.data?.workflow || undefined,
    params,
  };
}) satisfies PageLoad;
