import { useTheme } from '@emotion/react';
import type { GenCollectionInput } from '@jackbuehner/cristata-api/dist/graphql/helpers/generators/genCollection';
import type { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import type { SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';
import ReactRouterPrompt from 'react-router-prompt';
import { toast } from 'react-toastify';
import { useLocation, useNavigate, useParams } from 'svelte-preprocess-react/react-router';
import { Spinner } from '../../../components/Loading';
import { PlainModal } from '../../../components/Modal';
import { Offline } from '../../../components/Offline';
import { Tab, TabBar } from '../../../components/Tabs';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { setCollection, setIsLoading } from '../../../redux/slices/collectionSlice';
import { Sidebar } from './Sidebar';
import { MutationsTab } from './tabs/MutationsTab';
import { OptionsTab } from './tabs/OptionsTab';
import { QueriesTab } from './tabs/QueriesTab';
import { SchemaTab } from './tabs/SchemaTab';
import { useGetRawConfig } from './useGetRawConfig';

import * as apolloRaw from '@apollo/client';
const { useApolloClient } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

function CollectionSchemaPage() {
  const theme = useTheme();
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const { collection } = useParams() as { collection: string };
  const [raw, loadingInitial, error, _refetch] = useGetRawConfig(collection);
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = location.pathname.split('/')[1];

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
    if (raw) document.title = `Edit schema - ${raw.name}`;
    else document.title = `Edit schema`;
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
      setAppName((state.isUnsaved ? '*' : '') + (raw ? `Edit schema - ${raw.name}` : `Edit collection schema`))
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
            if (state.collection) {
              // send the mutation
              setLoading(true);
              client
                .mutate<SaveMutationType>({
                  mutation: saveMutationString(state.collection.name, {
                    ...state.collection,
                  }),
                })
                .finally(() => {
                  setLoading(false);
                })
                .then(({ data }) => {
                  if (data?.setRawConfigurationCollection) {
                    dispatch(setCollection(JSON.parse(data.setRawConfigurationCollection)));
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

  const activeTabIndex = parseInt(location.hash[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ borderBottom: `1px solid ${theme.color.neutral[theme.mode][200]}` }}>
          <div
            style={{
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            <TabBar
              activeTabIndex={activeTabIndex}
              onActivate={(evt: { detail: { index: SetStateAction<number> } }) =>
                navigate(location.pathname + location.search + `#${evt.detail.index}`)
              }
            >
              <Tab>Schema</Tab>
              <Tab>Queries</Tab>
              <Tab>Mutations</Tab>
              <Tab>Options</Tab>
            </TabBar>
          </div>
        </div>
        <div style={{ height: 'calc(100% - 49px)', overflow: 'auto', flexGrow: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div>
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
                <>
                  {activeTabIndex === 0 ? <SchemaTab /> : null}
                  {activeTabIndex === 1 ? <QueriesTab /> : null}
                  {activeTabIndex === 2 ? <MutationsTab /> : null}
                  {activeTabIndex === 3 ? <OptionsTab /> : null}
                </>
              )}
            </div>
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
      </div>
      <div
        style={{ width: 300, borderLeft: `1px solid ${theme.color.neutral[theme.mode][200]}`, flexShrink: 0 }}
      >
        {raw ? <Sidebar activeTabIndex={activeTabIndex} /> : null}
      </div>
    </div>
  );
}

interface SaveMutationType {
  setRawConfigurationCollection?: string | null;
}

function saveMutationString(
  name: string,
  raw: GenCollectionInput & { skipAdditionalParsing?: boolean }
): DocumentNode {
  // tell the server to not parse objectIds and dates (leave them as strings)
  raw.skipAdditionalParsing = true;

  return gql`
    mutation {
      setRawConfigurationCollection(name: "${name}", raw: ${JSON.stringify(`${JSON.stringify(raw)}`)})
    }
  `;
}

export { CollectionSchemaPage };
