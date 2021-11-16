import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { PageHead } from '../../../components/PageHead';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTable, ICollectionTableImperative } from './CollectionTable';
import { ArrowClockwise16Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';
import { Button, IconButton } from '../../../components/Button';
import { collections as collectionsConfig } from '../../../config';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { collection } from '../../../config/collections';
import ReactTooltip from 'react-tooltip';
import { mongoFilterType } from '../../../graphql/client';
import { useDropdown } from '../../../hooks/useDropdown';
import { Menu } from '../../../components/Menu';

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
  tableFilters?: { id: string; value: string | boolean }[];
  mongoDataFilter?: mongoFilterType;
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
    mongoDataFilter: undefined,
  };

  // get the url parameters from the route
  let { collection, progress = '' } = useParams<{
    collection: string;
    progress: string;
  }>();

  const collectionConfig = collectionsConfig[dashToCamelCase(collection)];

  if (collectionConfig) {
    // set the collection for this page
    store.collection = collectionConfig;
    // set the collection name
    store.collectionName = collectionConfig.collectionName || collection;
    // set the page title
    store.pageTitle =
      // if defined, use the page title from the config
      store.collection.pageTitle?.(progress, location.search) ||
      // otherwise, build a title using the collection string
      collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ') + ' collection';
    // set the page description
    store.pageDescription = store.collection.pageDescription?.(progress, location.search);
    // set the data filter for mongoDB
    store.mongoDataFilter = store.collection.tableDataFilter?.(progress, location.search);
    // set the createNew function
    store.createNew = () => store.collection.createNew?.([isLoading, setIsLoading], toast, history);
  }

  // set document title
  useEffect(() => {
    document.title = `${store.pageTitle} - Cristata`;
  }, [store.pageTitle]);

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // tools dropdown
  const [showToolsDropdown] = useDropdown(
    (triggerRect, dropdownRef) => {
      return (
        <Menu
          ref={dropdownRef}
          pos={{
            top: triggerRect.bottom,
            left: triggerRect.left + triggerRect.width - 240,
            width: 240,
          }}
          items={[
            {
              label: 'Refresh data',
              icon: <ArrowClockwise16Regular />,
              onClick: () => tableRef.current?.refetchData(),
            },
          ]}
        />
      );
    },
    [],
    true,
    true
  );

  const tableRef = useRef<ICollectionTableImperative>(null);
  return (
    <>
      <PageHead
        title={store.pageTitle}
        description={store.pageDescription}
        isLoading={isLoading}
        buttons={
          <>
            {store.createNew ? <Button onClick={store.createNew}>Create new</Button> : null}
            <Button onClick={showToolsDropdown} showChevron>
              Tools
            </Button>
          </>
        }
      />
      <TableWrapper theme={theme}>
        <CollectionTable
          collection={store.collectionName}
          progress={progress}
          filters={store.tableFilters}
          filter={store.mongoDataFilter}
          ref={tableRef}
          setIsLoading={setIsLoading}
        />
      </TableWrapper>
    </>
  );
}

export { CollectionPage };
