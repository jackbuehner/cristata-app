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
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { excludes as excludesFilter } from './custom-filters/excludes';
import { includes as includesFilter } from './custom-filters/includes';
import { useHistory } from 'react-router';
import Skeleton from 'react-skeleton-loader';

interface ITable {
  data: {
    data: { [key: string]: any }[];
    loading: boolean;
    error: AxiosError<any> | undefined;
  };
  columns: Column<{
    [key: string]: any;
  }>[];
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  row?: {
    href: string; // clicking a row will toke user to this location + the value of the hrefSuffixKey
    hrefSuffixKey: string; // key from the row's data object to append to href (most common usage would be _id)
    hrefSearch?: string; // url search params to append to hreg
    windowName?: string;
  };
  defaultSort?: string;
  id: string;
}

function Table({ filters, ...props }: ITable) {
  const history = useHistory();

  // get the current theme
  const theme = useTheme() as themeType;

  // get the preferred sort method from localstorage
  const defaultSort = `{
    "id": ${JSON.stringify(props.defaultSort || props.columns[0].id)},
    "isSortedDesc": true
  }`;
  const [preferredSort, setPreferredSort] = useState<{
    id: string | undefined;
    isSortedDesc: boolean | undefined;
  }>(JSON.parse(localStorage?.getItem(`table.${props.id}.preferredSort`) || defaultSort));

  // set changed to preferred sort method to localstorage
  useEffect(() => {
    if (localStorage && preferredSort !== null) {
      // if the sort order is undefined, remove the data from localStorage so that the default sort is used on next reload
      if (preferredSort.isSortedDesc === undefined) {
        localStorage.removeItem(`table.${props.id}.preferredSort`);
        setPreferredSort(JSON.parse(defaultSort));
      }
      // otherwise, set the sort id and order
      else localStorage.setItem(`table.${props.id}.preferredSort`, JSON.stringify(preferredSort));
    }
  }, [preferredSort, props.id, defaultSort]);

  // define custom filters
  const customFilterTypes = useMemo(
    () => ({
      excludes: excludesFilter,
      includes: includesFilter,
    }),
    []
  );

  // use the useTable hook to build the table with the columns and data
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // @ts-expect-error
    setAllFilters,
  } = useTable(
    {
      columns: props.columns,
      data: props.data.data,
      filterTypes: customFilterTypes,
      initialState: {
        // @ts-expect-error sortBy is actually allowed
        sortBy: [
          {
            id: preferredSort.id,
            desc: preferredSort.isSortedDesc,
          },
        ],
      },
    },
    useFilters,
    useSortBy
  );

  // set the filters that have been passed to props
  useEffect(() => {
    if (filters) {
      setAllFilters(filters);
    } else {
      setAllFilters([]);
    }
  }, [filters, setAllFilters, props.data]);

  return (
    <>
      {/* apply the table props */}
      <TableDiv role={`table`} theme={theme} {...getTableProps()} noOverflow={!!props.data.loading}>
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
                        // @ts-expect-error getSortByToggleProps is allowed when useSortBy hook is present and isSortable is a custom variable in the config
                        column.isSortable !== false ? column.getHeaderProps(column.getSortByToggleProps()) : {};

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
                                  600,
                                  theme,
                                  false,
                                  { base: 'transparent' },
                                  { base: '1px solid transparent' }
                                )
                              : undefined
                          }
                          {...sortableHeaders}
                          onMouseUp={() => {
                            // set the preferred sorting value so it is updated in localstorage
                            // @ts-expect-error `canSort` is valid
                            if (column.canSort) {
                              setPreferredSort({
                                id: column.id,
                                isSortedDesc:
                                  // @ts-expect-error `isSortedDesc` is valid (true: desc; false: asc; undefined: not sorted)
                                  column.isSortedDesc === undefined
                                    ? false
                                    : // @ts-expect-error `isSortedDesc` is valid (true: desc; false: asc; undefined: not sorted)
                                    column.isSortedDesc === false
                                    ? true
                                    : undefined,
                              });
                            }
                          }}
                        >
                          {
                            // render the header
                            column.render('Header')
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
                    props.data.loading
                      ? undefined
                      : props.row
                      ? () =>
                          props.row
                            ? props.row.windowName
                              ? window.open(
                                  `${props.row.href}/${row.original[props.row.hrefSuffixKey]}${
                                    props.row.hrefSearch || ''
                                  }`,
                                  props.row.windowName,
                                  'location=no'
                                )
                              : history.push(
                                  `${props.row.href}/${row.original[props.row.hrefSuffixKey]}${
                                    props.row.hrefSearch || ''
                                  }`
                                )
                            : null
                      : undefined
                  }
                >
                  {
                    // loop over the row cells to render each cell
                    row.cells.map((cell, index) => {
                      // apply cell props
                      return (
                        <TableCell role={`cell`} width={cell.column.width} {...cell.getCellProps()} key={index}>
                          {props.data.loading ? (
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
      </TableDiv>
    </>
  );
}

export { Table };
