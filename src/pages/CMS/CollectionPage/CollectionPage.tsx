import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { PageHead } from '../../../components/PageHead';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTable, ICollectionTableImperative } from './CollectionTable';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { Button, IconButton } from '../../../components/Button';
import { collections as collectionsConfig } from '../../../config';
import { useMemo, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { collection } from '../../../config/collections';

const TableWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

interface IStore {
  collection: collection<any>;
  collectionName: string;
  pageTitle: string;
  pageDescription?: string;
  tableFilters?: { id: string; value: string }[];
  createNew?: () => void;
}

function CollectionPage() {
  const theme = useTheme() as themeType;
  const history = useHistory();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  let store: IStore = {
    collection: collectionsConfig.articles!, // placeholder
    collectionName: '',
    pageTitle: '',
    pageDescription: undefined,
    tableFilters: undefined,
  };

  // get the url parameters from the route
  let { collection, progress = '' } = useParams<{
    collection: string;
    progress: string;
  }>();

  const collectionConfig = collectionsConfig[dashToCamelCase(collection)]

  // set the collection for this page
  if (collectionConfig) {
    store.collection = collectionConfig;
  }

  // set the collection name
  if (collectionConfig) {
    store.collectionName = collectionConfig.collectionName || collection;
  }

  // set the page title
  store.pageTitle = useMemo(() => {
    if (store.collection.pageTitle) {
      // if defined, use the page title from the config
      return store.collection.pageTitle(progress, location.search);
    }
    // otherwise, build a title using the collection string
    return collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ') + ' collection';
  }, [progress, location.search, store.collection, collection]);

  // set the page description
  store.pageDescription = useMemo(() => {
    if (store.collection.pageDescription) {
      return store.collection.pageDescription(progress, location.search);
    }
  }, [progress, location.search, store.collection]);

  // set the table filters
  store.tableFilters = useMemo(() => {
    if (store.collection.tableFilters) {
      return store.collection.tableFilters(progress, location.search);
    }
  }, [progress, location.search, store.collection]);

  // set the createNew function
  if (store.collection.createNew) {
    // @ts-expect-error createNew is not undefined because we checked it on the above line
    store.createNew = () => store.collection.createNew([isLoading, setIsLoading], toast, history);
  }

  const tableRef = useRef<ICollectionTableImperative>(null);
  return (
    <>
      <PageHead
        title={store.pageTitle}
        description={store.pageDescription}
        isLoading={isLoading}
        buttons={
          <>
            <IconButton onClick={() => tableRef.current?.refetchData()} icon={<ArrowClockwise24Regular />}>
              Refresh
            </IconButton>
            {store.createNew ? <Button onClick={store.createNew}>Create new</Button> : null}
          </>
        }
      />
      <TableWrapper theme={theme}>
        <CollectionTable
          collection={store.collectionName}
          progress={progress}
          filters={store.tableFilters}
          ref={tableRef}
          setIsLoading={setIsLoading}
        />
      </TableWrapper>
    </>
  );
}

export { CollectionPage };
