import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Column } from 'react-table';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { dashToCamelCase } from '../../../utils/dashToCamelCase';

interface ICollectionTable {
  collection: string;
  progress: string; // the progress (in-progress OR all)
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  ref?: React.RefObject<ICollectionTableImperative>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

interface ICollectionTableImperative {
  refetchData(): void;
}

const CollectionTable = forwardRef<ICollectionTableImperative, ICollectionTable>(
  ({ setIsLoading, ...props }, ref) => {
    const collection = collectionsConfig[dashToCamelCase(props.collection)];

    // get data and store it in state
    const [{ data: initialData, loading, error }, refetch] = useAxios(props.collection);
    const [data, setData] = useState(initialData);
    useEffect(() => {
      if (initialData) {
        setData(initialData);
        setIsLoading(false);
      }
    }, [initialData, setIsLoading]);
    useEffect(() => {
      if (loading) {
        setIsLoading(true);
      }
    }, [loading, setIsLoading]);
    useEffect(() => {
      if (error) {
        setIsLoading(false);
      }
    }, [error, setIsLoading]);

    // get all users
    const [{ data: users }] = useAxios<IProfile[]>(`/users`);

    // modify the data as specified in the config when `initialData` and `users` change
    useEffect(() => {
      if (initialData && users && collection && collection.onTableData) {
        // modify the data
        const modifiedData = collection.onTableData(initialData, users);

        // update the state with the modified data
        setData(modifiedData);
      }
    }, [initialData, users, collection]);

    // make the refetch data function available to the parent element via a ref
    useImperativeHandle(ref, () => ({
      refetchData() {
        refetch();
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

    if (!data && error)
      return (
        <>
          <p>Error!</p>
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
            data:
              (data as { [key: string]: any }[]) || Array(Math.floor((window.innerHeight - 100) / 38)).fill({}),
            loading,
            error,
          }}
          columns={columns}
          filters={props.filters}
          row={collection.row}
          defaultSort={collection?.defaultSortKey}
          id={props.collection}
        />
      </ErrorBoundary>
    );
  }
);

export { CollectionTable };
export type { ICollectionTableImperative };
