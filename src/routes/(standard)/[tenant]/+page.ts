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

export const load = (async ({ parent }) => {
  const { authUser } = await parent();

  // get the configuration
  const dashboardConfig = await query<DashboardConfigQuery, DashboardConfigQueryVariables>({
    tenant: authUser.tenant,
    query: DashboardConfig,
    useCache: true,
  });

  // get the number of documents in each stage
  const workflowCounts = await query<WorkflowCountsQuery, WorkflowCountsQueryVariables>({
    tenant: authUser.tenant,
    query: WorkflowCounts,
    useCache: true,
  });

  return {
    dashboardConfig: dashboardConfig?.data?.configuration?.dashboard,
    workflowCounts: workflowCounts?.data?.workflow || undefined,
  };
}) satisfies PageLoad;
