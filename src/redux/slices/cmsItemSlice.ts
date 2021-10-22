import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { flattenObject } from '../../utils/flattenObject';

type field = any;
type fields = { [key: string]: field };

export interface CmsItemState {
  fields: fields;
  unsavedFields: fields;
  tipTapFields: { [key: string]: string }; // JSON string of prosmirror content
  isUnsaved: boolean;
  isLoading: boolean;
}

const initialState: CmsItemState = {
  fields: {},
  unsavedFields: {},
  tipTapFields: {},
  isUnsaved: false,
  isLoading: false,
};

export const cmsItemSlice = createSlice({
  name: 'cmsItem',
  initialState,
  reducers: {
    /**
     * Stores the item's fields in the state and clears other special fields states.
     *
     * _This payload is always flattened._
     */
    setFields: (state, action: PayloadAction<fields>) => {
      state.fields = flattenObject(action.payload);
      state.unsavedFields = {};
      state.tipTapFields = {};
      state.isUnsaved = false;
    },
    /**
     * Updates a field's value in `fields` and `unsavedFields`.
     *
     */
    setField: {
      reducer: (state, action: PayloadAction<field, string, { key: string }>) => {
        if (action.type === 'tiptap') state.tipTapFields[action.meta.key] = action.payload;
        else {
          state.fields[action.meta.key] = action.payload;
          state.unsavedFields[action.meta.key] = action.payload;
          state.isUnsaved = true;
        }
      },
      prepare: (payload: field, key: string, type: 'tiptap' | 'default' = 'default') => ({
        payload,
        type,
        meta: { key },
      }),
    },
    /**
     * Clears unsaved fields.
     */
    clearUnsavedFields: (state) => {
      state.unsavedFields = {};
      state.isUnsaved = false;
    },
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

export const { setFields, setField, clearUnsavedFields, setIsLoading } = cmsItemSlice.actions;

export default cmsItemSlice.reducer;
