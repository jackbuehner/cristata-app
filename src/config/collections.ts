import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import React from 'react';
import { CustomFieldProps } from '../pages/CMS/ItemDetailsPage/ItemDetailsPage';
import { CmsItemState } from '../redux/slices/cmsItemSlice';

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

export type { tiptapOptions, IField };
