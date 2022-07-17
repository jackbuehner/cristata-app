import { createSlice, original, PayloadAction } from '@reduxjs/toolkit';
import { set as setProperty } from 'object-path';
import { GenCollectionInput } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genCollection';
import { SchemaType } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import {
  CollectionPermissionsActions as CollectionPermissionsActionName,
  CollectionPermissionsType,
} from '@jackbuehner/cristata-api/dist/types/config';
import { RootQuerySelector } from 'mongoose';

type FilterQuery = RootQuerySelector<Record<string, unknown>>;

export interface CollectionSliceState {
  isUnsaved: boolean;
  isLoading: boolean;
  collection: {
    canPublish: GenCollectionInput['canPublish'];
    withPermissions: GenCollectionInput['withPermissions'];
    withSubscription: GenCollectionInput['withSubscription'];
    name: GenCollectionInput['name'];
    navLabel?: GenCollectionInput['navLabel'];
    schemaDef: GenCollectionInput['schemaDef'];
    by?: GenCollectionInput['by'];
    publicRules: GenCollectionInput['publicRules'];
    customQueries?: GenCollectionInput['customQueries'];
    customMutations?: GenCollectionInput['customMutations'];
    actionAccess: GenCollectionInput['actionAccess'];
    options?: GenCollectionInput['options'];
  } | null;
}

const initialState: CollectionSliceState = {
  collection: null,
  isUnsaved: false,
  isLoading: false,
};

