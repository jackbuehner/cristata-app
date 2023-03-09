import {
  WorkflowComplete,
  type WorkflowCompleteQuery,
  type WorkflowCompleteQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, url }) => {
  const exclude: string[] = [];
  url.searchParams.forEach((value) => {
    exclude.push(...value.replace('[', '').replace(']', '').split(','));
  });

  const workflowComplete = queryWithStore<WorkflowCompleteQuery, WorkflowCompleteQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: WorkflowComplete,
    variables: { exclude },
  });

  return {
    workflowComplete: await workflowComplete,
  };
}) satisfies PageLoad;
