import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Column } from 'react-table';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { IPhotoRequest } from '../../../interfaces/cristata/photoRequests';
import { IProfile } from '../../../interfaces/cristata/profiles';

interface IPhotoRequestsTable {
  progress: string;
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  ref?: React.RefObject<IPhotoRequestsImperative>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export interface IPhotoRequestsImperative {
  refetchData(): void;
}

const PhotoRequestsTable = forwardRef<IPhotoRequestsImperative, IPhotoRequestsTable>(
  ({ setIsLoading, ...props }, ref) => {
    // get photo requests and store it in state
    const [{ data: photoRequests, loading, error }, refetch] = useAxios<IPhotoRequest[]>('/photo-requests');
    const [data, setData] = useState<IPhotoRequest[]>();
    useEffect(() => {
      if (photoRequests) {
        setData(photoRequests);
        setIsLoading(false);
      }
    }, [photoRequests, setIsLoading]);
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

      if (photoRequests && users) {
        const copy = [...photoRequests];

        copy.forEach((photoRequest) => {
          // format created by ids to names and photos
          if (typeof photoRequest.people.created_by === 'number') {
            const user = findUserAndReturnObj(photoRequest.people.created_by);
            if (user) {
              const { name, photo } = user;
              photoRequest.people.created_by = { name, photo };
            }
          }
          // format last modified by ids to names and photos
          if (typeof photoRequest.people.last_modified_by === 'number') {
            const user = findUserAndReturnObj(photoRequest.people.last_modified_by);
            if (user) {
              const { name, photo } = user;
              photoRequest.people.last_modified_by = { name, photo };
            }
          }
          // format requested by by ids to names and photos
          if (typeof photoRequest.people.requested_by === 'number') {
            const user = findUserAndReturnObj(photoRequest.people.requested_by);
            if (user) {
              const { name, photo } = user;
              photoRequest.people.requested_by = { name, photo };
            }
          }
        });

        // update the state with the modified data copy
        setData(copy);
      }
    }, [photoRequests, users]);

    // make a function available to the parent element via a ref
    useImperativeHandle(ref, () => ({
      refetchData() {
        refetch();
        console.log('hello world');
      },
    }));

    const columns: Column<{ [key: string]: any } | IPhotoRequest>[] = useMemo(
      () =>
        collectionsConfig.photoRequests!.columns.map((column) => {
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
          row={{ href: '/cms/item/photo-requests', hrefSuffixKey: '_id' }}
          collection={`photoRequests`}
        />
      );
    }
    return <p>Something went wrong</p>;
  }
);

export { PhotoRequestsTable };
