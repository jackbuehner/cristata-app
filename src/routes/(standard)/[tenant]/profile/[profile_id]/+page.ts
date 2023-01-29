import { Profile, type ProfileQuery, type ProfileQueryVariables } from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  // get the current user basic profile
  const profile = await queryWithStore<ProfileQuery, ProfileQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: Profile,
    variables: { _id: params.profile_id },
    waitForQuery: true,
    useCache: true,
    expireCache: 5000,
  });

  return { profile };
}) satisfies PageLoad;
