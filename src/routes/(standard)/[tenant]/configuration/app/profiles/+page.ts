import {
  ProfilesAppSettings,
  type MutationUserCollectionSetActionAccessArgs,
  type ProfilesAppSettingsQuery,
  type ProfilesAppSettingsQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
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

  async function saveProfilesAppConfigChanges(data: SaveChangesData) {
    let mutationSelectionSet = '';

    if (data.fieldDescriptions) {
      mutationSelectionSet += `setProfilesAppFieldDescriptions(input: $fieldDescriptions)`;
    }

    if (data.actionAccess) {
      mutationSelectionSet += `userCollectionSetActionAccess(actionAccess: $actionAccess) {
        get {
          teams
        }
      }`;
    }

    const operation = `mutation SaveProfilesAppConfig($actionAccess: UserCollectionActionAccessInput!, $fieldDescriptions: ConfigurationProfilesAppFieldDescriptionsInput!) {
      ${mutationSelectionSet}
    }`;

    await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: operation,
        variables: { actionAccess: data.actionAccess, fieldDescriptions: data.fieldDescriptions },
      }),
    });
  }

  return {
    profilesAppConfig,
    params,
    saveProfilesAppConfigChanges,
  };
}) satisfies PageLoad;

type ProfileAppConfig = NonNullable<
  NonNullable<NonNullable<ProfilesAppSettingsQuery['configuration']>['apps']>['profiles']
>;
type fieldDescriptions = Omit<ProfileAppConfig['defaultFieldDescriptions'], '__typename'>;

interface SaveChangesData {
  fieldDescriptions: Partial<fieldDescriptions>;
  actionAccess: MutationUserCollectionSetActionAccessArgs['actionAccess'];
}
