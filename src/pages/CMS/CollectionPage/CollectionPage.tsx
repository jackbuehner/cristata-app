import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ArrowClockwise16Regular, Filter16Regular, FilterDismiss16Regular } from '@fluentui/react-icons';
import pluralize from 'pluralize';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Button } from '../../../components/Button';
import { Menu } from '../../../components/Menu';
import { PageHead } from '../../../components/PageHead';
import { mongoFilterType } from '../../../graphql/client';
import { useDropdown } from '../../../hooks/useDropdown';
import { capitalize } from '../../../utils/capitalize';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { isJSON } from '../../../utils/isJSON';
import { themeType } from '../../../utils/theme/theme';
import { CollectionTable, ICollectionTableImperative } from './CollectionTable';
import { useNewItemModal } from './useNewItemModal';

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
  position: relative;
  padding: 20px;
  overflow: hidden;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

function CollectionPage() {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  // get the url parameters from the route
  let { collection = '' } = useParams();

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

  // set the collection name
  const collectionName = capitalize(pluralize.singular(dashToCamelCase(collection)));
  // set the page title
  const pageTitle =
    // if defined, attempt to use the page title in the query string
    searchParams.get('__pageTitle') ||
    // otherwise, build a title using the collection string
    collection.slice(0, 1).toLocaleUpperCase() + collection.slice(1).replace('-', ' ') + ' collection';
  // set the page description
  const pageDescription =
    searchParams.get('__pageCaption') || decodeURIComponent(location.search.slice(1)).split('&').join(' AND ');
  // set the data filter for mongoDB
  const mongoDataFilter = defaultFilter;

  // set document title
  useEffect(() => {
    document.title = `${pageTitle} - Cristata`;
  }, [pageTitle]);

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // createNew modal
  const [createNew] = useNewItemModal(collectionName, navigate);

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

  // track table items that have been selected
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string>();

  const tableRef = useRef<ICollectionTableImperative>(null);
  return (
    <>
      <PageHead
        title={pageTitle}
        description={pageDescription}
        isLoading={isLoading}
        buttons={
          <>
            <Button onClick={createNew}>Create new</Button>
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
          collection={collectionName}
          filter={mongoDataFilter}
          ref={tableRef}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          selectedIdsState={[selectedIds, setSelectedIds]}
          lastSelectedIdState={[lastSelectedId, setLastSelectedId]}
        />
      </TableWrapper>
    </>
  );
}

export { CollectionPage };
export type { CreateNewStateType };
