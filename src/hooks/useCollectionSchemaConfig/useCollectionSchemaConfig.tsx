import { ApolloError, ApolloQueryResult, DocumentNode, gql, useQuery } from '@apollo/client';
import {
  isSchemaDef,
  SchemaDef,
  isSchemaRef,
  SchemaDefType,
  SchemaType,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';

/**
 * Gets the collection config for the specified collection.
 *
 * Use the collection's singular name.
 */
function useCollectionSchemaConfig(name: string): [
  {
    schemaDef: DeconstructedSchemaDefType;
    canPublish: boolean;
    withPermissions: boolean;
    options?: { mandatoryWatchers?: string[]; previewUrl?: string; nameField?: string };
    by: { one: string; many: string } | null;
  },
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(name), { fetchPolicy: 'cache-first' });

  // ensure the collection data is present
  // and that the correct collection is being provided
  if (res.data?.configuration.collection && res.data?.configuration.collection.name === name) {
    const {
      schemaDef: schemaDefJson,
      canPublish,
      withPermissions,
      generationOptions,
      by,
    } = res.data.configuration.collection;
    const schemaDef: SchemaDefType = JSON.parse(schemaDefJson);
    return [
      {
        schemaDef: parseSchemaDefType(schemaDef),
        canPublish: canPublish || false,
        withPermissions: withPermissions || false,
        options: generationOptions,
        by,
      },
      res.error,
      res.refetch,
    ];
  }

  return [{ schemaDef: [], canPublish: false, withPermissions: false, by: null }, res.error, res.refetch];
}

interface QueryType {
  configuration: {
    collection?: {
      name: string;
      canPublish?: boolean;
      withPermissions?: boolean;
      schemaDef: string; // JSON
      generationOptions?: {
        mandatoryWatchers?: string[];
      };
      by: {
        one: string;
        many: string;
      };
    };
  };
}

function queryString(name: string): DocumentNode {
  return gql`
    query collectionConfigurationCollection${name} {
      configuration {
        collection(name: "${name}") {
          name
          canPublish
          withPermissions
          schemaDef
          generationOptions {
            mandatoryWatchers
            previewUrl
            nameField
          }
          by {
            one
            many
          }
        }
      }
    }
  `;
}

interface AppSchemaDef<T extends SchemaType | 'DocArray' = SchemaType> extends Omit<SchemaDef, 'type'> {
  type: T;
  docs: T extends 'DocArray' ? DeconstructedSchemaDefType : undefined;
}
type DeconstructedSchemaDefType = [string, AppSchemaDef | AppSchemaDef<'DocArray'>][];

function parseSchemaDefType(schemaDefObject: SchemaDefType, parentKey?: string) {
  let schemaDefs: DeconstructedSchemaDefType = [];

  Object.entries(schemaDefObject).forEach(([key, def]) => {
    const constructedKey = `${parentKey ? parentKey + '.' : ''}${key}`;

    // is a schema definition for a specific field
    if (isSchemaDef(def)) {
      schemaDefs.push([constructedKey, { ...def, docs: undefined }]);
    }
    // is a reference to a field in another document
    else if (isSchemaRef(def)) {
    }
    // is an array containing schema defs (stored in db as an array of subdocuments)
    else if (Array.isArray(def)) {
      schemaDefs.push([constructedKey, { type: 'DocArray', docs: parseSchemaDefType(def[0], constructedKey) }]);
    }
    // is an object containing schema defs (nested schemas)
    else {
      schemaDefs.push(...parseSchemaDefType(def, constructedKey));
    }
  });

  return schemaDefs;
}

export type { AppSchemaDef, DeconstructedSchemaDefType };
export { useCollectionSchemaConfig, parseSchemaDefType };
