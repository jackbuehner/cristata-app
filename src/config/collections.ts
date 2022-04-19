import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import React, { Dispatch, SetStateAction } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast as toastify } from 'react-toastify';
import { CreateNewStateType } from '../pages/CMS/CollectionPage/CollectionPage';
import { CustomFieldProps } from '../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { CmsItemState } from '../redux/slices/cmsItemSlice';
import { articles } from './collections/articles';
import { flush } from './collections/flush';
import { photoRequests } from './collections/photoRequests';
import { satire } from './collections/satire';
import { shorturl } from './collections/shorturl';

const collections: collectionsType = {
  Article: articles,
  PhotoRequest: photoRequests,
  Satire: satire,
  ShortUrl: shorturl,
  Flush: flush,
};

interface collectionsType {
  [key: string]: collection | undefined;
}

interface collection {
  /**
   * A list of field keys that must always be retreived when querying the server.
   *
   * @deprecated
   */
  forceFields?: string[];
  /**
   * @deprecated Specify in server config.
   */
  fields?: IField[];
  /**
   * @deprecated Not used in new item page layout.
   */
  itemPageTitle?: (data: CmsItemState['fields']) => string;
  createNew?: (
    loadingState: [boolean, Dispatch<SetStateAction<boolean>>],
    client: ApolloClient<NormalizedCacheObject>,
    toast: typeof toastify,
    history: NavigateFunction,
    createNewModal: {
      state: [CreateNewStateType, Dispatch<SetStateAction<CreateNewStateType>>];
      modal: [() => void, () => void];
    }
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
    isDisabled?: boolean | ((currentValues: string[]) => boolean);
    hidden?: boolean;
  }>;
  isDisabled?: boolean;
  dataType?: string;
  async_options?: (
    inputValue: string,
    client: ApolloClient<NormalizedCacheObject>
  ) => Promise<Array<{ value: string; label: string }>>;
  modifyValue?: (
    value: unknown,
    fields: CmsItemState['fields'],
    client: ApolloClient<NormalizedCacheObject>
  ) => string; // for arrays of values, each value is individually put through this function
  Component?: React.ComponentType<CustomFieldProps>;
}

export { collections };
export type { collection, tiptapOptions, IField };
