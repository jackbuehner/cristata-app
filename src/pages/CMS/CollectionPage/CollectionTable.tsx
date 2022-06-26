import { gql, NetworkStatus, useApolloClient, useQuery } from '@apollo/client';
import { css, Global, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Archive20Regular, Delete20Regular, Open20Regular } from '@fluentui/react-icons';
import { isTypeTuple, SchemaDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { CircularProgress } from '@material-ui/core';
import Color from 'color';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { DateTime } from 'luxon';
import { merge } from 'merge-anything';
import { get as getProperty } from 'object-path';
import pluralize from 'pluralize';
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { Chip } from '../../../components/Chip';
import { Offline } from '../../../components/Offline';
import { Table } from '../../../components/Table';
import { mongoFilterType, mongoSortType } from '../../../graphql/client';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { useWindowModal } from '../../../hooks/useWindowModal';
import { camelToDashCase } from '../../../utils/camelToDashCase';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { docDefsToQueryObject } from '../CollectionItemPage/useFindDoc';

interface ICollectionTable {
  collection: string;
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  filter?: mongoFilterType;
  ref?: React.RefObject<ICollectionTableImperative>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  selectedIdsState: [string[], Dispatch<SetStateAction<string[]>>];
  lastSelectedIdState: [string | undefined, Dispatch<SetStateAction<string | undefined>>];
}

interface ICollectionTableImperative {
  /**
   * Refetch the data for the table.
   *
   * The number of rows will be reduced to the standard length when the data is fetchd.
   */
  refetchData(): void;
  /**
   * Reset the table sort filters back to default.
   */
  resetSort(): void;
}

const CollectionTable = forwardRef<ICollectionTableImperative, ICollectionTable>(
  ({ setIsLoading, ...props }, ref) => {
    const theme = useTheme() as themeType;
    const client = useApolloClient();
    const { pathname, search } = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(search), [search]);
    const [selectedIds, setSelectedIds] = props.selectedIdsState;
    const [, setLastSelectedId] = props.lastSelectedIdState;

    // calculate the approximate number of rows that can be visible on the display
    const rowDisplayCountEstimate = Math.floor((window.innerHeight - 100) / 38);

    // find the previous sort object from localStorage (might not be defined)
    const previousSort = localStorage.getItem(`table.${props.collection}.sort`);

    // construct a default sort object based on the `defaultSortKey` found in the collection config
    const parseSortOrder = (input: string | undefined | null): -1 | 1 => (input === '-1' ? -1 : 1);
    const defaultSort = useMemo<mongoSortType>(
      () => ({
        [searchParams.get('__defaultSortKey') || '_id']: parseSortOrder(
          searchParams.get('__defaultSortKeyOrder')
        ),
      }),
      [searchParams]
    );

    // clear selection when pathname or search string changes
    useEffect(() => {
      setSelectedIds([]);
    }, [pathname, search, setSelectedIds]);

    // keep the sort object in state
    const [sort, setSort] = useState<mongoSortType>(previousSort ? JSON.parse(previousSort) : defaultSort);

    // ensure sort object is never empty by falling back to the default sort object
    useEffect(() => {
      if (localStorage)
        localStorage.setItem(
          `table.${props.collection}.sort`,
          JSON.stringify(Object.keys(sort).length === 0 ? defaultSort : sort)
        );
    }, [defaultSort, props.collection, sort]);

    // get the schema for the collection so we can get the required fields and create the correct columns
    const [{ schemaDef, by }] = useCollectionSchemaConfig(props.collection);

    // generate a GraphQL API query based on the collection
    const GENERATED_COLLECTION_QUERY = gql(
      jsonToGraphQLQuery(
        {
          query: {
            __variables: {
              limit: `Int! = 20`,
              filter: `JSON = ${JSON.stringify(JSON.stringify(props.filter || {}))}`,
              sort: `JSON = ${JSON.stringify(
                JSON.stringify(Object.keys(sort).length === 0 ? defaultSort : sort)
              )}`,
              offset: `Int`,
            },
            [uncapitalize(pluralize(props.collection))]: {
              __args: {
                limit: new VariableType('limit'),
                filter: new VariableType('filter'),
                sort: new VariableType('sort'),
                offset: new VariableType('offset'),
              },
              totalDocs: true,
              docs: {
                ...merge(
                  { _id: true },
                  // field used for navigating to item editor
                  { [by?.one || '_id']: true },
                  // standard people and timestamps shown at the end of every table
                  {
                    people: {
                      created_by: {
                        _id: true,
                        name: true,
                        photo: true,
                      },
                      last_modified_by: {
                        _id: true,
                        name: true,
                        photo: true,
                      },
                    },
                    timestamps: {
                      modified_at: true,
                    },
                  },
                  // fields used in the table columns
                  ...schemaDef.map(docDefsToQueryObject)
                ),
              },
            },
          },
        },
        { pretty: true }
      )
    );

    const defaultLimit = rowDisplayCountEstimate + 20;
    const [limit, setLimit] = useState<number>(defaultLimit);
    const [prevSort, setPrevSort] = useState<mongoSortType>(defaultSort);

    const [queryLimit, setQueryLimit] = useState<number>(limit);
    useEffect(() => {
      if (JSON.stringify(sort) !== JSON.stringify(prevSort)) setQueryLimit(limit);
    }, [limit, prevSort, sort]);

    // get the collection data
    const {
      data: queryData,
      loading,
      error,
      refetch,
      networkStatus,
      fetchMore,
    } = useQuery(GENERATED_COLLECTION_QUERY, {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
      variables: { limit: queryLimit },
      onCompleted: (queryData) => {
        const data = queryData?.[uncapitalize(pluralize(props.collection))];

        // if the length of the data is less than it is supposed to be, find
        // the difference and fetch the missing amount of data
        const targetLength = queryLimit;
        const actualLength = data?.docs.length;
        const maxLength = data?.totalDocs;
        const lengthBehindTargetLength = targetLength - actualLength;
        if (lengthBehindTargetLength > 0 && actualLength < maxLength) {
          fetchMore({
            variables: {
              limit: lengthBehindTargetLength,
              offset: data.length,
            },
          });
        }
      },
    });
    let data = queryData?.[uncapitalize(pluralize(props.collection))];
    let docs = data?.docs;

    // manage loading state
    useEffect(() => {
      if (loading) setIsLoading(true);
      else if (networkStatus === NetworkStatus.refetch) setIsLoading(true);
      else if (error) setIsLoading(false);
      else setIsLoading(false);
    }, [loading, error, networkStatus, setIsLoading]);

    // make functions available to the parent element via a ref
    useImperativeHandle(ref, () => ({
      refetchData() {
        refetch();
        setSelectedIds([]);
        setLastSelectedId(undefined);
      },
      resetSort() {
        setSort({});
      },
    }));

    type CustomColumn = Column & { isSortable: boolean };

    const accessor = (data: any, key: string, def: SchemaDef) => {
      const fieldData = getProperty(data, key);

      if (def.column?.reference?.collection || isTypeTuple(def.type)) {
        const collection = isTypeTuple(def.type)
          ? def.type[0].replace('[', '').replace(']', '')
          : def.field!.reference!.collection!;

        const refData = Array.isArray(fieldData) ? fieldData : [fieldData];
        const refDataWithStandardKeys = refData.map((data) => {
          return {
            _id: getProperty(data, def.column?.reference?.fields?._id || '_id'),
            name: getProperty(data, def.column?.reference?.fields?.name || 'name'),
            photo: getProperty(data, 'photo'),
          };
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '2px 0' }}>
            {refDataWithStandardKeys.map((data, index: number) => {
              const name = data.name ? `${data.name}` : undefined;
              const _id = data._id ? `${data._id}` : undefined;
              const photo = data.photo ? `${data.photo}` : undefined;
              if (_id) {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} key={index}>
                    {collection === 'User' ? (
                      <img
                        src={photo ? photo : _id ? genAvatar(_id) : ''}
                        alt={``}
                        style={{ width: 20, height: 20, borderRadius: '50%' }}
                      />
                    ) : null}
                    <span style={{ fontSize: 14 }}>{name || _id}</span>
                  </div>
                );
              }
              return <span />;
            })}
          </div>
        );
      }

      if (Array.isArray(fieldData))
        return (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '2px 0', flexWrap: 'wrap' }}>
            {fieldData.map((entry: any, index: number) => {
              let stringValue: string;
              try {
                stringValue = entry.toString();
              } catch {
                stringValue = JSON.stringify(entry);
              }

              if (def.column?.chips) {
                if (typeof def.column.chips === 'boolean') {
                  return <Chip label={stringValue} color={'neutral'} data-value={stringValue} />;
                }

                const match = def.column.chips.find(
                  (s) => s.value === stringValue || s.value === parseInt(stringValue)
                );
                return (
                  <Chip
                    label={match?.label || stringValue}
                    color={match?.color || 'neutral'}
                    data-value={stringValue}
                  />
                );
              }
              return <span key={index}>{stringValue}</span>;
            })}
          </div>
        );

      if (typeof fieldData === 'string') {
        if (def.type === 'Date') {
          const date = DateTime.fromISO(fieldData).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
          return <span style={{ fontSize: 14 }}>{date}</span>;
        }

        if (def.column?.chips) {
          if (typeof def.column.chips === 'boolean') {
            return (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '2px 0', flexWrap: 'wrap' }}>
                <Chip label={fieldData} color={'neutral'} data-value={fieldData} />
              </div>
            );
          }

          const match = def.column.chips.find((s) => s.value === fieldData || s.value === parseInt(fieldData));
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '2px 0', flexWrap: 'wrap' }}>
              <Chip
                label={match?.label || fieldData}
                color={match?.color || 'neutral'}
                data-value={fieldData}
              />
            </div>
          );
        }

        return fieldData;
      }

      if (typeof fieldData === 'number') {
        if (def.column?.chips) {
          if (typeof def.column.chips === 'boolean') {
            return (
              <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '2px 0', flexWrap: 'wrap' }}>
                <Chip label={`${fieldData}`} color={'neutral'} data-value={fieldData} />
              </div>
            );
          }

          const match = def.column.chips.find((s) => s.value === fieldData);
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '2px 0', flexWrap: 'wrap' }}>
              <Chip
                label={match?.label || `${fieldData}`}
                color={match?.color || 'neutral'}
                data-value={fieldData}
              />
            </div>
          );
        }

        return fieldData;
      }
      return JSON.stringify(fieldData); // objects and arrays
    };

    // build the columns based on the config
    const columns: CustomColumn[] = useMemo(() => {
      return [
        {
          Header: '__cb',
          id: '__cb',
          accessor: (data: { _id?: unknown }) => {
            if (data._id && typeof data._id === 'string')
              return (
                <RowCheckbox
                  id={data._id}
                  selectedIdsState={props.selectedIdsState}
                  lastSelectedIdState={props.lastSelectedIdState}
                />
              );
            return null;
          },
          width: 42,
          isSortable: false,
        },
        ...schemaDef
          .sort((a, b) => {
            if ((a[1].column?.order || 1000) > (b[1].column?.order || 1000)) return 1;
            return -1;
          })
          .filter(([key]) => {
            if (key === 'permissions.users') return false;
            if (key === 'permissions.teams') return false;
            return true;
          })
          .map(([key, def]): CustomColumn | null => {
            // an array of documents can not be represented by a column
            const isSubDocArray = def.type === 'DocArray';
            if (isSubDocArray) return null;

            if (def.column?.hidden !== true) {
              if (def.column) {
                return {
                  Header: def.column.label || key,
                  id: key,
                  accessor: (data) => accessor(data, key, def),
                  width: def.column.width || 150,
                  isSortable: def.column.sortable || false,
                };
              }
              return {
                Header: key,
                id: key,
                accessor: (data) => accessor(data, key, def),
                width: 150,
                isSortable: false,
              };
            }
            return null;
          })
          .filter((x): x is CustomColumn => !!x),
        {
          Header: 'Created by',
          id: 'people.created_by',
          accessor: (data) => accessor(data, 'people.created_by', { type: ['User', 'ObjectId'] }),
          width: 150,
          isSortable: false,
        },
        {
          Header: 'Last modified by',
          id: 'people.last_modified_by',
          accessor: (data) => accessor(data, 'people.last_modified_by', { type: ['User', 'ObjectId'] }),
          width: 150,
          isSortable: false,
        },
        {
          Header: 'Last modified',
          id: 'timestamps.modified_at',
          accessor: (data) => accessor(data, 'timestamps.modified_at', { type: 'Date' }),
          width: 150,
          isSortable: true,
        },
      ];
    }, [props.lastSelectedIdState, props.selectedIdsState, schemaDef]);

    // create a ref for the spinner that appears when more rows can be loaded
    const SpinnerRef = useRef<HTMLDivElement>(null);
    // also create a ref for the table
    const TableRef = useRef<HTMLDivElement>(null);

    // use IntersectionObserver to detect when the spinner is intersecting in
    // the table, and then attempt to load more rows of the table
    useEffect(() => {
      let observer: IntersectionObserver;
      if (SpinnerRef.current && TableRef.current) {
        const options: IntersectionObserverInit = {
          root: TableRef.current,
          threshold: 0.75, // require at least 75% intersection
        };
        const callback: IntersectionObserverCallback = (entries, observer) => {
          entries.forEach((spinner) => {
            if (spinner.isIntersecting && !loading && networkStatus !== NetworkStatus.refetch) {
              // make spinner visible
              if (SpinnerRef.current) SpinnerRef.current.style.opacity = '1';
              // fetch more rows of data
              if (docs) {
                fetchMore({
                  variables: {
                    limit: 10,
                    offset: docs.length,
                  },
                });
                // increase the limit so that the correct amount of rows are loaded when the filter or sort order changes
                setLimit(limit + 10);
                setPrevSort(sort);
              }
            } else {
              // make spinner invisible until it is intersecting enough
              if (SpinnerRef.current) SpinnerRef.current.style.opacity = '0';
            }
          });
        };
        observer = new IntersectionObserver(callback, options);
        observer.observe(SpinnerRef.current);
      }
      return () => {
        if (observer) observer.disconnect();
      };
    }, [docs, docs?.length, fetchMore, limit, loading, networkStatus, sort]);

    // modal for deleting selected items
    const [DeleteWindow, showDeleteModal] = useWindowModal(
      {
        title: `Delete the selected item${selectedIds.length === 1 ? '' : 's'}?`,
        isLoading: props.isLoading,
        windowOptions: { name: 'delete selected items' },
        text: `This action may be permanent.`,
        cancelButton: { text: 'No' },
        continueButton: {
          text: 'Yes',
          color: 'red',
          onClick: () => {
            const items = docs.filter((doc: { _id: string }) => selectedIds.includes(doc._id));

            const HIDE_ITEMS = gql`mutation {
            ${items.map((item: { [x: string]: any }, index: number) => {
              return `hideItem${index}: ${uncapitalize(props.collection)}Hide(${by?.one || '_id'}: "${
                item[by?.one || '_id']
              }") {
              hidden
            }`;
            })}
          }`;

            setIsLoading(true);
            return client
              .mutate({ mutation: HIDE_ITEMS })
              .finally(() => {
                setIsLoading(false);
              })
              .then(() => {
                toast.success(`Item successfully hidden.`);
                refetch();
                setSelectedIds([]);
                setLastSelectedId(undefined);
                return true;
              })
              .catch((err) => {
                console.error(err);
                toast.error(`Failed to hide item. \n ${err.message}`);
                return false;
              });
          },
        },
      },
      [selectedIds]
    );

    // modal for archiving selected items
    const [ArchiveWindow, showArchiveModal] = useWindowModal(
      {
        title: `Archive the selected item${selectedIds.length === 1 ? '' : 's'}?`,
        isLoading: props.isLoading,
        windowOptions: { name: 'archive selected items' },
        text: `This will remove the selected item${selectedIds.length === 1 ? '' : 's'} from most views.`,
        cancelButton: { text: 'No' },
        continueButton: {
          text: 'Yes',
          color: 'primary',
          onClick: () => {
            const items = docs.filter((doc: { _id: string }) => selectedIds.includes(doc._id));

            const ARCHIVE_ITEMS = gql`mutation {
            ${items.map((item: { [x: string]: any }, index: number) => {
              return `archiveItem${index}: ${uncapitalize(props.collection)}Archive(${by?.one || '_id'}: "${
                item[by?.one || '_id']
              }") {
              archived
            }`;
            })}
          }`;

            setIsLoading(true);
            return client
              .mutate({ mutation: ARCHIVE_ITEMS })
              .finally(() => {
                setIsLoading(false);
              })
              .then(() => {
                toast.success(`Item${selectedIds.length === 1 ? '' : 's'} successfully archived.`);
                refetch();
                setSelectedIds([]);
                setLastSelectedId(undefined);
                return true;
              })
              .catch((err) => {
                console.error(err);
                toast.error(`Failed to archive item${selectedIds.length === 1 ? '' : 's'}. \n ${err.message}`);
                return false;
              });
          },
        },
      },
      [selectedIds]
    );

    if (!data && !navigator.onLine) {
      return <Offline variant={'centered'} />;
    }

    if (!data && error)
      return (
        <>
          <p>Error!</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
          <button onClick={() => refetch()}>Reload</button>
        </>
      );

    // if the field is a body field that is rendered as a tiptap editor,
    // we want to open it in maximized mode for easy access to the editor
    const shouldOpenMaximized = schemaDef.find(([key, def]) => key === 'body' && def.field?.tiptap);

    const tenant = localStorage.getItem('tenant') || '';
    const row = {
      href: `/cms/collection/${camelToDashCase(uncapitalize(pluralize(props.collection)))}`,
      hrefSuffixKey: by?.one || '_id',
      hrefSearch: shouldOpenMaximized ? '?fs=1&props=1' : undefined,
      windowName:
        shouldOpenMaximized && window.matchMedia('(display-mode: standalone)').matches ? 'editor' : undefined,
    };

    // render the table
    return (
      <ErrorBoundary fallback={<div>Error loading table for '{props.collection}'</div>}>
        {DeleteWindow}
        {ArchiveWindow}
        <Table
          data={{
            // when data is undefined, generate placeholder rows
            data: !docs ? Array(rowDisplayCountEstimate).fill({}) : (docs as { [key: string]: any }[]),
            loading,
            error,
          }}
          showSkeleton={!docs || networkStatus === NetworkStatus.refetch}
          columns={columns}
          row={row}
          sort={sort}
          setSort={setSort}
          setPrevSort={setPrevSort}
          id={props.collection}
          footer={
            docs && data && docs.length < data.totalDocs ? (
              <div ref={SpinnerRef}>
                <Spinner theme={theme} />
              </div>
            ) : null
          }
          ref={TableRef}
          openOnDoubleClick
          selectedIdsState={props.selectedIdsState}
          lastSelectedIdState={props.lastSelectedIdState}
        />
        <Global
          styles={css`
            .table-row-cell-checkbox {
              display: none;
            }
            .table-row--contains-mouse .table-row-cell-checkbox,
            .table-row-cell-checkbox.checked {
              display: block;
            }
          `}
        />
        <BulkActions theme={theme} show={selectedIds.length > 0}>
          {searchParams.get('archived')?.toLowerCase() === 'true' ||
          searchParams.get('!archived')?.toLowerCase() === 'false' ? null : (
            <Button
              icon={<Archive20Regular />}
              backgroundColor={{ base: 'transparent' }}
              border={{ base: '1px solid transparent' }}
              height={42}
              disabled={selectedIds.length < 1}
              onClick={showArchiveModal}
            >
              Archive
            </Button>
          )}
          <Button
            icon={<Delete20Regular />}
            color={'red'}
            backgroundColor={{ base: 'transparent' }}
            border={{ base: '1px solid transparent' }}
            height={42}
            disabled={selectedIds.length < 1}
            onClick={showDeleteModal}
          >
            Delete
          </Button>
          <Button
            icon={<Open20Regular />}
            backgroundColor={{ base: 'transparent' }}
            border={{ base: '1px solid transparent' }}
            height={42}
            disabled={selectedIds.length !== 1}
            onClick={(e) => {
              let href = `${row.href}/${
                docs.find((doc: { _id: string }) => doc._id === selectedIds[0])?.[row.hrefSuffixKey]
              }${row.hrefSearch || ''}`;

              window.open(`/${tenant}${href}`, row.windowName, 'location=no');
            }}
          >
            Open
          </Button>
        </BulkActions>
      </ErrorBoundary>
    );
  }
);

