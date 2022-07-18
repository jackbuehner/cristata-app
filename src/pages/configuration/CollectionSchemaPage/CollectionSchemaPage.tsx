import { useApolloClient } from '@apollo/client';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactRouterPrompt from 'react-router-prompt';
import { PlainModal } from '../../../components/Modal';
import { Offline } from '../../../components/Offline';
import { Tab, TabBar } from '../../../components/Tabs';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { setCollection, setIsLoading } from '../../../redux/slices/collectionSlice';
import { MutationsTab } from './tabs/MutationsTab';
import { OptionsTab } from './tabs/OptionsTab';
import { QueriesTab } from './tabs/QueriesTab';
import { SchemaTab } from './tabs/SchemaTab';
import { useGetRawConfig } from './useGetRawConfig';

function CollectionSchemaPage() {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const { collection } = useParams() as { collection: string };
  const [raw, loadingInitial, error, _refetch] = useGetRawConfig(collection);

  // when refetching, also update redux with a fresh copy of the collection
  const refetch = useCallback(() => {
    _refetch().then(({ data }) => {
      if (data.configuration.collection?.raw) {
        dispatch(setCollection(JSON.parse(data.configuration.collection.raw)));
      }
    });
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
          action: () => null,
          disabled: true,
        },
      ])
    );
  }, [client, collection, dispatch, raw, refetch, state.isUnsaved]);

  const [activeTab, setActiveTab] = useState<number>(0);

  if (!raw && !navigator.onLine) {
    return <Offline variant={'centered'} />;
  }

  if (!raw && error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  if (!raw) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <TabBar
        activeTabIndex={activeTab}
        onActivate={(evt: { detail: { index: SetStateAction<number> } }) => setActiveTab(evt.detail.index)}
      >
        <Tab>Schema</Tab>
        <Tab>Queries</Tab>
        <Tab>Mutations</Tab>
        <Tab>Options</Tab>
      </TabBar>
      <div>
        {activeTab === 0 ? <SchemaTab /> : null}
        {activeTab === 1 ? <QueriesTab /> : null}
        {activeTab === 2 ? <MutationsTab /> : null}
        {activeTab === 3 ? <OptionsTab /> : null}
      </div>
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
                onClick: () => {
                  onConfirm(true);
                  return true;
                },
              }}
            />
          ) : null
        }
      </ReactRouterPrompt>
    </div>
  );
}

export { CollectionSchemaPage };