export const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    /**
     * Sets the collection in redux state. Should only be
     * used with a fresh copy of the collection because
     * this sets `isUnsaved` to `false`.
     */
    setCollection: (state, action: PayloadAction<GenCollectionInput>) => {
      delete action.payload.singleDocument;
      state.collection = action.payload;
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
    setCanPublish: (state, action: PayloadAction<GenCollectionInput['canPublish']>) => {
      if (state.collection) {
        state.collection.canPublish = action.payload;
        state.isUnsaved = true;
      }
    },
    setWithPermissions: (state, action: PayloadAction<GenCollectionInput['withPermissions']>) => {
      if (state.collection) {
        state.collection.withPermissions = action.payload;
        state.isUnsaved = true;
      }
    },
    setWithSubscription: (state, action: PayloadAction<GenCollectionInput['withSubscription']>) => {
      if (state.collection) {
        state.collection.withSubscription = action.payload;
        state.isUnsaved = true;
      }
    },
    setName: (state, action: PayloadAction<GenCollectionInput['name']>) => {
      if (state.collection) {
        state.collection.name = action.payload;
        state.isUnsaved = true;
      }
    },
    setNavLabel: (state, action: PayloadAction<GenCollectionInput['navLabel']>) => {
      if (state.collection) {
        state.collection.navLabel = action.payload;
        state.isUnsaved = true;
      }
    },
    setRootSchemaDef: (state, action: PayloadAction<GenCollectionInput['schemaDef']>) => {
      if (state.collection) {
        state.collection.schemaDef = action.payload;
        state.isUnsaved = true;
      }
    },
    setAccessor: {
      prepare: (payload: [string, SchemaType], type: 'one' | 'many' | 'all') => {
        return { payload, type, meta: { type } };
      },
      reducer: (
        state,
        action: PayloadAction<[string, SchemaType], string, { type: 'one' | 'many' | 'all' }>
      ) => {
        if (state.collection) {
          // check the existing value
          const existing = original(state.collection.by) || ['_id', 'ObjectId'];

          // check whether it specifically defines the one and many accessors
          // or just uses the same values for each
          const isSpecific = typeof existing === 'object' && !Array.isArray(existing);

          // update the value in state
          switch (action.meta.type) {
            case 'one': {
              if (isSpecific) state.collection.by = { ...existing, one: action.payload };
              else state.collection.by = { one: action.payload, many: existing };
              break;
            }
            case 'many': {
              if (isSpecific) state.collection.by = { ...existing, many: action.payload };
              else state.collection.by = { one: existing, many: action.payload };
              break;
            }
            case 'all': {
              state.collection.by = action.payload;
              break;
            }
          }
        }

        // mark the state as unsaved
        state.isUnsaved = true;
      },
    },
    setPublicRules: (state, action: PayloadAction<false | FilterQuery | string>) => {
      if (state.collection) {
        // check the existing value
        const existing = original(state.collection.publicRules);

        // if the payload is false, we should disable public access
        if (action.payload === false) {
          state.collection.publicRules = false;
        }

        // at this point, if the existing value in state is false, we need to
        // create the object with default values
        if (existing === false) {
          state.collection.publicRules = { filter: {} };
        }

        // if the payload is a filter query, we should set the filter query
        if (typeof action.payload === 'object' && state.collection.publicRules) {
          state.collection.publicRules.filter = action.payload;
        }

        // if the payload is a string, we should set the slug date fule
        if (typeof action.payload === 'string' && state.collection.publicRules) {
          state.collection.publicRules.slugDateField = action.payload;
        }

        // mark the state as unsaved
        state.isUnsaved = true;
      }
    },
    setCustomQueries: (state, action: PayloadAction<GenCollectionInput['customQueries']>) => {
      if (state.collection) {
        state.collection.customQueries = action.payload;
        state.isUnsaved = true;
      }
    },
    setCustomMutations: (state, action: PayloadAction<GenCollectionInput['customMutations']>) => {
      if (state.collection) {
        state.collection.customMutations = action.payload;
        state.isUnsaved = true;
      }
    },
    setActionAccess: {
      prepare: (action: CollectionPermissionsActionName, permission: CollectionPermissionsType) => {
        return { payload: { action, permission } };
      },
      reducer: (
        state,
        action: PayloadAction<{
          action: CollectionPermissionsActionName;
          permission: CollectionPermissionsType;
        }>
      ) => {
        if (state.collection) {
          state.collection.actionAccess = {
            ...state.collection.actionAccess,
            [action.payload.action]: action.payload.permission,
          };

          // mark the state as unsaved
          state.isUnsaved = true;
        }
      },
    },
    setMandatoryWatchers: (state, action: PayloadAction<MandatoryWatchers>) => {
      if (state.collection) {
        if (!state.collection.options) state.collection.options = {};
        state.collection.options.mandatoryWatchers = action.payload;
        state.isUnsaved = true;
      }
    },
    setWatcherNotices: (state, action: PayloadAction<WatcherNotices>) => {
      if (state.collection) {
        if (!state.collection.options) state.collection.options = {};
        state.collection.options.watcherNotices = action.payload;
        state.isUnsaved = true;
      }
    },
    setRootSchemaProperty: {
      prepare: (path: string, key: string, value: unknown) => {
        return { payload: { path: `${[path]}.${key}`, value } };
      },
      reducer: (state, action: PayloadAction<{ path: string; value: unknown }>) => {
        if (state.collection) {
          // set the property using the constructed path and value
          // this method works even if the exact path does not already exist
          setProperty(state.collection.schemaDef, action.payload.path, action.payload.value);

          // mark the state as unsaved
          state.isUnsaved = true;
        }
      },
    },
    setDefaultQueryOption: {
      prepare: (option: DefaultQueryOption, value: boolean | undefined) => {
        return { payload: { option, value } };
      },
      reducer: (state, action: PayloadAction<{ option: DefaultQueryOption; value: boolean | undefined }>) => {
        if (state.collection) {
          if (!state.collection.options) state.collection.options = {};
          state.collection.options[action.payload.option] = action.payload.value;
          state.isUnsaved = true;
        }
      },
    },
  },
});

type DefaultQueryOption =
  | 'disableFindOneQuery'
  | 'disableFindManyQuery'
  | 'disableActionAccessQuery'
  | 'disablePublicFindOneQuery'
  | 'disablePublicFindOneBySlugQuery'
  | 'disablePublicFindManyQuery';
type MandatoryWatchers = string[];
type WatcherNotices = {
  subjectField: string;
  stageField: string;
  stageMap: Record<number, string>;
  fields: Array<{
    name: string;
    label: string;
    numMap?: Record<number, string>;
  }>;
};

export const {
  setCollection,
  setIsLoading,
  setCanPublish,
  setWithPermissions,
  setWithSubscription,
  setName,
  setNavLabel,
  setRootSchemaDef,
  setAccessor,
  setPublicRules,
  setCustomQueries,
  setCustomMutations,
  setActionAccess,
  setMandatoryWatchers,
  setWatcherNotices,
  setRootSchemaProperty,
  setDefaultQueryOption,
} = collectionSlice.actions;

export default collectionSlice.reducer;
