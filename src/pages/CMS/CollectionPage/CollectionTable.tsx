import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { isTypeTuple, SchemaDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { CircularProgress } from '@material-ui/core';
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
import { Chip } from '../../../components/Chip';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { mongoFilterType, mongoSortType } from '../../../graphql/client';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { uncapitalize } from '../../../utils/uncapitalize';
import { unflattenObject } from '../../../utils/unflattenObject';
import { deepen } from '../CollectionItemPage/useFindDoc';

interface ICollectionTable {
  collection: string;
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  filter?: mongoFilterType;
  ref?: React.RefObject<ICollectionTableImperative>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
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
    const { search } = useLocation();
    const searchParams = useMemo(() => new URLSearchParams(search), [search]);
    const collection = collectionsConfig[props.collection];

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
    const [{ schemaDef }] = useCollectionSchemaConfig(props.collection);

    // generate a GraphQL API query based on the collection
    const GENERATED_COLLECTION_QUERY =
      collection && collection.columns.length > 0
        ? gql(
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
                  [collection.query.name.plural]: {
                    __args: {
                      limit: new VariableType('limit'),
                      filter: new VariableType('filter'),
                      sort: new VariableType('sort'),
                      offset: new VariableType('offset'),
                    },
                    totalDocs: true,
                    docs: {
                      ...unflattenObject(
                        merge(
                          {},
                          // field used for navigating to item editor
                          collection?.row?.hrefSuffixKey ? { [collection.row.hrefSuffixKey]: true } : {},
                          // fields that are forced by the collection config
                          ...(collection?.query.force?.map((field) => ({ [field]: true })) || []),
                          // fields used in the table columns
                          ...collection?.columns.map((column) => {
                            if (column.subfields && !column.isJSON) {
                              return {
                                [column.key]: merge(
                                  {},
                                  ...column.subfields.map((subfield) => ({ [subfield]: true }))
                                ),
                              };
                            }
                            return { [column.key]: true };
                          })
                        )
                      ),
                    },
                  },
                },
              },
              { pretty: true }
            )
          )
        : gql(
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
                        {},
                        // field used for navigating to item editor
                        collection?.row?.hrefSuffixKey ? { [collection.row.hrefSuffixKey]: true } : {},
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
                        ...schemaDef.map(([key, def]): Record<string, never> => {
                          if (def.column?.hidden !== true) {
                            if (isTypeTuple(def.type) || def.column?.reference) {
                              if (def.column?.reference) {
                                const collection = isTypeTuple(def.type)
                                  ? def.type[0].replace('[', '').replace(']', '')
                                  : def.column.reference.collection;

                                return merge(
                                  deepen({ [key + '.' + (def.column.reference?.fields?._id || '_id')]: true }),
                                  deepen({
                                    [key + '.' + (def.column.reference?.fields?.name || 'name')]: true,
                                  }),
                                  collection === 'User' ? deepen({ [key + '.photo']: true }) : {}
                                );
                              }
                              return deepen({ [key + '._id']: true });
                            }
                            return deepen({ [key]: true });
                          }
                          return {};
                        })
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
      variables: { limit: queryLimit },
      onCompleted: (queryData) => {
        const data = collection ? queryData?.[collection.query.name.plural] : undefined;

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
    let data = collection ? queryData?.[collection.query.name.plural] : undefined;
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
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
          <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '6px 0', flexWrap: 'wrap' }}>
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
              <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '6px 0', flexWrap: 'wrap' }}>
                <Chip label={fieldData} color={'neutral'} data-value={fieldData} />
              </div>
            );
          }

          const match = def.column.chips.find((s) => s.value === fieldData || s.value === parseInt(fieldData));
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '6px 0', flexWrap: 'wrap' }}>
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
              <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '6px 0', flexWrap: 'wrap' }}>
                <Chip label={`${fieldData}`} color={'neutral'} data-value={fieldData} />
              </div>
            );
          }

          const match = def.column.chips.find((s) => s.value === fieldData);
          return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: 3, margin: '6px 0', flexWrap: 'wrap' }}>
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
      if (!collection || !collection.columns || collection.columns.length === 0) {
        return [
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
      }
      return collection.columns.map((column): CustomColumn => {
        if (column.render) {
          return {
            Header: column.label || column.key,
            id: column.key,
            accessor: column.render,
            width: column.width || 150,
            isSortable: column.isSortable || true,
          };
        }
        return {
          Header: column.label || column.key,
          id: column.key,
          accessor: column.key,
          width: column.width || 150,
          isSortable: column.isSortable || true,
        };
      });
    }, [collection, schemaDef]);

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

    if (!data && error)
      return (
        <>
          <p>Error!</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
          <button onClick={() => refetch()}>Reload</button>
        </>
      );

    // if collection is undefined, render an error message
    if (!collection) {
      return (
        <span>
          Failed to load table for '{props.collection}'. <code>collection</code> is undefined, null, or false.
        </span>
      );
    }

    // render the table
    return (
      <ErrorBoundary fallback={<div>Error loading table for '{props.collection}'</div>}>
        <Table
          data={{
            // when data is undefined, generate placeholder rows
            data: !docs ? Array(rowDisplayCountEstimate).fill({}) : (docs as { [key: string]: any }[]),
            loading,
            error,
          }}
          showSkeleton={!docs || networkStatus === NetworkStatus.refetch}
          columns={columns}
          row={collection.row}
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
        />
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

export { CollectionTable };
export type { ICollectionTableImperative };
