import type { ApolloError } from '@apollo/client';
import { NetworkStatus, useQuery } from '@apollo/client';
import type { CollectionPermissionsActions } from '@jackbuehner/cristata-api/dist/types/config';
import { isTypeTuple } from '@jackbuehner/cristata-generator-schema';
import { gql } from 'graphql-tag';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import type { EntryY } from '../../../components/Tiptap/hooks/useY';
import type { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { useAppDispatch } from '../../../redux/hooks';
import { setIsLoading } from '../../../redux/slices/cmsItemSlice';

function useFindDoc(
  collection: string,
  item_id: string,
  schemaDef: DeconstructedSchemaDefType,
  withPermissions: boolean,
  doNothing = false,
  accessor = '_id',
  y?: EntryY
): {
  data?: any;
  actionAccess?: Record<CollectionPermissionsActions, boolean | undefined>;
  loading: boolean;
  error: ApolloError | undefined;
} {
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
              },
              ...schemaDef.map(docDefsToQueryObjectLight)
            ),
          },
          [queryName + 'ActionAccess']: {
            modify: true,
            hide: true,
            lock: true,
            watch: true,
            archive: true,
            publish: true,
          },
        },
      },
      { pretty: true }
    )
  );

  // get the item
  const {
    loading,
    error,
    refetch: apolloRefetch,
    networkStatus,
    ...req
  } = useQuery(GENERATED_ITEM_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: doNothing ? 'cache-only' : 'network-only',
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

  const data = req.data?.[queryName];
  return { actionAccess, loading: !loading && !data && !error ? true : loading, error, data };
}

function docDefsToQueryObjectCols(
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType
): ReturnType<typeof deepen> {
  const [key, def] = input;

  const isSubDocArray = def.type === 'DocArray';
  const isObjectType = isTypeTuple(def.type);

  if (key === 'timestamps.published_at') {
    return deepen({ 'timestamps.published_at': true });
  }

  if (isObjectType && def.column?.hidden !== true) {
    // if there is a reference definition, use the fields in the def
    if (def.field?.reference) {
      return merge(
        deepen({ [key + '.' + (def.field.reference.fields?._id || '_id')]: true }),
        deepen({ [key + '.' + (def.field.reference.fields?.name || 'name')]: true }),

        // get the fields that are forced by the config
        ...(def.field.reference.forceLoadFields || []).map((field) => deepen({ [key + '.' + field]: true }))
      );
    }

    // otherwise, just get the id
    return deepen({ [key + '._id']: true });
  }

  if (isSubDocArray) {
    return merge<Record<string, never>, Record<string, never>[]>(
      {},
      ...def.docs.map(([key, def], index, arr) => {
        return docDefsToQueryObjectCols([key, def], index, arr);
      })
    );
  }

  // only get the field if it is used in the table
  if (def.column?.hidden !== true && !key.includes('#')) {
    return deepen({ [key]: true });
  }

  return deepen({ _id: true });
}

function docDefsToQueryObjectLight(
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType
): ReturnType<typeof deepen> {
  const [key, def] = input;

  const isSubDocArray = def.type === 'DocArray';
  const isObjectType = isTypeTuple(def.type);

  // get the reference fields that are forced by the config
  if (isObjectType && def.field?.reference) {
    return merge(
      {},
      ...(def.field.reference.forceLoadFields || []).map((field) => deepen({ [key + '.' + field]: true }))
    );
  }

  // send subdoc arrays through this function
  if (isSubDocArray) {
    return merge<Record<string, never>, Record<string, never>[]>(
      {},
      ...def.docs.map(([key, def], index, arr) => {
        return docDefsToQueryObjectLight([key, def], index, arr);
      })
    );
  }

  // require the _id field if no other field is required in the def
  return deepen({ _id: true });
}

export function deepen(obj: Record<string, boolean | { __aliasFor: string } | string | number | string[]>) {
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

export { docDefsToQueryObjectCols, useFindDoc };
