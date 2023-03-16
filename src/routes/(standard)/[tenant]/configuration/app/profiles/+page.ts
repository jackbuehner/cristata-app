import {
  ProfilesAppSettings,
  type ProfilesAppSettingsQuery,
  type ProfilesAppSettingsQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import type { PageLoad } from './$types';
export const load = (async ({ params, fetch }) => {
  // get the configuration
  const profilesAppConfig = queryWithStore<ProfilesAppSettingsQuery, ProfilesAppSettingsQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: ProfilesAppSettings,
    useCache: false,
    waitForQuery: false,
  });

  return {
    profilesAppConfig,
    params,
  };
}) satisfies PageLoad;
