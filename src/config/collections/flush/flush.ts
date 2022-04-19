import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { collection } from '../../collections';
import { FlushDocumentEditor } from './FlushDocumentEditor';
import roman from 'romans';
import { gql } from '@apollo/client';

const flush: collection = {
  forceFields: [
    'events.name',
    'events.date',
    'events.location',
    'articles.featured._id',
    'articles.featured.name',
    'articles.featured.categories',
    'articles.featured.description',
    'articles.featured.photo_path',
    'articles.featured.body',
    'articles.featured.people.authors.name',
    'articles.more._id',
    'articles.more.name',
    'articles.more.categories',
    'timestamps.week',
    'volume',
    'issue',
    'left_advert_photo_url',
    'hidden',
  ],
  fields: [{ key: 'events', type: 'custom', Component: FlushDocumentEditor }],
  itemPageTitle: (fields) =>
    `The Royal Flush – Vol. ${
      !isNaN(parseInt(fields['volume'])) ? roman.romanize(parseInt(fields['volume'])) : '??'
    }, Iss. ${fields.issue || '??'}`,
  createNew: ([loading, setIsLoading], client, toast, navigate) => {
    setIsLoading(true);
    client
      .mutate<{ flushCreate?: { _id: string } }>({
        mutation: gql`
          mutation Create($volume: Int!, $issue: Int!) {
            flushCreate(volume: $volume, issue: $issue) {
              _id
            }
          }
        `,
        variables: {
          volume: 99,
          issue: 99,
        },
      })
      .then(({ data }) => {
        setIsLoading(false);
        // navigate to the new document upon successful creation
        navigate(`/cms/item/flush/${data?.flushCreate?._id}`);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error(err);
        toast.error(`Failed to save changes. \n ${err.message}`);
      });
  },
};

interface IFlush {
  events?: {
    name: string;
    date: string; // ISO string
    location: string;
  }[];
  articles?: {
    featured?: string; // mongoos object id
    more?: string[]; // mongoos object id
  };
  permissions: {
    teams: string[]; // team ids
    users?: GitHubUserID[];
  };
  timestamps: {
    created_at: string; // ISO string
    modified_at: string; // ISO string
    published_at: string; // ISO string
    updated_at: string; // ISO string
    week: string; // ISO string
  };
  people: {
    created_by?: IProfile;
    modified_by?: IProfile[];
    last_modified_by: IProfile;
    published_by?: IProfile[];
    last_published_by?: IProfile;
    watching?: IProfile[];
  };
  volume?: number;
  issue?: number;
  left_advert_photo_url?: string;
  hidden: boolean;
  history?: { type: string; user: GitHubUserID; at: string }[];
}

export { flush };
export type { IFlush };
