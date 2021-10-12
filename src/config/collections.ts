import { Row } from 'react-table';
import { articles } from './collections/articles';
import { photoRequests } from './collections/photoRequests';
import { photos } from './collections/photos';
import { satire } from './collections/satire';
import { shorturl } from './collections/shorturl';
import { featuredSettings } from './collections/featuredSettings';
import { socialArticles } from './collections/socialArticles';

const collections: collectionsType = {
  articles,
  photoRequests,
  photos,
  satire,
  shorturl,
  featuredSettings,
  socialArticles,
};

interface collectionsType {
  [key: string]: collection<any> | undefined;
}

interface collection<I> {
  fields: IField[];
  columns: Array<{
    key: string;
    label?: string;
    width?: number;
    render?: (data: { [key: string]: any }) => React.ReactElement;
    filter?: string;
    isSortable?: false;
    sortType?: string | ((rowA: Row, rowB: Row, columnId: string, desc: boolean) => -1 | 0 | 1);
  }>;
  isPublishable?: boolean;
  canWatch?: boolean;
  publishStage?: number;
  home: string;
  collectionName?: string;
  defaultSortKey?: string;
}

interface tiptapOptions {
  type: string;
  isHTMLkey?: string;
  keys_article?: {
    headline: string;
    description: string;
    categories: string;
    caption: string;
    photo_url: string;
    authors: string;
    target_publish_at: string;
  };
}

interface IField {
  key: string;
  label?: string; // fall back to name if not provided
  type: string;
  description?: string;
  tiptap?: tiptapOptions;
  options?: Array<{
    value: string;
    label: string;
    isDisabled?: boolean;
  }>;
  isDisabled?: boolean;
  dataType?: string;
  async_options?: (inputValue: string) => Promise<Array<{ value: string; label: string }>>;
}

export { collections };
export type { collection, tiptapOptions };
