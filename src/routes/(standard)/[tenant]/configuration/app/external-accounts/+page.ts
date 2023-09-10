import {
  ExternalAccountsAppSettings,
  type ExternalAccountsAppSettingsQuery,
  type ExternalAccountsAppSettingsQueryVariables,
  type MutationPhotoCollectionSetActionAccessArgs,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
import type { PageLoad } from './$types';
export const load = (async ({ params, fetch }) => {
  // get the configuration
  const externalAccountsAppConfig = queryWithStore<
    ExternalAccountsAppSettingsQuery,
    ExternalAccountsAppSettingsQueryVariables
  >({
    fetch,
    tenant: params.tenant,
    query: ExternalAccountsAppSettings,
    useCache: false,
    waitForQuery: false,
    clearStoreBeforeFetch: true,
  });

  async function saveExternalAccountsAppConfigChanges(data: SaveChangesData) {
    let mutationSelectionSet = '';

    if (data.actionAccess) {
      mutationSelectionSet += `photoCollectionSetActionAccess(actionAccess: $actionAccess) {
        get {
          teams
        }
      }`;
    }

    const operation = `mutation SaveProfilesAppConfig($actionAccess: PhotoCollectionActionAccessInput!) {
      ${mutationSelectionSet}
    }`;

    await fetch(`${server.location}/v3/${params.tenant}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: operation,
        variables: { actionAccess: data.actionAccess },
      }),
    });
  }

  return {
    externalAccountsAppConfig,
    params,
    saveExternalAccountsAppConfigChanges,
  };
}) satisfies PageLoad;

interface SaveChangesData {
  actionAccess: MutationPhotoCollectionSetActionAccessArgs['actionAccess'];
}
