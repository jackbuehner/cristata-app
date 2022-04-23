import {
  ApolloError,
  ApolloQueryResult,
  gql,
  NetworkStatus,
  OperationVariables,
  useQuery,
} from '@apollo/client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import { SchemaDef, isTypeTuple } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { CollectionPermissionsActions } from '@jackbuehner/cristata-api/dist/types/config';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setIsLoading, setFields, clearUnsavedFields } from '../../../redux/slices/cmsItemSlice';
import { useEffect } from 'react';
import pluralize from 'pluralize';
import { get as getProperty } from 'object-path';

function useFindDoc(
  collection: string,
  item_id: string,
  schemaDef: [string, SchemaDef][],
  withPermissions: boolean,
  doNothing = false,
  accessor = '_id'
): {
  actionAccess?: Record<CollectionPermissionsActions, boolean | undefined>;
  loading: boolean;
  error: ApolloError | undefined;
  refetch: (variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<any>>;
} {
  const itemState = useAppSelector((state) => state.cmsItem);
  const dispatch = useAppDispatch();

  const queryName = pluralize.singular(collection);

  const GENERATED_ITEM_QUERY = gql(
    jsonToGraphQLQuery(
      {
        query: {
          [queryName]: {
            __args: {
              [accessor]: item_id,
            },
            ...merge(
              {
                [accessor]: true,
                timestamps: {
                  created_at: true,
                  modified_at: true,
                },
                people: {
                  watching: {
                    _id: true,
                  },
                },
              },
              withPermissions
                ? {
                    permissions: {
                      users: {
                        _id: true,
                        name: true,
                        photo: true,
                      },
                      teams: true,
                    },
                  }
                : {},
              ...schemaDef.map(([key, def]): Record<string, never> => {
                if (isTypeTuple(def.type)) {
                  if (def.field?.reference) {
                    return merge(
                      deepen({ [key + '.' + (def.field.reference.fields?._id || '_id')]: true }),
                      deepen({ [key + '.' + (def.field.reference.fields?.name || 'name')]: true }),

                      // get the fields that are forced by the config
                      ...(def.field.reference.forceLoadFields || []).map((field) =>
                        deepen({ [key + '.' + field]: true })
                      )
                    );
                  }
                  return deepen({ [key + '._id']: true });
                }

                return deepen({ [key]: true });
              })
            ),
          },
          [queryName + 'ActionAccess']: {
            modify: true,
            hide: true,
            lock: true,
            watch: true,
            publish: true,
          },
        },
      },
      { pretty: true }
    )
  );

  // get the item
  const { loading, error, refetch, networkStatus, ...req } = useQuery(GENERATED_ITEM_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    onCompleted(data) {
      // save the item to redux
      if (data?.[queryName] && doNothing !== true) {
        dispatch(setFields(data[queryName]));
      }
    },
  });

  let actionAccess: Record<CollectionPermissionsActions, boolean | undefined> | undefined =
    req.data?.[queryName + 'ActionAccess'];

  // if the query is loading or refetching, set `isLoading` in redux
  useEffect(() => {
    if ((loading || networkStatus === NetworkStatus.refetch) && doNothing !== true) {
      dispatch(setIsLoading(true));
    } else {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, doNothing, loading, networkStatus]);

  // on first load, clear the exist fields in redux
  const isSameDoc = getProperty(itemState.fields, accessor) === item_id;
  useEffect(() => {
    if (loading && doNothing !== true && !isSameDoc) {
      dispatch(clearUnsavedFields());
      dispatch(setFields({}));
    }
  }, [accessor, dispatch, doNothing, isSameDoc, itemState.fields, item_id, loading, networkStatus]);

  return { actionAccess, loading, error, refetch };
}

export function deepen(obj: Record<string, boolean | { __aliasFor: string }>) {
  const result: Record<string, never> = {};

  // For each object path (property key) in the object
  for (const objectPath in obj) {
    // Split path into component parts
    const parts = objectPath.split('.');

    // Create sub-objects along path as needed
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift() as string;
      target = target[part] = target[part] || {};
    }

    // Set value at end of path
    target[parts[0]] = obj[objectPath] as never;
  }

  return result;
}

export { useFindDoc };
