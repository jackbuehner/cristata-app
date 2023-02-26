import {
  CollectionConfig,
  type CollectionConfigQuery,
  type CollectionConfigQueryVariables,
} from '$graphql/graphql';
import { query } from '$graphql/query';
import { capitalize } from '$utils/capitalize';
import { dashToCamelCase } from '$utils/dashToCamelCase';
import pluralize from 'pluralize';
import type { LayoutLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  const collectionSchemaName = capitalize(pluralize.singular(dashToCamelCase(params.collection)));

  const collectionConfig = query<CollectionConfigQuery, CollectionConfigQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: CollectionConfig,
    useCache: true,
    persistCache: 900000, // 15 minutes
    variables: { collectionName: collectionSchemaName },
  });

  return {
    collection: {
      schemaName: collectionSchemaName,
      colName: params.collection.replaceAll('-', ''),
      name: {
        singular: capitalize(pluralize.singular(params.collection.replaceAll('-', ' '))),
        plural:
          (await collectionConfig)?.data?.configuration?.collection?.pluralName ||
          capitalize(params.collection.replaceAll('-', ' ')),
      },
      config: await collectionConfig,
    },
  };
}) satisfies LayoutLoad;
