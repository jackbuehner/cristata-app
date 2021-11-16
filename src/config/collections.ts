import { Row } from 'react-table';
import { articles } from './collections/articles';
import { photoRequests } from './collections/photoRequests';
import { photos } from './collections/photos';
import { satire } from './collections/satire';
import { shorturl } from './collections/shorturl';
import { featuredSettings } from './collections/featuredSettings';
import { socialArticles } from './collections/socialArticles';
import { History } from 'history';
import { toast as toastify } from 'react-toastify';
import React, { Dispatch, SetStateAction } from 'react';
import { CmsItemState } from '../redux/slices/cmsItemSlice';
import { flush } from './collections/flush';
import { CustomFieldProps } from '../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { mongoFilterType, mongoSortType } from '../graphql/client';

const collections: collectionsType = {
  articles,
  photoRequests,
  photos,
  satire,
  shorturl,
  featuredSettings,
  socialArticles,
  flush,
};

interface collectionsType {
  [key: string]: collection<any> | undefined;
}

interface collection<I> {
  fields: IField[];
  columns: Array<{
    key: string;
    isJSON?: boolean; // if the key is a JSON field
    subfields?: string[]; // choose subfields for when the key is for a field with subfields
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
  mandatoryWatchers?: string[];
  publishStage?: number;
  home: string;
  collectionName?: string;
  query: {
    name: {
      singular: string;
      plural: string;
    };
    identifier: string;
    force?: string[];
  };
  pageTitle?: (progress: string, search: string) => string;
  pageDescription?: (progress: string, search: string) => string;
  itemPageTitle?: (data: CmsItemState['fields']) => string;
  defaultSortKey?: string;
  prependSort?: (sort: mongoSortType) => mongoSortType | {};
  prependFilter?: (filter: mongoFilterType) => mongoFilterType | {};
  onTableData?: (data: I[]) => I[];
  tableDataFilter?: (progress: string, search: string, filter: mongoFilterType) => mongoFilterType;
  createNew?: (
    loadingState: [boolean, Dispatch<SetStateAction<boolean>>],
    toast: typeof toastify,
    history: History
  ) => void;
}

interface tiptapOptions {
  type: string;
  isHTMLkey?: string;
  layouts?: {
    key: string;
    options: { value: string; label: string }[];
  };
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
      photoWidget?: boolean;
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
  from?: string; // when the key is inside json from a field, include the JSON field name here and use a key inside the json for the key property
  subfield?: string; // choose a subfield when the key is for a field with subfields
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
  modifyValue?: (value: unknown, fields: CmsItemState['fields']) => string; // for arrays of values, each value is individually put through this function
  Component?: React.ComponentType<CustomFieldProps>;
}

export { collections };
export type { collection, tiptapOptions };
