/** @jsxImportSource @emotion/react */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import React from 'react';
import { CmsItemState, setField, setFields, setIsLoading } from '../../../redux/slices/cmsItemSlice';
import { colorType, themeType } from '../../../utils/theme/theme';

interface Iaction {
  label: string;
  type: 'icon' | 'button';
  icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  action: () => void;
  color?: colorType;
  disabled?: boolean;
  'data-tip'?: string;
}

interface IItemDetailsPage {
  isEmbedded?: boolean; // controls whether header, padding, tiptap, etc are hidden
}

function ItemDetailsPage(props: IItemDetailsPage) {
  return <></>;
}

interface CustomFieldProps {
  state: CmsItemState;
  dispatch: Dispatch<AnyAction>;
  setStateFunctions: {
    setFields: typeof setFields;
    setField: typeof setField;
    setIsLoading: typeof setIsLoading;
  };
  theme: themeType;
  search: string;
  actions: (Iaction | null)[];
  client: ApolloClient<NormalizedCacheObject>;
}

export { ItemDetailsPage };
export type { Iaction, CustomFieldProps };
