import useAxios from 'axios-hooks';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Column } from 'react-table';
import { Chip } from '../../components/Chip';
import { Table } from '../../components/Table';

// userID from GitHub is just a number
type GitHubUserID = number;

// permissions groups
enum Teams {
  ADMIN = 4642417,
  ANY = 0,
}

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
    created_by?: GitHubUserID;
    modified_by?: GitHubUserID[];
    last_modified_by: GitHubUserID;
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
  // get articles
  const [{ data, loading, error }, refetch] = useAxios('/articles');

  // make a function available to the parent element via a ref
  useImperativeHandle(ref, () => ({
    refetchData() {
      refetch();
      console.log('hello world');
    },
  }));

  const columns: Column<{ [key: string]: any } | IArticle>[] = useMemo(
    () => [
      {
        Header: 'Headline', // string
        accessor: 'name', // string
        width: 350, // string or number
      },
      {
        Header: 'Stage',
        id: 'stage',
        accessor: (data) => <Chip label={Stage[data.stage].toLowerCase()} />,
        filter: 'excludes',
      },
      {
        Header: 'Summary',
        accessor: 'description',
        width: 250,
      },
      {
        Header: 'isLocked',
        id: 'locked', // use id when accessor is a function
        accessor: (data) => data.locked?.toString(), // convert the boolean data to string data
      },
      {
        Header: 'Categories',
        id: 'categories',
        accessor: (data) => (
          <div>
            {data.categories?.map((category: string, index: number) => {
              if (category === '') return '';
              return <Chip key={index} label={category} />;
            })}
          </div>
        ),
        width: 180,
      },
      {
        Header: 'Tags',
        id: 'tags',
        accessor: (data) => (
          <div>
            {data.tags?.map((tag: string, index: number) => {
              if (tag === '') return '';
              return <Chip key={index} label={tag} />;
            })}
          </div>
        ),
        width: 180,
      },
      {
        Header: 'Created by',
        id: 'people.created_by',
        accessor: (data) => data.people?.created_by?.toString(),
      },
      {
        Header: 'Last modified by',
        id: 'people.last_modified_by',
        accessor: (data) => data.people?.last_modified_by?.toString(),
      },
    ],
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

  return (
    <Table
      data={{ data, loading, error }}
      columns={columns}
      filters={props.filters}
      row={{ href: '/cms/item/articles', hrefSuffixKey: '_id' }}
    />
  );
});

export { ArticlesTable };
