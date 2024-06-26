import type { PayloadAction } from '@reduxjs/toolkit';
import * as toolkitRaw from '@reduxjs/toolkit';
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;
export interface CmsItemState {
  isUnsaved: boolean;
  isLoading: boolean;
}

const initialState: CmsItemState = {
  isUnsaved: false,
  isLoading: false,
};

export const cmsItemSlice = createSlice({
  name: 'cmsItem',
  initialState,
  reducers: {
    /**
     * Sets whether data is loading.
     *
     * _This is useful for disabling fields while new data is fetched._
     */
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLoading } = cmsItemSlice.actions;

export default cmsItemSlice.reducer;