const Spinner = styled(CircularProgress)<{ theme: themeType }>`
  width: 20px !important;
  height: 20px !important;
  margin: 10px;
  color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 900 : 300]} !important;
`;

const BulkActions = styled.div<{ theme: themeType; show: boolean }>`
  position: absolute;
  bottom: ${({ show }) => (show ? 36 : -24)}px;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: 240ms;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => Color(theme.color.neutral[theme.mode][300]).alpha(0.3).string()};
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.radius};
  display: flex;
  flex-direction: row;
  box-shadow: 0px 25.6px 57.6px rgb(0 0 0 / 14%), 0px 0px 16.4px rgb(0 0 0 / 12%);
  z-index: 1;
`;

function RowCheckbox({
  id,
  selectedIdsState,
  lastSelectedIdState,
}: {
  id: string;
  selectedIdsState: [string[], Dispatch<SetStateAction<string[]>>];
  lastSelectedIdState: [string | undefined, Dispatch<SetStateAction<string | undefined>>];
}) {
  const [selectedIds, setSelectedIds] = selectedIdsState;
  const [, setLastSelectedId] = lastSelectedIdState;

  return (
    <div style={{ margin: '3px 0 0 3px' }}>
      <Checkbox
        className={`table-row-cell-checkbox`}
        isChecked={selectedIds.includes(id)}
        onChange={(e) => {
          if (e.currentTarget.checked) setSelectedIds(Array.from(new Set([...selectedIds, id])));
          else setSelectedIds([...selectedIds.filter((d) => d !== id)]);
          setLastSelectedId(id);
        }}
      />
    </div>
  );
}

export { CollectionTable };
export type { ICollectionTableImperative };
