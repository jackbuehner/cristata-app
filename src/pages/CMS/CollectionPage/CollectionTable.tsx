import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import { CircularProgress } from '@material-ui/core';
import { jsonToGraphQLQuery, VariableType } from 'json-to-graphql-query';
import { merge } from 'merge-anything';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Column } from 'react-table';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { mongoFilterType, mongoSortType } from '../../../graphql/client';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';
import { themeType } from '../../../utils/theme/theme';
import styled from '@emotion/styled/macro';
import { unflattenObject } from '../../../utils/unflattenObject';

interface ICollectionTable {
  collection: string;
  progress: string; // the progress (in-progress OR all)
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
    const collection = collectionsConfig[dashToCamelCase(props.collection)];

    // calculate the approximate number of rows that can be visible on the display
    const rowDisplayCountEstimate = Math.floor((window.innerHeight - 100) / 38);

    // find the previous sort object from localStorage (might not be defined)
    const previousSort = localStorage.getItem(`table.${props.collection}.sort`);

    // construct a default sort object based on the `defaultSortKey` found in the collection config
    const defaultSort = useMemo<mongoSortType>(
      () => ({ [collection?.defaultSortKey || '_id']: 1 }),
      [collection?.defaultSortKey]
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

    // generate a GraphQL API query based on the collection
    const GENERATED_COLLECTION_QUERY = collection
      ? gql(
          jsonToGraphQLQuery(
            {
              query: {
                __variables: {
                  limit: `Int! = 20`,
                  filter: `JSON = ${JSON.stringify(
                    JSON.stringify(
                      merge(collection?.prependFilter?.(props.filter || {}) || {}, props.filter || {})
                    )
                  )}`,
                  sort: `JSON = ${JSON.stringify(
                    JSON.stringify(
                      merge(
                        collection?.prependSort?.(Object.keys(sort).length === 0 ? defaultSort : sort) || {},
                        Object.keys(sort).length === 0 ? defaultSort : sort
                      )
                    )
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
      : gql``;

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

    // modify the data as specified in the config
    if (collection?.onTableData && docs) docs = collection.onTableData([...docs]);

    // make functions available to the parent element via a ref
    useImperativeHandle(ref, () => ({
      refetchData() {
        refetch();
      },
      resetSort() {
        setSort({});
      },
    }));

    // build the columns based on the config
    const columns: Column<{ [key: string]: any }>[] = useMemo(() => {
      if (!collection) {
        return [];
      }
      return collection?.columns.map((column) => {
        if (column.render) {
          return {
            Header: column.label || column.key,
            id: column.key,
            accessor: column.render,
            width: column.width || 150,
            filter: column.filter,
            isSortable: column.isSortable,
            sortType: column.sortType || 'alphanumeric',
          };
        }
        return {
          Header: column.label || column.key,
          id: column.key,
          accessor: column.key,
          width: column.width || 150,
          filter: column.filter,
          isSortable: column.isSortable,
          sortType: column.sortType || 'alphanumeric',
        };
      });
    }, [collection]);

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
          defaultSort={collection?.defaultSortKey}
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
  font-family: ${({ theme }) => theme.color.primary[900]} !important;
`;

export { CollectionTable };
export type { ICollectionTableImperative };
