import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import { colorType } from '../../utils/theme/theme';

export interface AppbarState {
  name: string;
  icon?: React.ComponentType;
  color: colorType;
  actions: Action[];
  loading: boolean;
}

interface Action {
  label: string;
  type: 'icon' | 'button';
  icon?: React.ComponentType;
  action: () => void;
  color?: colorType;
  disabled?: boolean;
  'data-tip'?: string;
}

const initialState: AppbarState = {
  name: 'Cristata',
  color: 'primary',
  actions: [],
  loading: false,
};

export const appbarSlice = createSlice({
  name: 'appbar',
  initialState,
  reducers: {
    setAppName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setAppIcon: (state, action: PayloadAction<React.ComponentType>) => {
      state.icon = action.payload;
    },
    setAppColor: (state, action: PayloadAction<colorType>) => {
      state.color = action.payload;
    },
    setAppActions: (state, action: PayloadAction<Action[]>) => {
      state.actions = action.payload;
    },
    setAppLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAppName, setAppIcon, setAppColor, setAppActions, setAppLoading } = appbarSlice.actions;

export default appbarSlice.reducer;
