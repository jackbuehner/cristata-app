import { Team, type TeamQuery, type TeamQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
  // get the current user basic profile
  const team = await queryWithStore<TeamQuery, TeamQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: Team,
    variables: { team_id: params.team_id },
    waitForQuery: false, // do not block page load
    useCache: false,
    expireCache: 5000, // 5 seconds
  });

  return { team };
}) satisfies PageLoad;
