import {
  CollectionConfig,
  type CollectionConfigQuery,
  type CollectionConfigQueryVariables,
} from '$graphql/graphql';
import { query } from '$graphql/query';
import { capitalize } from '$utils/capitalize';
import { dashToCamelCase } from '$utils/dashToCamelCase';
import { setProperty } from '$utils/objectPath';
import { deconstructSchema, type SchemaDefType } from '@jackbuehner/cristata-generator-schema';
import { isJSON } from '@jackbuehner/cristata-utils';
import { error } from '@sveltejs/kit';
import pluralize from 'pluralize';
import type { LayoutLoad } from './$types';

export const load = (async ({ params, fetch }) => {
  const collectionSchemaName = capitalize(pluralize.singular(dashToCamelCase(params.collection)));

  const collectionConfigResult = query<CollectionConfigQuery, CollectionConfigQueryVariables>({
    fetch,
    tenant: params.tenant,
    query: CollectionConfig,
    useCache: true,
    persistCache: 900000, // 15 minutes
    variables: { collectionName: collectionSchemaName },
  });

  const foundCollectionConfig = (await collectionConfigResult)?.data?.configuration?.collection;
  if (!foundCollectionConfig) throw error(500, 'No collection found');
  if (foundCollectionConfig?.name !== collectionSchemaName) throw error(500, 'Wrong collection found');

  return {
    collection: {
      schemaName: collectionSchemaName,
      colName: params.collection.replaceAll('-', ''),
      name: {
        singular: capitalize(pluralize.singular(params.collection.replaceAll('-', ' '))),
        plural: capitalize(
          (await collectionConfigResult)?.data?.configuration?.collection?.pluralName ||
            params.collection.replaceAll('-', ' ')
        ),
      },
      config: {
        ...foundCollectionConfig,
        canPublish: foundCollectionConfig.canPublish || false,
        withPermissions: foundCollectionConfig.canPublish || false,
      },
      deconstructedSchema: (() => {
        const schemaDefJson = foundCollectionConfig.schemaDef;
        if (!schemaDefJson || !isJSON(schemaDefJson)) return [];

        const schemaDef: SchemaDefType = JSON.parse(schemaDefJson);

        // ensure these fields are fetched when retreiving a document
        const hidden = { field: { hidden: true }, column: { hidden: true } };
        setProperty(schemaDef, 'timestamps.created_at', { type: 'Date', ...hidden });
        setProperty(schemaDef, 'timestamps.modified_at', { type: 'Date', ...hidden });
        setProperty(schemaDef, 'people.watching', { type: ['[User]', ['ObjectId']], ...hidden });
        setProperty(schemaDef, 'archived', { type: 'Boolean', ...hidden });
        setProperty(schemaDef, 'hidden', { type: 'Boolean', ...hidden });
        setProperty(schemaDef, 'locked', { type: 'Boolean', ...hidden });
        if (foundCollectionConfig.withPermissions) {
          setProperty(schemaDef, 'permissions.users', {
            type: ['[User]', ['ObjectId']],
            field: { reference: { forceLoadFields: ['photo'] } },
          });
          setProperty(schemaDef, 'permissions.teams', {
            type: ['String'],
            field: { reference: { collection: 'Team', fields: { _id: '_id', name: 'name' } } },
          });
        }
        if (foundCollectionConfig.canPublish) {
          setProperty(schemaDef, 'timestamps.published_at', { type: 'Date', ...hidden });
          setProperty(schemaDef, 'timestamps.updated_at', { type: 'Date', ...hidden });
          setProperty(schemaDef, '_hasPublishedDoc', { type: 'Boolean', ...hidden });
        }

        return deconstructSchema(schemaDef);
      })(),
    },
  };
}) satisfies LayoutLoad;
