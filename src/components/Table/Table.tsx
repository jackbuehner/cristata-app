import { AxiosError } from 'axios';
import { Column, useFilters, useSortBy, useTable } from 'react-table';
import { TableDiv } from './_TableDiv';
import { TableRow } from './_TableRow';
import { TableCell } from './_TableCell';
import { TableGroup } from './_TableGroup';
import { useTheme } from '@emotion/react';
import { themeType } from '../../utils/theme/theme';
import { ChevronDown16Regular, ChevronUp16Regular } from '@fluentui/react-icons';
import { buttonEffect } from '../Button';
import { Dispatch, forwardRef, RefObject, SetStateAction, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import Skeleton from 'react-skeleton-loader';
import { ApolloError } from '@apollo/client';
import { merge } from 'merge-anything';
import { mongoSortType } from '../../graphql/client';
import { Checkbox } from '../Checkbox';
import Color from 'color';

interface ITable {
  data: {
    data: { [key: string]: any }[];
    loading: boolean;
    error: AxiosError<any> | ApolloError | undefined;
  };
  showSkeleton?: boolean;
  columns: Array<Column & { isSortable: boolean }>;
  row?: {
    href: string; // clicking a row will toke user to this location + the value of the hrefSuffixKey
    hrefSuffixKey: string; // key from the row's data object to append to href (most common usage would be _id)
    hrefSearch?: string; // url search params to append to hreg
    windowName?: string;
  };
  defaultSort?: string;
  sort: mongoSortType;
  setSort: Dispatch<SetStateAction<mongoSortType>>;
  setPrevSort: Dispatch<SetStateAction<mongoSortType>>;
  id: string;
  footer?: React.ReactNode;
  openOnDoubleClick?: boolean;
  selectedIdsState?: [string[], Dispatch<SetStateAction<string[]>>];
  lastSelectedIdState?: [string | undefined, Dispatch<SetStateAction<string | undefined>>];
}

const Table = forwardRef(
  ({ sort, setSort, setPrevSort, ...props }: ITable, ref?: React.ForwardedRef<HTMLDivElement>) => {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = props.selectedIdsState || [undefined, undefined];
    const [lastSelectedId, setLastSelectedId] = props.lastSelectedIdState || [undefined, undefined];

    // get the current theme
    const theme = useTheme() as themeType;

    // is skeleton loading
    const showSkeleton =
      props.showSkeleton !== (undefined || null) ? props.showSkeleton : props.data.loading ? true : false;

    // use the useTable hook to build the table with the columns and data
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state } = useTable(
      {
        columns: props.columns as Column<{ [key: string]: any }>[],
        data: props.data.data,
        manualSortBy: true,
        initialState: {
          // @ts-expect-error sortBy is actually allowed
          sortBy: Object.entries(sort).map(([field, direction]) => {
            return {
              id: field,
              desc: direction === -1,
            };
          }),
        },
      },
      useFilters,
      useSortBy
    );

    useEffect(() => {
      type sortByType = { id: string; desc: boolean }[];
      // @ts-expect-error `sortBy` is defined because we use the `useSortBy` plugin
      const { sortBy }: { sortBy: sortByType } = state;

      // build the new sort object
      const newSort = merge({}, ...sortBy.map(({ id: field, desc }) => ({ [field]: desc ? -1 : 1 })));

      // if the new sort object is different than the current one, update sort to match the new one
      if (JSON.stringify(newSort) !== JSON.stringify(sort)) {
        setPrevSort(sort);
        setSort(newSort);
      }
    }, [state, setSort, sort, props.id, setPrevSort]);

    const backupRef = useRef<HTMLDivElement>(null);

    const tenant = localStorage.getItem('tenant') || '';

    return (
      <>
        {/* apply the table props */}
        <TableDiv
          role={`table`}
          theme={theme}
          {...getTableProps()}
          noOverflow={showSkeleton}
          ref={ref || backupRef}
        >
          {/* table header */}
          <TableGroup theme={theme} isHeader role={`rowgroup`}>
            {
              // create a row for each header row
              headerGroups.map((headerGroup, index) => {
                return (
                  // apply header row row props
                  <TableRow role={`row`} {...headerGroup.getHeaderGroupProps()} key={index}>
                    {
                      // loop over the headers in each row
                      headerGroup.headers.map((column, index) => {
                        const sortableHeaders =
                          // @ts-expect-error isSortable is a custom variable in the config
                          column.isSortable !== false
                            ? // @ts-expect-error getSortByToggleProps is allowed when useSortBy hook is present and isSortable is a custom variable in the config
                              column.getHeaderProps(column.getSortByToggleProps())
                            : {};

                        return (
                          // apply header cell props
                          <TableCell
                            key={index}
                            role={`columnheader`}
                            width={column.width}
                            isHeader
                            theme={theme}
                            styleString={
                              // @ts-expect-error isSortable is a custom variable in the config
                              column.isSortable !== false
                                ? buttonEffect(
                                    'primary',
                                    theme.mode === 'light' ? 600 : 300,
                                    theme,
                                    false,
                                    { base: 'transparent' },
                                    { base: '1px solid transparent' }
                                  )
                                : undefined
                            }
                            onMouseUp={() => {
                              if ((ref as RefObject<HTMLDivElement>)?.current) {
                                (ref as RefObject<HTMLDivElement>).current!.scroll({
                                  top: 0,
                                  behavior: 'smooth',
                                });
                              } else if (backupRef?.current)
                                backupRef.current.scroll({ top: 0, behavior: 'smooth' });
                            }}
                            {...sortableHeaders}
                          >
                            {
                              // render the header
                              column.Header?.toString() === '__cb' &&
                              selectedIds &&
                              setLastSelectedId &&
                              setSelectedIds ? (
                                <div style={{ margin: '3px 0 0 3px' }}>
                                  <Checkbox
                                    isChecked={selectedIds?.length === rows.length}
                                    indeterminate={selectedIds?.length > 0 && selectedIds?.length < rows.length}
                                    onChange={() => {
                                      if (selectedIds.length === rows.length) setSelectedIds([]);
                                      else
                                        setSelectedIds(
                                          rows.map((row) => row.original._id).filter((_id) => !!_id)
                                        );
                                    }}
                                  />
                                </div>
                              ) : (
                                column.render('Header')
                              )
                            }
                            {/* Add a sort direction indicator */}
                            <span
                              style={{
                                position: 'absolute',
                                top: 0,
                                left:
                                  typeof column.width === 'string'
                                    ? `calc(${column.width} / 2 - 16px)`
                                    : column.width! / 2 - 16,
                              }}
                            >
                              {
                                // @ts-expect-error `isSorted` is valid
                                column.isSorted ? (
                                  // @ts-expect-error `isSortedDesc` is valid
                                  column.isSortedDesc ? (
                                    <ChevronDown16Regular />
                                  ) : (
                                    <ChevronUp16Regular />
                                  )
                                ) : (
                                  ''
                                )
                              }
                            </span>
                          </TableCell>
                        );
                      })
                    }
                  </TableRow>
                );
              })
            }
          </TableGroup>
          {/* table body: apply the table body props */}
          <TableGroup role={`rowgroup`} {...getTableBodyProps()}>
            {
              // create table rows for each row of data
              rows.map((row, rowIndex) => {
                // prepare the row for display
                prepareRow(row);

                const openRowItem = () => {
                  // if props for onClick action is defined (via `props.row`), push history
                  if (props.row) {
                    let href = `${props.row.href}/${row.original[props.row.hrefSuffixKey]}${
                      props.row.hrefSearch || ''
                    }`;

                    if (props.row.windowName) {
                      window.open(`/${tenant}/${href}`, props.row.windowName, 'location=no');
                    } else {
                      navigate(href);
                    }
                  }
                };

                return (
                  // apply the row props
                  <>
                    <TableRow
                      role={`row`}
                      {...row.getRowProps()}
                      key={rowIndex}
                      theme={theme}
                      onClick={
                        !showSkeleton && props.row && !props.openOnDoubleClick
                          ? openRowItem
                          : selectedIds && setLastSelectedId
                          ? (e) => {
                              if (row.original._id) {
                                if (e.ctrlKey) {
                                  setSelectedIds?.(Array.from(new Set([...selectedIds, row.original._id])));
                                  setLastSelectedId?.(row.original._id);
                                } else if (e.shiftKey) {
                                  // select all between last checked row and the row shft-clicked
                                  const lastRow = rows.find((row) => row.original._id === lastSelectedId);
                                  const lastRowIndex = lastRow?.index || 0;
                                  const thisRowIndex = row.index;
                                  if (lastRowIndex > thisRowIndex) {
                                    const rowOriginalIds = rows
                                      .filter((row) => row.index >= thisRowIndex && row.index <= lastRowIndex)
                                      .map((row) => row.original._id);
                                    setSelectedIds?.(rowOriginalIds);
                                    setLastSelectedId?.(row.original._id);
                                  } else if (lastRowIndex <= thisRowIndex) {
                                    const rowOriginalIds = rows
                                      .filter((row) => row.index <= thisRowIndex && row.index >= lastRowIndex)
                                      .map((row) => row.original._id);
                                    setSelectedIds?.(rowOriginalIds);
                                    setLastSelectedId?.(row.original._id);
                                  }
                                } else {
                                  setSelectedIds?.([row.original._id]);
                                  setLastSelectedId?.(row.original._id);
                                }
                              }
                            }
                          : undefined
                      }
                      onDoubleClick={
                        !showSkeleton && props.row && props.openOnDoubleClick ? openRowItem : undefined
                      }
                      isChecked={row.original._id && selectedIds?.includes(row.original._id) ? true : false}
                    >
                      {
                        // loop over the row cells to render each cell
                        row.cells.map((cell, index) => {
                          // apply cell props
                          return (
                            <TableCell
                              role={`cell`}
                              width={cell.column.width}
                              {...cell.getCellProps()}
                              key={index}
                            >
                              {showSkeleton ? (
                                <Skeleton
                                  color={theme.color.neutral[theme.mode][100]}
                                  width={`${parseInt(`${cell.column.width}` || `150`) - 30}px`}
                                  borderRadius={theme.radius}
                                />
                              ) : (
                                // render cell contents
                                cell.render('Cell')
                              )}
                            </TableCell>
                          );
                        })
                      }
                    </TableRow>
                    <div
                      style={{
                        width: '100%',
                        height: 1,
                        boxShadow: `inset 0 1px 0 0 ${Color(theme.color.neutral[theme.mode][200])
                          .alpha(0.7)
                          .string()}`,
                      }}
                    ></div>
                  </>
                );
              })
            }
          </TableGroup>
          {props.footer}
        </TableDiv>
      </>
    );
  }
);

export { Table };
