import { useTheme } from '@emotion/react';
import type { GenCollectionInput } from '@jackbuehner/cristata-api/dist/graphql/helpers/generators/genCollection';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { useCallback, useEffect, useState } from 'react';
import ReactRouterPrompt from 'react-router-prompt';
import { toast } from 'react-toastify';
import { useParams } from 'svelte-preprocess-react/react-router';
import { Spinner } from '../../../components/Loading';
import { PlainModal } from '../../../components/Modal';
import { Offline } from '../../../components/Offline';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { setActionAccess, setCollection, setIsLoading } from '../../../redux/slices/collectionSlice';
import { ActionAccessCard } from '../CollectionSchemaPage/tabs/ActionAccessCard';
import { useGetRawConfig } from '../CollectionSchemaPage/useGetRawConfig';

import * as apolloRaw from '@apollo/client';
const { useApolloClient } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function SystemCollectionPage() {
  const theme = useTheme();
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const { collection } = useParams() as { collection: string };
  const [raw, loadingInitial, error, _refetch] = useGetRawConfig(collection);

  // when refetching, also update redux with a fresh copy of the collection
  const refetch = useCallback(async () => {
    const res = await _refetch();
    if (res.data.configuration.collection?.raw) {
      dispatch(setCollection(JSON.parse(res.data.configuration.collection.raw)));
    }
  }, [_refetch, dispatch]);

  // set the redux collection state on first load
  useEffect(() => {
    if (raw) {
      if (!state.collection || (state.collection && state.collection.name !== raw.name)) {
        dispatch(setCollection(raw));
      }
    }
  }, [dispatch, raw, state.collection]);

  // set document title
  useEffect(() => {
    if (raw) document.title = `Edit system collection options - ${raw.name}`;
    else document.title = `Edit system collection options`;
  }, [raw]);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(loadingInitial);
    dispatch(setIsLoading(loadingInitial));
  }, [dispatch, loadingInitial]);

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(loading));
  }, [dispatch, loading]);

  // configure app bar
  useEffect(() => {
    dispatch(
      setAppName(
        (state.isUnsaved ? '*' : '') +
          (raw ? `Edit system collection options - ${raw.name}` : `Edit collection schema`)
      )
    );
    dispatch(
      setAppActions([
        {
          label: 'Refresh data',
          type: 'icon',
          icon: 'ArrowClockwise24Regular',
          action: () => refetch(),
          'data-tip': `Discard changes and refresh`,
        },
        {
          label: 'Save',
          type: 'button',
          icon: 'Save24Regular',
          action: () => {
            if (state.collection?.name === 'File') {
              // send the mutation
              setLoading(true);
              client
                .mutate<SaveMutationTypeFile>({
                  mutation: saveMutationString('File'),
                  variables: {
                    actionAccess: state.collection.actionAccess,
                  },
                })
                .finally(() => {
                  setLoading(false);
                })
                .then(({ data }) => {
                  if (data?.fileCollectionSetActionAccess) {
                    const {
                      archive,
                      create,
                      delete: deleteAccess,
                      get,
                      hide,
                      lock,
                      modify,
                      watch,
                      bypassDocPermissions,
                      deactivate,
                      publish,
                    } = data.fileCollectionSetActionAccess;

                    if (archive) dispatch(setActionAccess('archive', archive));
                    if (create) dispatch(setActionAccess('create', create));
                    if (deleteAccess) dispatch(setActionAccess('delete', deleteAccess));
                    if (get) dispatch(setActionAccess('get', get));
                    if (hide) dispatch(setActionAccess('hide', hide));
                    if (lock) dispatch(setActionAccess('lock', lock));
                    if (modify) dispatch(setActionAccess('modify', modify));
                    if (watch) dispatch(setActionAccess('watch', watch));
                    if (bypassDocPermissions)
                      dispatch(setActionAccess('bypassDocPermissions', bypassDocPermissions));
                    if (deactivate) dispatch(setActionAccess('deactivate', deactivate));
                    if (publish) dispatch(setActionAccess('publish', publish));
                  }
                })
                .catch((error) => {
                  console.error(error);
                  toast.error(`Failed to save. \n ${error.message}`);
                  return false;
                });
            }
          },
          disabled: !state.isUnsaved,
        },
      ])
    );
  }, [client, collection, dispatch, raw, refetch, state.collection, state.isUnsaved]);

  return (
    <div style={{ height: '100%', overflow: 'auto', flexGrow: 1, padding: '0 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {!raw && !navigator.onLine ? (
          <Offline variant={'centered'} />
        ) : !raw && error ? (
          <pre>{JSON.stringify(error, null, 2)}</pre>
        ) : !raw ? (
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: theme.color.neutral[theme.mode][1500],
              fontFamily: theme.font.detail,
              height: 200,
            }}
          >
            <Spinner color={'neutral'} colorShade={1500} size={30} />
            <div>Loading configuration...</div>
          </div>
        ) : (
          <ActionAccessCard />
        )}
        {state.isUnsaved ? (
          <ReactRouterPrompt when={state.isUnsaved}>
            {({ isActive, onConfirm, onCancel }) =>
              isActive ? (
                <PlainModal
                  title={'Are you sure?'}
                  text={'You have unsaved changes that may be lost.'}
                  hideModal={() => onCancel(true)}
                  cancelButton={{
                    text: 'Go back',
                    onClick: () => {
                      onCancel(true);
                      return true;
                    },
                  }}
                  continueButton={{
                    color: 'red',
                    text: 'Yes, discard changes',
                    onClick: async () => {
                      await refetch();
                      onConfirm(true);
                      return true;
                    },
                  }}
                />
              ) : null
            }
          </ReactRouterPrompt>
        ) : null}
      </div>
    </div>
  );
}

interface SaveMutationTypeFile {
  fileCollectionSetActionAccess?: GenCollectionInput['actionAccess'];
}

function saveMutationString(name: 'File'): DocumentNode {
  return gql`
    mutation ($actionAccess: FileCollectionActionAccessInput!) {
      fileCollectionSetActionAccess(actionAccess: $actionAccess) {
        get {
          teams
          users
        }
        create {
          teams
          users
        }
        modify {
          teams
          users
        }
        hide {
          teams
          users
        }
        lock {
          teams
          users
        }
        watch {
          teams
          users
        }
        delete {
          teams
          users
        }
        archive {
          teams
          users
        }
        publish {
          teams
          users
        }
        bypassDocPermissions {
          teams
          users
        }
      }
    }
  `;
}

export { SystemCollectionPage };
