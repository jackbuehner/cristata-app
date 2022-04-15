import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { set as setProperty } from 'object-path';
import { isObject } from '../../utils/isObject';

type field = any;
type fields = { [key: string]: field };

export interface CmsItemState {
  fields: fields;
  unsavedFields: fields;
  tipTapFields: { [key: string]: string }; // JSON string of prosmirror content
  unsavedPermissions: fields;
  isUnsaved: boolean;
  isLoading: boolean;
}

const initialState: CmsItemState = {
  fields: {},
  unsavedFields: {},
  tipTapFields: {},
  unsavedPermissions: {},
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
      state.fields = action.payload;
      state.unsavedFields = {};
      state.tipTapFields = {};
      state.isUnsaved = false;
    },
    /**
     * Updates a field's value in `fields` and `unsavedFields`.
     *
     */
    setField: {
      reducer: (
        state,
        action: PayloadAction<field, string, { key: string; type: string; markUnsaved: boolean }>
      ) => {
        if (action.type === 'tiptap') state.tipTapFields[action.meta.key] = action.payload;
        else if (action.meta.type === 'reference') {
          const isMultiReference = Array.isArray(action.payload);
          if (isMultiReference) {
            const parsedPayload = action.payload.map((item: unknown) => {
              if (isObject(item)) return item._id;
              return item;
            });
            setProperty(state.unsavedFields, action.meta.key, parsedPayload);
          } else {
            if (isObject(action.payload)) setProperty(state.unsavedFields, action.meta.key, action.payload._id);
            else setProperty(state.unsavedFields, action.meta.key, action.payload);
          }
          setProperty(state.fields, action.meta.key, action.payload);
          if (action.meta.markUnsaved) state.isUnsaved = true;
        } else {
          setProperty(state.fields, action.meta.key, action.payload);
          setProperty(state.unsavedFields, action.meta.key, action.payload);
          if (action.meta.markUnsaved) state.isUnsaved = true;
        }
      },
      prepare: (
        payload: field,
        key: string,
        type: 'tiptap' | 'reference' | 'default' = 'default',
        markUnsaved = true
      ) => ({
        payload,
        type,
        meta: { key, type, markUnsaved },
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
    /**
     * Sets the unsaved permissions fields, to be used when only saving
     * changes to permissions.
     */
    setUnsavedPermissionField: {
      reducer: (state, action: PayloadAction<field, string, { key: string }>) => {
        setProperty(state.unsavedPermissions, action.meta.key, action.payload);
      },
      prepare: (payload: field, key: string) => ({ payload, meta: { key } }),
    },
  },
});

export const { setFields, setField, clearUnsavedFields, setIsLoading, setUnsavedPermissionField } =
  cmsItemSlice.actions;

export default cmsItemSlice.reducer;
