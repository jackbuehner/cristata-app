import type { PayloadAction } from '@reduxjs/toolkit';
import * as toolkitRaw from '@reduxjs/toolkit';
import type { FluentIconNames } from '../../components/FluentIcon';
import type { colorType } from '../../utils/theme/theme';
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

export interface AppbarState {
  name: string;
  icon?: FluentIconNames;
  color: colorType;
  actions: Action[];
  loading: boolean | number;
  showSearch: boolean;
}

interface Action {
  label: string;
  type: 'icon' | 'button';
  icon?: FluentIconNames;
  action: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onAuxClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  color?: colorType;
  disabled?: boolean;
  'data-tip'?: string;
  showChevron?: boolean;
  flipChevron?: boolean;
}

const initialState: AppbarState = {
  name: 'Cristata',
  color: 'primary',
  actions: [],
  loading: false,
  showSearch: false,
};

export const appbarSlice = createSlice({
  name: 'appbar',
  initialState,
  reducers: {
    setAppName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setAppIcon: (state, action: PayloadAction<FluentIconNames>) => {
      state.icon = action.payload;
    },
    setAppColor: (state, action: PayloadAction<colorType>) => {
      state.color = action.payload;
    },
    setAppActions: (state, action: PayloadAction<(Action | null)[]>) => {
      state.actions = action.payload.filter((action): action is Action => !!action);
    },
    setAppLoading: (state, action: PayloadAction<boolean | number>) => {
      state.loading = action.payload;
    },
    setAppSearchShown: (state, action: PayloadAction<boolean>) => {
      state.showSearch = action.payload;
    },
  },
});

export const { setAppName, setAppIcon, setAppColor, setAppActions, setAppLoading, setAppSearchShown } =
  appbarSlice.actions;

export default appbarSlice.reducer;
export type { Action };
