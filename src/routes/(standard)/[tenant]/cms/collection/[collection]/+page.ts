import type { mongoFilterType } from '$graphql/client';
import { queryWithStore } from '$graphql/query';
import { docDefsToColumnQueryObject } from '$utils/docDefsToColumnQueryObject';
import { isJSON, uncapitalize } from '@jackbuehner/cristata-utils';
import { parse } from 'graphql';
import { VariableType, jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import type { PageLoad } from './$types';

const defaultFilter: mongoFilterType = { hidden: { $ne: true }, archived: { $ne: true } };

export const load = (async ({ params, parent, url, fetch, depends }) => {
  depends('collection-table');

  const { collection } = await parent();

  const filter = createMongoFilter(url.searchParams);
  const sort = (() => {
    // prefer to use the sort defined in localstorage
    const localStorageSortStr: string | null = localStorage.getItem(`table.${collection.schemaName}.sort`);
    const localStorageSort: Record<string, 1 | -1> = JSON.parse(localStorageSortStr || '{}');

    const sort: Record<string, 1 | -1> = { ...localStorageSort };

    // if sort is empty, use the default sort key and order because an empty sort object is invalid
    if (Object.keys(sort).length === 0) {
      const defaultSortKey =
        url.searchParams.get('__defaultSortKey') || collection.schemaName === 'Photo' ? '_id' : 'name';
      const defaultSortKeyOrder = url.searchParams.get('__defaultSortKeyOrder') === '1' ? 1 : -1;
      sort[defaultSortKey] = defaultSortKeyOrder;
    }

    return sort;
  })();

  //generate a GraphQL API query based on the collection
  const GENERATED_COLLECTION_QUERY = parse(
    jsonToGraphQLQuery(
      {
        query: {
          __name: 'CollectionTableData',
          __variables: {
            limit: `Int!`,
            filter: `JSON = ${JSON.stringify(JSON.stringify(filter))}`,
            sort: `JSON = ${JSON.stringify(JSON.stringify(sort))}`,
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
                { [collection.config.by?.one || '_id']: true },
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
                ...collection.deconstructedSchema.map(docDefsToColumnQueryObject)
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
          last_modified_by?: {
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
    expireCache: 1000 * 30, // 30 seconds
    variables: {
      limit: collection.schemaName === 'Photo' ? 100 : 20,
      filter: JSON.stringify(filter),
      sort: JSON.stringify(sort),
      collection: collection.schemaName,
      page: 1,
    },
  });

  return {
    params,
    table: {
      filter,
      sort,
      data: await tableData,
      schema: collection.deconstructedSchema,
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
