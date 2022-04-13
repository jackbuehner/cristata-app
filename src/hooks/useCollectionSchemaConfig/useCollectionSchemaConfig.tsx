import { ApolloError, ApolloQueryResult, DocumentNode, gql, useQuery } from '@apollo/client';
import {
  isSchemaDef,
  SchemaDef,
  isSchemaRef,
  SchemaDefType,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';

/**
 * Gets the collection config for the specified collection.
 *
 * Use the collection's singular name.
 */
function useCollectionSchemaConfig(name: string): [
  {
    schemaDef: [string, SchemaDef][];
    nameField?: string;
    canPublish: boolean;
    withPermissions: boolean;
    options?: { mandatoryWatchers?: string[] };
  },
  ApolloError | undefined,
  () => Promise<ApolloQueryResult<QueryType>>
] {
  const res = useQuery<QueryType>(queryString(name), { fetchPolicy: 'cache-first' });

  if (res.data?.configuration.collection) {
    const {
      schemaDef: schemaDefJson,
      canPublish,
      withPermissions,
      generationOptions,
    } = res.data.configuration.collection;
    const schemaDef: SchemaDefType = JSON.parse(schemaDefJson);
    return [
      {
        schemaDef: parseSchemaDefType(schemaDef),
        canPublish: canPublish || false,
        withPermissions: withPermissions || false,
        options: generationOptions,
      },
      res.error,
      res.refetch,
    ];
  }

  return [{ schemaDef: [], canPublish: false, withPermissions: false }, res.error, res.refetch];
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
          }
        }
      }
    }
  `;
}

function parseSchemaDefType(schemaDefObject: SchemaDefType, parentKey?: string) {
  let schemaDefs: [string, SchemaDef][] = [];

  Object.entries(schemaDefObject).forEach(([key, def]) => {
    const constructedKey = `${parentKey ? parentKey + '.' : ''}${key}`;

    // is a schema definition for a specific field
    if (isSchemaDef(def)) {
      schemaDefs.push([constructedKey, def]);
    }
    // is a reference to a field in another document
    else if (isSchemaRef(def)) {
    }
    // is an object containing schema defs, schema refs, and nested schemas
    else if (Array.isArray(def)) {
      schemaDefs.push(...parseSchemaDefType(def[0], constructedKey));
    }
    // is an object containing schema defs (nested schemas)
    else {
      schemaDefs.push(...parseSchemaDefType(def, constructedKey));
    }
  });

  return schemaDefs;
}

export { useCollectionSchemaConfig };
