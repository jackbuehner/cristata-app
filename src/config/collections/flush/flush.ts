import { GitHubUserID, IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';
import { collection } from '../../collections';
import { FlushDocumentEditor } from './FlushDocumentEditor';
import roman from 'romans';

const flush: collection<IFlush> = {
  home: '/cms/collection/flush',
  fields: [{ key: 'events', type: 'custom', Component: FlushDocumentEditor }],
  columns: [
    { key: 'volume' },
    { key: 'issue' },
    { key: 'hidden', label: 'hidden', filter: 'excludes', width: 1 },
  ],
  row: {
    href: '/cms/item/flush',
    hrefSuffixKey: '_id',
    windowName: window.matchMedia('(display-mode: standalone)').matches ? 'flusher' : undefined,
  },
  isPublishable: true,
  canWatch: true,
  pageTitle: () => `The Royal Flush`,
  pageDescription: () => `The Paladin Network's restroom newsletter`,
  itemPageTitle: (fields) =>
    `The Royal Flush – Vol. ${
      !isNaN(parseInt(fields['volume'])) ? roman.romanize(parseInt(fields['volume'])) : '??'
    }, Iss. ${fields.issue || '??'}`,
  tableFilters: () => [{ id: 'hidden', value: 'true' }],
  createNew: ([loading, setIsLoading], toast, history) => {
    setIsLoading(true);
    db.post(`/flush`)
      .then(({ data }) => {
        setIsLoading(false);
        history.push(`/cms/item/flush/${data._id}`);
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
