import { gql } from '@apollo/client';
import { DateTime } from 'luxon';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { Chip } from '../../../components/Chip';
import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType } from '../../../utils/theme/theme';
import { collection } from '../../collections';

const satire: collection = {
  query: {
    name: {
      singular: 'satire',
      plural: 'satires',
    },
    identifier: '_id',
    force: ['hidden', 'legacy_html'],
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
          'Pending Edit' = 3.3,
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

        return <Chip label={Stage[data.stage]} color={Color[data.stage] || 'neutral'} />;
      },
    },
    {
      key: 'people.display_authors',
      label: 'Display authors',
      render: (data) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '6px 0' }}>
          {data.people?.display_authors?.map((author: string, index: number) => {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={genAvatar(author)} alt={``} style={{ width: 20, height: 20, borderRadius: 2 }} />
                <span style={{ fontSize: 14 }}>{author}</span>
              </div>
            );
          })}
        </div>
      ),
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
        const date = DateTime.fromISO(data.timestamps?.target_publish_at).toFormat(`LLL. dd, yyyy`);
        if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date

        const isLate = DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.now() && data.stage < 5;
        const isIn24hrs =
          DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.fromMillis(Date.now() + 86400000) &&
          data.stage < 5; // one day in advance
        const isSoon =
          DateTime.fromISO(data.timestamps?.target_publish_at) < DateTime.fromMillis(Date.now() + 259200000) &&
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
      },
      width: 174,
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
        const date = DateTime.fromISO(data.timestamps?.modified_at).toFormat(`LLL. dd, yyyy`);
        if (date === 'Dec. 31, 0000') return <span></span>; // this is the default date
        return <div style={{ fontSize: 14 }}>{date}</div>;
      },
    },
  ],
  row: { href: '/cms/collection/satire', hrefSuffixKey: '_id' },
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ satireCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($name: String!) {
            satireCreate(name: $name) {
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
        navigate(`/cms/collection/satire/${data?.satireCreate?._id}`);
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
    authors?: IProfile[];
    created_by?: IProfile;
    display_authors?: string[];
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
}

export { satire };
export type { ISatire };
