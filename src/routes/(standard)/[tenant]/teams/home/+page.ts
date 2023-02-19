import {
  TeamUnassignedUsers,
  type TeamUnassignedUsersQuery,
  type TeamUnassignedUsersQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  // get the current user basic profile
  const unassignedUsers = await queryWithStore<TeamUnassignedUsersQuery, TeamUnassignedUsersQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: TeamUnassignedUsers,
    waitForQuery: false, // do not block page load
    useCache: false,
    expireCache: 5000, // 5 seconds
  });

  return { unassignedUsers };
}) satisfies PageLoad;
