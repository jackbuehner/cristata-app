import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Column } from 'react-table';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { IShortURL } from '../../../interfaces/cristata/shorturl';

interface IShortUrlTable {
  progress: string;
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  ref?: React.RefObject<IShortUrlImperative>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export interface IShortUrlImperative {
  refetchData(): void;
}

const ShortUrlTable = forwardRef<IShortUrlImperative, IShortUrlTable>(({ setIsLoading, ...props }, ref) => {
  // get photo requests and store it in state
  const [{ data: shortURLs, loading, error }, refetch] = useAxios<IShortURL[]>('/shorturl');
  const [data, setData] = useState<IShortURL[]>();
  useEffect(() => {
    if (shortURLs) {
      setData(shortURLs);
      setIsLoading(false);
    }
  }, [shortURLs, setIsLoading]);
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

  // when articles and users first become available, change userIDs to user display names
  useEffect(() => {
    function findUserAndReturnObj(userID: number) {
      const user = users?.find((user) => user.github_id === userID);
      return user;
    }

    if (shortURLs && users) {
      const copy = [...shortURLs];

      copy.forEach((shorturl) => {
        // format created by ids to names and photos
        if (typeof shorturl.people.created_by === 'number') {
          const user = findUserAndReturnObj(shorturl.people.created_by);
          if (user) {
            const { name, photo } = user;
            shorturl.people.created_by = { name, photo };
          }
        }
        // format last modified by ids to names and photos
        if (typeof shorturl.people.last_modified_by === 'number') {
          const user = findUserAndReturnObj(shorturl.people.last_modified_by);
          if (user) {
            const { name, photo } = user;
            shorturl.people.last_modified_by = { name, photo };
          }
        }
      });

      // update the state with the modified data copy
      setData(copy);
    }
  }, [shortURLs, users]);

  // make a function available to the parent element via a ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch();
    },
  }));

  const columns: Column<{ [key: string]: any } | IShortURL>[] = useMemo(
    () =>
      collectionsConfig.shorturl!.columns.map((column) => {
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
      }),
    []
  );

  if (!data && loading) return <p>Loading...</p>;
  if (!data && error)
    return (
      <>
        <p>Error!</p>
        <button onClick={() => refetch()}>Reload</button>
      </>
    );

  if (data) {
    return (
      <Table
        data={{ data: data as { [key: string]: any }[], loading, error }}
        columns={columns}
        filters={props.filters}
        row={{ href: '/cms/item/shorturl', hrefSuffixKey: 'code' }}
        collection={`shorturl`}
      />
    );
  }
  return <p>Something went wrong</p>;
});

export { ShortUrlTable };
