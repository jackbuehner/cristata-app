import useAxios from 'axios-hooks';
import { useEffect, useState } from 'react';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Column } from 'react-table';
import { Table } from '../../components/Table';
import { collections as collectionsConfig } from '../../config';
import { IProfile } from '../../interfaces/cristata/profiles';

// userID from GitHub is just a number
type GitHubUserID = number;

// permissions groups
type Teams = string;

// use these as the stages for articles
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

// interface for each article
interface IArticle {
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

interface IArticlesTable {
  progress: string; // the progress (in-progress OR all)
  filters?: {
    // the filters to use for the table
    id: string;
    value: any; // value type depends on the filter defined in the columns
  }[];
  ref?: React.RefObject<IArticlesTableImperative>;
}

export interface IArticlesTableImperative {
  refetchData(): void;
}

const ArticlesTable = forwardRef<IArticlesTableImperative, IArticlesTable>((props, ref) => {
  // get articles and store it in state
  const [{ data: articles, loading, error }, refetch] = useAxios<IArticle[]>('/articles');
  const [data, setData] = useState(articles);

  // get all users
  const [{ data: users }] = useAxios<IProfile[]>(`/users`);

  // when articles and users first become available, change userIDs to user display names
  useEffect(() => {
    function findUserAndReturnName(userID: number) {
      const user = users?.find((user) => user.github_id === userID);
      return user?.name;
    }

    function findUserAndReturnObj(userID: number) {
      const user = users?.find((user) => user.github_id === userID);
      return user;
    }

    if (articles && users) {
      const copy = [...articles];

      copy.forEach((article) => {
        // format created by ids to names and photos
        if (typeof article.people.created_by === 'number') {
          const user = findUserAndReturnObj(article.people.created_by);
          if (user) {
            const { name, photo } = user;
            article.people.created_by = { name, photo };
          }
        }
        // format last modified by ids to names and photos
        if (typeof article.people.last_modified_by === 'number') {
          const user = findUserAndReturnObj(article.people.last_modified_by);
          if (user) {
            const { name, photo } = user;
            article.people.last_modified_by = { name, photo };
          }
        }
        // use author ids to get author name and image
        if (article.people.authors) {
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
          article.people.authors.forEach((author: authorType) => {
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
          article.people.authors = authors;
        }
      });

      // update the state with the modified data copy
      setData(copy);
    }
  }, [articles, users]);

  // make a function available to the parent element via a ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch();
      console.log('hello world');
    },
  }));

  const columns: Column<{ [key: string]: any } | IArticle>[] = useMemo(
    () =>
      collectionsConfig.articles!.columns.map((column) => {
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

  if (loading) return <p>Loading...</p>;
  if (error)
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
        row={{ href: '/cms/item/articles', hrefSuffixKey: '_id' }}
      />
    );
  }
  return <p>Something went wrong</p>;
});

export { ArticlesTable };
