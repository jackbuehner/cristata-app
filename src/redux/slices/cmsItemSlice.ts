import { createSlice, current, original, PayloadAction } from '@reduxjs/toolkit';
import { get as getProperty, set as setProperty } from 'object-path';
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
        action: PayloadAction<
          field,
          string,
          { key: string; type: string; markUnsaved: boolean; inArrayKey: string }
        >
      ) => {
        // if the value is in an array, set the entire array to the unsaved fields before
        // the value is also set, ensuring that array values are not lost
        if (action.meta.inArrayKey) {
          setProperty(
            state.unsavedFields,
            action.meta.inArrayKey,
            JSON.parse(JSON.stringify(getProperty(current(state.fields), action.meta.inArrayKey)))
          );
        }

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
        } else if (action.meta.type === 'docarray') {
          setProperty(state.fields, action.meta.key, action.payload);

          const parsed = (payload: { __collapsed: boolean }[]) =>
            payload.map((item: { __collapsed: boolean }) => {
              return { ...item, __collapsed: undefined };
            });

          const isDifferent =
            JSON.stringify(parsed(getProperty(original(state.fields) || {}, action.meta.key))) !==
            JSON.stringify(parsed(action.payload));
          if (isDifferent) {
            setProperty(state.unsavedFields, action.meta.key, parsed(action.payload));
            if (action.meta.markUnsaved) state.isUnsaved = true;
          }
        } else {
          setProperty(state.fields, action.meta.key, action.payload);
          setProperty(state.unsavedFields, action.meta.key, action.payload);
          if (action.meta.markUnsaved) state.isUnsaved = true;
        }
      },
      prepare: (
        payload: field,
        key: string,
        type: 'tiptap' | 'reference' | 'docarray' | 'default' = 'default',
        markUnsaved = true,
        inArrayKey: string = ''
      ) => ({
        payload,
        type,
        meta: { key, type, markUnsaved, inArrayKey },
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
