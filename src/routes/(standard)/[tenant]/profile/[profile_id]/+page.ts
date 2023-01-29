import {
  Profile,
  UserReferences,
  type ProfileQuery,
  type ProfileQueryVariables,
  type UserReferencesQuery,
  type UserReferencesQueryVariables,
} from '$graphql/graphql';
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
    expireCache: 5000, // 5 seconds
  });

  // get user basic profile
  const references = await queryWithStore<UserReferencesQuery, UserReferencesQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: UserReferences,
    variables: { _id: params.profile_id },
    waitForQuery: false, // do not block page load
    useCache: true,
    expireCache: 15 * 60 * 1000, // 15 minutes
  });

  return { profile, references };
}) satisfies PageLoad;
