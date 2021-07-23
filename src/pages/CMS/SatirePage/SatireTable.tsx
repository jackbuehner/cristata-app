import useAxios from 'axios-hooks';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Column } from 'react-table';
import { Table } from '../../../components/Table';
import { collections as collectionsConfig } from '../../../config';
import { IProfile } from '../../../interfaces/cristata/profiles';

// userID from GitHub is just a number
type GitHubUserID = number;

// permissions groups
type Teams = string;

// use these as the stages for satires
enum Stage {
  PLANNING = 1.1,
  DRAFT = 2.1,
  PENDING_EDITOR_REVIEW = 3.1,
  PENDING_INTERVIEWEE_APPROVAL = 3.2,
  PENDING_EDIT = 3.4,
  PENDING_UPLOAD = 4.1,
  UPLOADED = 5.1,
  PUBLISHED = 5.2,
}

// interface for each satire
interface ISatire {
  name?: string;
  permissions: {
    teams?: Teams[];
    users: GitHubUserID[];
  };
  locked?: boolean;
  timestamps?: {
    created_at?: Date;
    modified_at?: Date;
    published_at?: Date;
    target_publish_at?: Date;
  };
  people: {
    authors?: GitHubUserID[] | string[] | { name: string; photo: string }[];
    created_by?: GitHubUserID | { name: string; photo: string };
    modified_by?: GitHubUserID[];
    last_modified_by: GitHubUserID | { name: string; photo: string };
    published_by?: GitHubUserID[];
    editors?: {
      primary?: GitHubUserID;
      copy?: GitHubUserID[];
    };
  };
  stage?: Stage;
  categories?: string[];
  tags?: string[];
  description?: string;
}

interface ISatireTable {
  progress: string; // the progress (in-progress OR all)
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  ref?: React.RefObject<ISatireTableImperative>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export interface ISatireTableImperative {
  refetchData(): void;
}

const SatireTable = forwardRef<ISatireTableImperative, ISatireTable>(({ setIsLoading, ...props }, ref) => {
  // get satires and store it in state
  const [{ data: satires, loading, error }, refetch] = useAxios<ISatire[]>('/satire');
  const [data, setData] = useState<ISatire[]>();
  useEffect(() => {
    if (satires) {
      setData(satires);
      setIsLoading(false);
    }
  }, [satires, setIsLoading]);
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

  // when satires and users first become available, change userIDs to user display names
  useEffect(() => {
    function findUserAndReturnObj(userID: number) {
      const user = users?.find((user) => user.github_id === userID);
      return user;
    }

    if (satires && users) {
      const copy = [...satires];

      copy.forEach((satire) => {
        // format created by ids to names and photos
        if (typeof satire.people.created_by === 'number') {
          const user = findUserAndReturnObj(satire.people.created_by);
          if (user) {
            const { name, photo } = user;
            satire.people.created_by = { name, photo };
          }
        }
        // format last modified by ids to names and photos
        if (typeof satire.people.last_modified_by === 'number') {
          const user = findUserAndReturnObj(satire.people.last_modified_by);
          if (user) {
            const { name, photo } = user;
            satire.people.last_modified_by = { name, photo };
          }
        }
        // use author ids to get author name and image
        if (satire.people.authors) {
          // store the auth or names once the are found
          let authors: { name: string; photo: string }[] = [];

          type authorType =
            | string
            | number
            | {
                name: string;
                photo: string;
              };

          // for each author, find the name based on the id
          satire.people.authors.forEach((author: authorType) => {
            if (typeof author === 'number') {
              const authorID = author;
              // if it is an id, find the name and push it to the array
              const userObj = findUserAndReturnObj(authorID);
              if (userObj)
                authors.push({
                  name: userObj.name,
                  photo: userObj.photo,
                });
            } else if (typeof author === 'object') {
              authors.push(author);
            }
          });

          // update the authors in the data copy
          satire.people.authors = authors;
        }
      });

      // update the state with the modified data copy
      setData(copy);
    }
  }, [satires, users]);

  // make a function available to the parent element via a ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch();
      console.log('hello world');
    },
  }));

  const columns: Column<{ [key: string]: any } | ISatire>[] = useMemo(
    () =>
      collectionsConfig.satire!.columns.map((column) => {
        if (column.render) {
          return {
            Header: column.label || column.key,
            id: column.key,
            accessor: column.render,
            width: column.width || 150,
            filter: column.filter,
            isSortable: column.isSortable,
          };
        }
        return {
          Header: column.label || column.key,
          id: column.key,
          accessor: column.key,
          width: column.width || 150,
          filter: column.filter,
          isSortable: column.isSortable,
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
        row={{ href: '/cms/item/satire', hrefSuffixKey: '_id' }}
      />
    );
  }
  return <p>Something went wrong</p>;
});

export { SatireTable };