import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ArrowClockwise16Regular, Filter16Regular, FilterDismiss16Regular } from '@fluentui/react-icons';
import pluralize from 'pluralize';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useModal } from 'react-modal-hook';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { Button } from '../../../components/Button';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { Menu } from '../../../components/Menu';
import { PlainModal } from '../../../components/Modal';
import { PageHead } from '../../../components/PageHead';
import { TextInput } from '../../../components/TextInput';
import { collections as collectionsConfig } from '../../../config';
import { client, mongoFilterType } from '../../../graphql/client';
import { useDropdown } from '../../../hooks/useDropdown';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { isJSON } from '../../../utils/isJSON';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTable, ICollectionTableImperative } from './CollectionTable';

type CreateNewStateType = {
  /**
   * The fields that should appear in the modal.
   *
   * A field marked as required will display an indicator that it is required.
   * The `create` function is responsible for ensuring that the field has an
   * acceptable value.
   *
   * **Options**
   *
   * text: text field
   */
  fields: { type: 'text'; label: string; key: string; required?: true }[];
  /**
   * The state of the fields (the field values).
   *
   * When modifying other parts of this state object, be sure to
   * always copy this state object into the main state object. Failure to
   * do this will result in data loss.
   */
  state: Record<string, unknown>;
  /**
   * The function that executes after the user clicks the 'create' button.
   *
   * `args` is the resulting values from the modal fields defined in `fields`
   *
   * Return true to tell the app that the modal should close.
   * Return false to tell the app that the modal should stay open.
   */
  create: (args: CreateNewStateType['state']) => boolean;
};

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
  collectionName: string;
  pageTitle: string;
  pageDescription?: string;
  tableFilters?: { id: string; value: string | boolean }[];
  mongoDataFilter?: mongoFilterType;
  createNew?: () => void;
}

function CollectionPage() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  let store: IStore = {
    collectionName: '',
    pageTitle: '',
    pageDescription: undefined,
    tableFilters: undefined,
    mongoDataFilter: undefined,
  };

  // get the url parameters from the route
  let { collection = '', progress = '' } = useParams();

  // get the search params so we can get filters and other page data
  const searchParams = new URLSearchParams(location.search);

  // build a filter for the table based on url search params
  const defaultFilter: mongoFilterType = { hidden: { $ne: true } };
  searchParams.forEach((value, param) => {
    // ignore values that start with two underscores because these are
    // parameters used in the page instead of filters
    if (param.indexOf('__') === 0) return;

    const isNegated = param[0] === '!';
    const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

    if (isNegated && isArray) defaultFilter[param.slice(1)] = { $nin: JSON.parse(value) };
    if (isNegated && !isArray) defaultFilter[param.slice(1)] = { $ne: parseFloat(value) || value };
    if (!isNegated && isArray) defaultFilter[param] = { $in: JSON.parse(value) };
    if (!isNegated && !isArray)
      defaultFilter[param] = !isNaN(parseFloat(value))
        ? { $eq: parseFloat(value) }
        : { $regex: value, $options: 'i' };
  });

  // store the fields and state for the createNew modal
  const [createNewState, setCreateNewState] = useState<CreateNewStateType>({
    fields: [],
    state: {},
    create: () => true,
  });

  const collectionConfig = collectionsConfig[capitalize(pluralize.singular(dashToCamelCase(collection)))];

  if (collectionConfig) {
    // set the collection name
    store.collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));
    // set the page title
    store.pageTitle =
      // if defined, attempt to use the page title in the query string
      searchParams.get('__pageTitle') ||
      // otherwise, build a title using the collection string
      collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ') + ' collection';
    // set the page description
    store.pageDescription =
      searchParams.get('__pageCaption') ||
      decodeURIComponent(location.search.slice(1)).split('&').join(' AND ');
    // set the data filter for mongoDB
    store.mongoDataFilter = defaultFilter;
    // set the createNew function
    store.createNew = () =>
      collectionConfig.createNew?.([isLoading, setIsLoading], client, toast, navigate, {
        state: [createNewState, setCreateNewState],
        modal: [showCreateNewModal, hideCreateNewModal],
      });
  }

  // set document title
  useEffect(() => {
    document.title = `${store.pageTitle} - Cristata`;
  }, [store.pageTitle]);

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // createNew modal
  const [showCreateNewModal, hideCreateNewModal] = useModal(() => {
    return (
      <PlainModal
        hideModal={hideCreateNewModal}
        title={`Create new`}
        isLoading={isLoading}
        continueButton={{
          text: 'Create',
          onClick: () => {
            createNewState.create(createNewState.state);
            return false;
          },
        }}
      >
        {createNewState.fields.map((field, index) => {
          const value = createNewState.state[field.key];

          if (field.type === 'text' && (typeof value === 'string' || typeof value === 'undefined')) {
            return (
              <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                <InputGroup type={`text`}>
                  <Label htmlFor={field.key}>{`${field.label}${field.required ? '*' : ''}`}</Label>
                  <TextInput
                    name={field.label}
                    id={field.key}
                    value={value}
                    onChange={(e) =>
                      setCreateNewState({
                        ...createNewState,
                        state: {
                          ...createNewState.state,
                          [field.key]: e.currentTarget.value,
                        },
                      })
                    }
                  />
                </InputGroup>
              </ErrorBoundary>
            );
          }
          return null;
        })}
      </PlainModal>
    );
  }, [createNewState, isLoading]);

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
            {
              label: 'Filter',
              icon: <Filter16Regular />,
              onClick: () => null,
              disabled: true,
              'data-tip': 'Filtering is currently unavailable.',
            },
            {
              label: 'Clear filter',
              icon: <FilterDismiss16Regular />,
              onClick: () => navigate(location.pathname),
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
            <Button
              onClick={(e) => {
                // refetch data on shift click
                if (e.ctrlKey || e.metaKey) tableRef.current?.refetchData();
                // otherwise, open dropdown
                else showToolsDropdown(e);
              }}
              onAuxClick={({ button }) => {
                // refetch data on middle click
                if (button === 1) tableRef.current?.refetchData();
              }}
              data-tip={`${
                // @ts-expect-error userAgentData exists
                navigator.userAgentData?.platform === 'macOS' ? 'cmd' : 'ctrl'
              } + click to refresh data`}
              showChevron
            >
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
export type { CreateNewStateType };
