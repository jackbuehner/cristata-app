import { Row } from 'react-table';
import { articles } from './collections/articles';
import { photoRequests } from './collections/photoRequests';
import { photos } from './collections/photos';
import { satire } from './collections/satire';
import { shorturl } from './collections/shorturl';
import { featuredSettings } from './collections/featuredSettings';
import { socialArticles } from './collections/socialArticles';
import { IProfile } from '../interfaces/cristata/profiles';
import { History } from 'history';
import { toast as toastify } from 'react-toastify';
import { Dispatch, SetStateAction } from 'react';

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
  row?: {
    href: string;
    hrefSuffixKey: string;
    hrefSearch?: string;
    windowName?: string;
  };
  isPublishable?: boolean;
  canWatch?: boolean;
  publishStage?: number;
  home: string;
  collectionName?: string;
  pageTitle?: (progress: string, search: string) => string;
  pageDescription?: (progress: string, search: string) => string;
  defaultSortKey?: string;
  onTableData?: (data: I[], users: IProfile[]) => I[];
  tableFilters?: (progress: string, search: string) => { id: string; value: string }[];
  createNew?: (
    loadingState: [boolean, Dispatch<SetStateAction<boolean>>],
    toast: typeof toastify,
    history: History
  ) => void;
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
  features: {
    fontFamilies?: {
      name: string;
      label?: string;
      disabled?: boolean;
    }[];
    fontSizes?: string[];
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    textStylePicker?: boolean;
    horizontalRule?: boolean;
    widgets?: {
      sweepwidget?: boolean;
      youtube?: boolean;
    };
    link?: boolean;
    comment?: boolean;
    trackChanges?: boolean;
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
  modifyValue?: (value: unknown) => string; // for arrays of values, each value is individually put through this function
}

export { collections };
export type { collection, tiptapOptions };
