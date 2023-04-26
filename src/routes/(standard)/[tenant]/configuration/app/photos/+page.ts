import {
  PhotosAppSettings,
  type MutationPhotoCollectionSetActionAccessArgs,
  type PhotosAppSettingsQuery,
  type PhotosAppSettingsQueryVariables,
} from '$graphql/graphql';
import { queryWithStore } from '$graphql/query';
import { server } from '$utils/constants';
import type { PageLoad } from './$types';
export const load = (async ({ params, fetch }) => {
  // get the configuration
  const photosAppConfig = queryWithStore<PhotosAppSettingsQuery, PhotosAppSettingsQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: PhotosAppSettings,
    useCache: false,
    waitForQuery: false,
    clearStoreBeforeFetch: true,
  });

  async function savePhotosAppConfigChanges(data: SaveChangesData) {
    let mutationSelectionSet = '';

    if (data.fieldDescriptions) {
      mutationSelectionSet += `setPhotosAppFieldDescriptions(input: $fieldDescriptions)`;
    }

    if (data.actionAccess) {
      mutationSelectionSet += `photoCollectionSetActionAccess(actionAccess: $actionAccess) {
        get {
          teams
        }
      }`;
    }

    const operation = `mutation SaveProfilesAppConfig($actionAccess: PhotoCollectionActionAccessInput!, $fieldDescriptions: ConfigurationPhotosAppFieldDescriptionsInput!) {
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
    photosAppConfig,
    params,
    savePhotosAppConfigChanges,
  };
}) satisfies PageLoad;

type PhotosAppConfig = NonNullable<
  NonNullable<NonNullable<PhotosAppSettingsQuery['configuration']>['apps']>['photos']
>;
type fieldDescriptions = Omit<PhotosAppConfig['defaultFieldDescriptions'], '__typename'>;

interface SaveChangesData {
  fieldDescriptions: Partial<fieldDescriptions>;
  actionAccess: MutationPhotoCollectionSetActionAccessArgs['actionAccess'];
}
