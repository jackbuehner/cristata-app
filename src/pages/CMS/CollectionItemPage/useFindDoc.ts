import {
  ApolloError,
  ApolloQueryResult,
  gql,
  NetworkStatus,
  OperationVariables,
  useApolloClient,
  useQuery,
} from '@apollo/client';
import { isTypeTuple } from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { CollectionPermissionsActions } from '@jackbuehner/cristata-api/dist/api/types/config';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { EntryY } from '../../../components/Tiptap/hooks/useY';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
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
  actionAccess?: Record<CollectionPermissionsActions, boolean | undefined>;
  loading: boolean;
  error: ApolloError | undefined;
  refetch: (variables?: Partial<OperationVariables> | undefined) => Promise<ApolloQueryResult<any>>;
} {
  const dispatch = useAppDispatch();
  const client = useApolloClient();

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
                yState: true,
              },
              ...schemaDef.map(docDefsToQueryObject)
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

  const [shouldAddToY, setShouldAddToY] = useState(y?.unsavedFields.length === 0);

  // track how many times the doc has been refreshed
  const [count, setCount] = useState(0);

  // get the item
  const {
    loading,
    error,
    refetch: apolloRefetch,
    networkStatus,
    ...req
  } = useQuery(GENERATED_ITEM_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: doNothing ? 'cache-only' : 'no-cache',
    onCompleted(data) {
      // we should revert to remote state on subsequent refreshes,
      // but we do not revert on the first load so that there is
      // a chance to save local changes that were not previously saved
      const shouldRevert = count > 0;

      // if the data contains a doc state, apply it
      if (y?.ydoc && data?.[queryName]?.yState) {
        const yState = Uint8Array.from(atob(data[queryName].yState), (c) => c.charCodeAt(0));
        y.setState(yState, shouldRevert);
      }

      console.log(count);
    },
  });

  const refetch = (variables?: Partial<OperationVariables>) => {
    setCount((count) => count + 1);

    // reset the check for whether the data
    // should be injected into the ydoc
    setShouldAddToY(true);

    // refech the data
    return apolloRefetch(variables).then((data) => {
      if (
        y?.awareness.length === 1 &&
        y?.connected &&
        req.data?.[queryName] &&
        !req.data?.[queryName]?.yState
      ) {
        y.addData(req.data[queryName]);
      }
      return data;
    });
  };

  // only added data to yjs shared types
  // once the ydoc is connected, has
  // initially synced, and there are no
  // other clients, and the data does not
  // contain a ydoc
  useEffect(() => {
    if (
      y?.connected &&
      y.initialSynced &&
      shouldAddToY &&
      req.data?.[queryName] &&
      !req.data?.[queryName]?.yState
    ) {
      if (y?.awareness.length === 1) {
        y.addData(req.data[queryName]);
      }
      setShouldAddToY(false);
    }
  }, [client, queryName, req.data, schemaDef, shouldAddToY, y]);

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

  return { actionAccess, loading, error, refetch };
}

function docDefsToQueryObject(
  input: DeconstructedSchemaDefType[0],
  index: number,
  arr: DeconstructedSchemaDefType
): ReturnType<typeof deepen> {
  const [key, def] = input;

  const isSubDocArray = def.type === 'DocArray';
  const isObjectType = isTypeTuple(def.type);

  if (isObjectType) {
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
        return docDefsToQueryObject([key, def], index, arr);
      })
    );
  }

  return deepen({ [key]: true });
}

export function deepen(obj: Record<string, boolean | { __aliasFor: string } | string | number>) {
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

export { useFindDoc, docDefsToQueryObject };
