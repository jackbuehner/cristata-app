import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { PageHead } from '../../../components/PageHead';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTable, ICollectionTableImperative } from './CollectionTable';
import { ArrowClockwise16Regular, Filter16Regular, FilterDismiss16Regular } from '@fluentui/react-icons';
import { Button } from '../../../components/Button';
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
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import { InputGroup } from '../../../components/InputGroup';
import { Label } from '../../../components/Label';
import { ErrorBoundary } from 'react-error-boundary';
import { TextInput } from '../../../components/TextInput';
import { MultiSelect } from '../../../components/Select';
import { isJSON } from '../../../utils/isJSON';

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

  // build a filter for the table based on url search params
  const defaultFilter: mongoFilterType = { hidden: { $ne: true } };
  new URLSearchParams(location.search).forEach((value, param) => {
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
    store.mongoDataFilter = store.collection.tableDataFilter?.(progress, location.search, defaultFilter);
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

  // filter modal
  const [showFilterModal, hideFilterModal] = useModal(() => {
    const searchParams = new URLSearchParams(location.search);

    const params: {
      [key: string]: { value: string | undefined | string[] | number[]; isNegated: boolean };
    } = {};

    const fields = collectionConfig?.fields
      .filter(({ subfield }) => !subfield)
      .filter(({ from }) => !from)
      .filter(({ modifyValue }) => !modifyValue)
      .filter(({ type }) => type === 'text' || type === 'select' || type === 'multiselect');

    fields?.forEach((field) => {
      const searchParam = field.key;
      const searchValue = searchParams.get(searchParam);

      if (searchValue) {
        const isNegated = searchValue[0] === '!';
        const isArray = isJSON(searchValue) && Array.isArray(JSON.parse(searchValue));

        if (isNegated && isArray) {
          params[searchParam] = {
            value: JSON.parse(searchValue.slice(1)).filter(
              (elem: unknown) => typeof elem === 'string' || typeof elem === 'number'
            ),
            isNegated,
          };
        } else if (isNegated && !isArray) {
          params[searchParam] = { value: searchValue.slice(1), isNegated };
        } else if (!isNegated && isArray) {
          params[searchParam] = {
            value: JSON.parse(searchValue).filter(
              (elem: unknown) => typeof elem === 'string' || typeof elem === 'number'
            ),
            isNegated,
          };
        } else if (!isNegated && !isArray) {
          params[searchParam] = { value: searchValue, isNegated };
        }
      }
    });

    return (
      <PlainModal
        hideModal={hideFilterModal}
        title={`Choose filters`}
        continueButton={{ text: 'Close' }}
        cancelButton={null}
      >
        <div>
          {fields?.map((field, index) => {
            const value = params[field.key]?.value;

            if (field.type === 'text' && (typeof value === 'string' || typeof value === 'undefined')) {
              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <TextInput
                      name={field.label}
                      id={field.key}
                      value={value}
                      onChange={(e) => searchParams.set(field.key, e.currentTarget.value)}
                      onBlur={() => history.replace(location.pathname + '?' + searchParams.toString())}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }

            if (field.type === 'select' || field.type === 'multiselect') {
              const valueIsArray = Array.isArray(value);
              const val = value
                ? valueIsArray
                  ? (value as unknown as string[] | number[])
                  : [value as unknown as string]
                : undefined;

              return (
                <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                  <InputGroup type={`text`}>
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <MultiSelect
                      options={field.options?.map(({ value, label }) => ({ value, label }))}
                      val={val?.map((v: string | number) => `${v}`)}
                      onChange={(opts) => {
                        if (opts?.length === 0) {
                          searchParams.delete(field.key);
                        } else {
                          searchParams.set(
                            field.key,
                            JSON.stringify(
                              opts?.map((opt: { label: string; value: string }) =>
                                field.dataType === 'number' ? parseFloat(opt.value as string) : opt.value
                              )
                            )
                          );
                        }
                        history.replace(location.pathname + '?' + searchParams.toString());
                      }}
                    />
                  </InputGroup>
                </ErrorBoundary>
              );
            }
            return (
              <ErrorBoundary key={index} fallback={<div>Error loading field '{field.key}'</div>}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <pre>{JSON.stringify(field)}</pre>
              </ErrorBoundary>
            );
          })}
        </div>
      </PlainModal>
    );
  }, [location.search]);

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
              onClick: showFilterModal,
            },
            {
              label: 'Clear filter',
              icon: <FilterDismiss16Regular />,
              onClick: () => history.push(location.pathname),
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
