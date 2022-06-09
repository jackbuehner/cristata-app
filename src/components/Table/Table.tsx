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
}

const Table = forwardRef(
  ({ sort, setSort, setPrevSort, ...props }: ITable, ref?: React.ForwardedRef<HTMLDivElement>) => {
    const navigate = useNavigate();

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
                              column.Header?.toString() === '__cb' ? '' : column.render('Header')
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
                return (
                  // apply the row props
                  <TableRow
                    role={`row`}
                    {...row.getRowProps()}
                    key={rowIndex}
                    theme={theme}
                    // if props for onClick action is defined (via `props.row`), push history
                    onClick={
                      showSkeleton
                        ? undefined
                        : props.row
                        ? (e) => {
                            if (props.row) {
                              let href = `${props.row.href}/${row.original[props.row.hrefSuffixKey]}${
                                props.row.hrefSearch || ''
                              }`;

                              // go to beta url path if shift key is pressed
                              if (e.shiftKey)
                                href = href
                                  .replace('/item', '/collection')
                                  .replace(/([^/]+)$/, 'item/$1')
                                  .replace('force', '0');

                              if (props.row.windowName) {
                                window.open(href, props.row.windowName, 'location=no');
                              } else {
                                navigate(href);
                              }
                            }
                          }
                        : undefined
                    }
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
