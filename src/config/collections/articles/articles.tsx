import { DateTime } from 'luxon';
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';
import { gql } from '@apollo/client';

const articles: collection = {
  query: {
    name: {
      singular: 'article',
      plural: 'articles',
    },
    identifier: '_id',
    force: ['layout', 'hidden', 'people.authors.name', 'people.authors.photo'],
  },
  columns: [
    { key: 'name', label: 'Headline', width: 350 },
    {
      key: 'stage',
      label: 'Stage',
      render: (data) => {
        enum Stage {
          'Planning' = 1.1,
          'Draft' = 2.1,
          'Editor Review' = 3.1,
          'Revision' = 3.2,
          'Copy Edit' = 3.3,
          'Writer/Editor Check' = 3.5,
          'Upload Approval' = 4.1,
          'Uploaded/Scheduled' = 5.1,
          'Published' = 5.2,
        }
        const Color: { [key: number]: colorType } = {
          1.1: 'neutral',
          2.1: 'neutral',
          3.1: 'orange',
          3.3: 'indigo',
          3.5: 'orange',
          4.1: 'red',
          5.1: 'blue',
          5.2: 'green',
        };

        if (data.stage) {
          return (
            <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} data-number={data.stage} />
          );
        }
        return <></>;
      },
    },
    {
      key: 'people.authors',
      label: 'Authors',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.authors) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
              {data.people.authors.map(
                (author: { name: string; photo?: string; _id: string }, index: number) => {
                  const { name, photo, _id } = author;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} key={index}>
                      <img
                        src={photo ? photo : _id ? genAvatar(_id) : ''}
                        alt={``}
                        style={{ width: 20, height: 20, borderRadius: 2 }}
                      />
                      <span style={{ fontSize: 14 }}>{name}</span>
                    </div>
                  );
                }
              )}
            </div>
          );
        }
        return <></>;
      },
      isSortable: false,
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (data) => {
        const categories: { [key: string]: string } = {
          news: 'News',
          opinion: 'Opinion',
          sports: 'Sports',
          diversity: 'Diversity Matters',
          arts: 'Arts',
          'campus-culture': 'Campus & Culture',
          giveaway: 'Giveaway',
          newsletter: 'Newsletter',
        };
        return (
          <div>
            {data.categories?.map((category: string, index: number) => {
              if (category === '') return '';
              return <Chip key={index} label={categories[category] || category} />;
            })}
          </div>
        );
      },
      width: 180,
      filter: 'includes',
      isSortable: false,
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (data) => (
        <div>
          {data.tags?.map((tag: string, index: number) => {
            if (tag === '') return '';
            return <Chip key={index} label={tag} />;
          })}
        </div>
      ),
      width: 180,
      isSortable: false,
    },
    {
      key: 'timestamps.target_publish_at',
      label: 'Target date',
      render: (data) => {
        if (data.timestamps && data.timestamps.target_publish_at) {
          const date = DateTime.fromISO(data.timestamps.target_publish_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date

          const isLate = DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.now() && data.stage < 5;
          const isIn24hrs =
            DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.fromMillis(Date.now() + 86400000) &&
            data.stage < 5; // one day in advance
          const isSoon =
            DateTime.fromISO(data.timestamps.target_publish_at) < DateTime.fromMillis(Date.now() + 259200000) &&
            data.stage < 5; // three days in advance

          return (
            <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              {date}
              {isLate ? (
                <Chip label={`Late`} color={`red`} />
              ) : isIn24hrs ? (
                <Chip label={`24 hours`} color={`orange`} />
              ) : isSoon ? (
                <Chip label={`Soon`} color={`neutral`} />
              ) : null}
            </div>
          );
        }
        return <></>;
      },
      width: 174,
    },
    {
      key: 'people.editors.copy',
      label: 'Copy edited by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.editors && data.people.editors.copy) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
              {data.people.editors.copy.map(
                (editor: { name: string; photo?: string; _id: string }, index: number) => {
                  const { name, photo, _id } = editor;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} key={index}>
                      <img
                        src={photo ? photo : _id ? genAvatar(_id) : ''}
                        alt={``}
                        style={{ width: 20, height: 20, borderRadius: 2 }}
                      />
                      <span style={{ fontSize: 14 }}>{name}</span>
                    </div>
                  );
                }
              )}
            </div>
          );
        }
        return <></>;
      },
      isSortable: false,
    },
    {
      key: 'people.created_by',
      label: 'Created by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.created_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.created_by.photo
                    ? data.people.created_by.photo
                    : data.people.created_by._id
                    ? genAvatar(data.people.created_by._id)
                    : ''
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.created_by.name}</span>
            </div>
          );
        }
        return <></>;
      },
      isSortable: false,
    },
    {
      key: 'people.last_modified_by',
      label: 'Last modified by',
      subfields: ['name', 'photo', '_id'],
      render: (data) => {
        if (data.people && data.people.last_modified_by) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img
                src={
                  data.people.last_modified_by.photo
                    ? data.people.last_modified_by.photo
                    : data.people.last_modified_by._id
                    ? genAvatar(data.people.last_modified_by._id)
                    : ''
                }
                alt={``}
                style={{ width: 20, height: 20, borderRadius: 2 }}
              />
              <span style={{ fontSize: 14 }}>{data.people.last_modified_by.name}</span>
            </div>
          );
        }
        return <></>;
      },
      isSortable: false,
    },
    {
      key: 'timestamps.modified_at',
      label: 'Last modified',
      render: (data) => {
        if (data.timestamps && data.timestamps.modified_at) {
          const date = DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`);
          if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
          return <div style={{ fontSize: 14 }}>{date}</div>;
        }
        return <></>;
      },
    },
  ],
  row: {
    href: '/cms/collection/articles',
    hrefSuffixKey: '_id',
    hrefSearch: '?fs=1&props=1',
    windowName: window.matchMedia('(display-mode: standalone)').matches ? 'editor' : undefined,
  },
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ articleCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($name: String!) {
            articleCreate(name: $name) {
              _id
            }
          }
        `,
        variables: {
          // generate a document name
          name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
          }),
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        // navigate to the new document upon successful creation
        navigate(`/cms/collection/articles/${data?.articleCreate?._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

// permissions groups
type Teams = string;

// interface for each article
interface IArticle {
  name?: string;
  permissions: {
    teams?: Teams[];
    users: GitHubUserID[];
  };
  locked?: boolean;
  timestamps: {
    created_at?: string;
    modified_at?: string;
    published_at?: string;
    target_publish_at?: string;
  };
  people: {
    authors?: IProfile[];
    created_by?: IProfile;
    modified_by?: IProfile[];
    last_modified_by: IProfile;
    published_by?: IProfile[];
    editors?: {
      primary?: IProfile;
      copy?: IProfile[];
    };
  };
  stage?: Stage;
  categories?: string[];
  tags?: string[];
  description?: string;
  photo_path: string;
  video_path?: string;
  photo_caption?: string;
  body?: string;
  versions?: IArticle[]; // store previous versions of the article
  hidden?: boolean;
  show_comments: boolean;
  legacy_html: boolean; // true if it is html from the old webflow
  history?: { type: string; user: GitHubUserID; at: string }[];
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

export { articles };
export type { IArticle };
