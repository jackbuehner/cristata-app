import {
  ActivitiesList,
  DashboardConfig,
  WorkflowCounts,
  type ActivitiesListQuery,
  type ActivitiesListQueryVariables,
  type DashboardConfigQuery,
  type DashboardConfigQueryVariables,
  type WorkflowCountsQuery,
  type WorkflowCountsQueryVariables,
} from '$graphql/graphql';
import { query, queryWithStore } from '$graphql/query';
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

  const recentActivity = queryWithStore<ActivitiesListQuery, ActivitiesListQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: ActivitiesList,
    variables: { limit: 25, filter: JSON.stringify({ colName: { $nin: ['User'] } }) },
    clearStoreBeforeFetch: false,
  });

  return {
    dashboardConfig: (await dashboardConfig)?.data?.configuration?.dashboard,
    workflowCounts: (await workflowCounts)?.data?.workflow || undefined,
    params,
    recentActivity,
  };
}) satisfies PageLoad;
