import { useApolloClient } from '@apollo/client';
import { SetStateAction, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Offline } from '../../../components/Offline';
import { Tab, TabBar } from '../../../components/Tabs';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { OptionsTab } from './tabs/OptionsTab';
import { QueriesTab } from './tabs/QueriesTab';
import { MutationsTab } from './tabs/MutationsTab';
import { SchemaTab } from './tabs/SchemaTab';
import { useGetRawConfig } from './useGetRawConfig';
import { setCollection, setIsLoading } from '../../../redux/slices/collectionSlice';

function CollectionSchemaPage() {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const { collection } = useParams() as { collection: string };
  const [raw, loadingInitial, error, refetch] = useGetRawConfig(collection);

  useEffect(() => {
    if (raw) {
      dispatch(setCollection(raw));
    }
  }, [dispatch, raw]);

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
    dispatch(setAppName(raw ? `Edit schema - ${raw.name}` : `Edit collection schema`));
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
  }, [client, collection, dispatch, raw, refetch]);

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
        <Tab>Notices</Tab>
      </TabBar>
      <div>
        {activeTab === 0 ? <SchemaTab /> : null}
        {activeTab === 1 ? <QueriesTab /> : null}
        {activeTab === 2 ? <MutationsTab /> : null}
        {activeTab === 3 ? <OptionsTab /> : null}
      </div>
    </div>
  );
}

export { CollectionSchemaPage };
