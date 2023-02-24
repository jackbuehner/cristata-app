import type { mongoFilterType } from '$graphql/client';
import { queryWithStore } from '$graphql/query';
import { docDefsToQueryObjectCols } from '$react/CMS/CollectionItemPage/useFindDoc';
import { gql } from '@apollo/client';
import { deconstructSchema } from '@jackbuehner/cristata-generator-schema';
import { isJSON, uncapitalize } from '@jackbuehner/cristata-utils';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import type { PageLoad } from './$types';

const defaultFilter: mongoFilterType = { hidden: { $ne: true }, archived: { $ne: true } };

export const load = (async ({ params, parent, url }) => {
  const { collection } = await parent();

  const deconstructedSchema = deconstructSchema(
    JSON.parse(collection.config?.data?.configuration?.collection?.schemaDef || '{}')
  );

  const filter = createMongoFilter(url.searchParams);

  // generate a GraphQL API query based on the collection
  const GENERATED_COLLECTION_QUERY = gql(
    jsonToGraphQLQuery(
      {
        query: {
          __name: 'CollectionTableData',
          __variables: {
            limit: `Int! = 20`,
            filter: `JSON = ${JSON.stringify(JSON.stringify(filter))}`,
            sort: `JSON = ${JSON.stringify(JSON.stringify({ stage: -1 }))}`,
            offset: `Int`,
          },
          data: {
            __aliasFor: uncapitalize(pluralize(collection.schemaName)),
            __args: {
              limit: new VariableType('limit'),
              filter: new VariableType('filter'),
              sort: new VariableType('sort'),
              offset: new VariableType('offset'),
            },
            totalDocs: true,
            docs: {
              ...merge(
                { _id: true },
                // field used for navigating to item editor
                { [collection.config?.data?.configuration?.collection?.by?.one || '_id']: true },
                // standard people and timestamps shown at the end of every table
                {
                  people: {
                    created_by: {
                      _id: true,
                      name: true,
                      photo: true,
                    },
                    last_modified_by: {
                      _id: true,
                      name: true,
                      photo: true,
                    },
                  },
                  timestamps: {
                    modified_at: true,
                  },
                },
                // fields used in the table columns
                ...deconstructedSchema.map(docDefsToQueryObjectCols)
              ),
            },
          },
          actionAccess: {
            __aliasFor: uncapitalize(collection.schemaName) + 'ActionAccess',
            archive: true,
            hide: true,
            create: true,
          },
        },
      },
      { pretty: false }
    )
  );

  // fetch the data for the collection docs table
  const tableData = queryWithStore<{
    data?: {
      totalDocs: number;
      docs?: {
        _id: string;
        people?: {
          created_by?: {
            _id: string;
            name: string;
            photo?: string;
          };
          crelast_modified_byated_by?: {
            _id: string;
            name: string;
            photo?: string;
          };
        };
        timestamps?: {
          modified_at?: string;
        };
        [key: string]: unknown;
      }[];
    };
    actionAccess?: {
      archive: boolean;
      hide: boolean;
      create: boolean;
    };
  }>({
    fetch,
    tenant: params.tenant,
    query: GENERATED_COLLECTION_QUERY,
    useCache: true,
    persistCache: 1000 * 30, // 30 seconds
  });

  return {
    params,
    table: {
      filter,
      data: await tableData,
      schema: deconstructedSchema,
    },
  };
}) satisfies PageLoad;

/**
 * Constructs a filter for the collection table that is
 * compatible with the filter query accepted by monogdb.
 */
function createMongoFilter(searchParams: URLSearchParams) {
  const filter = { ...defaultFilter };
  searchParams.forEach((value, param) => {
    // ignore values that start with two underscores because these are
    // parameters used in the page instead of filters
    if (param.indexOf('__') === 0) return;

    // if the param name is _search, search the text index
    if (param === '_search') {
      filter.$text = { $search: value };
      return;
    }

    // handle special filters, which are in the format key:filterName:filterValue
    if (value.includes(':') && value.split(':').length === 2) {
      const [filterName, filterValue] = value.split(':');

      if (filterName === 'size') {
        filter[param] = { $size: parseInt(filterValue) || 0 };
        return;
      }

      return;
    }

    const isNegated = param[0] === '!';
    const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

    const parseBooleanString = (str: string) => {
      if (str.toLowerCase() === 'true') return true;
      else if (str.toLowerCase() === 'false') return false;
      return undefined;
    };

    if (isNegated && isArray) filter[param.slice(1)] = { $nin: JSON.parse(value) };
    if (isNegated && !isArray)
      filter[param.slice(1)] = {
        $ne: parseBooleanString(value) !== undefined ? parseBooleanString(value) : parseFloat(value) || value,
      };
    if (!isNegated && isArray) filter[param] = { $in: JSON.parse(value) };
    if (!isNegated && !isArray)
      filter[param] = !isNaN(parseFloat(value))
        ? { $eq: parseFloat(value) }
        : parseBooleanString(value) !== undefined
        ? { $eq: parseBooleanString(value) }
        : { $regex: value, $options: 'i' };
  });
  return filter;
}
