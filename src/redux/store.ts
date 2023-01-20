import * as toolkitRaw from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import appbarReducer from './slices/appbarSlice';
import authUserReducer from './slices/authUserSlice';
import cmsItemReducer from './slices/cmsItemSlice';
import collectionReducer from './slices/collectionSlice';
import graphiqlReducer from './slices/graphiqlSlice';
import storage from './storage';
const { configureStore } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

const reducers = combineReducers({
  appbar: appbarReducer,
  authUser: authUserReducer,
  cmsItem: cmsItemReducer,
  graphiql: graphiqlReducer,
  collectionConfig: collectionReducer,
});

const persistedReducer = persistReducer(
  {
    key: 'redux-root',
    storage,
    whitelist: ['authUser'],
  },
  reducers
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['appbar/setAppActions', 'persist/PERSIST'],
        ignoredPaths: ['appbar.actions'],
      },
    }),
});

const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { persistor, store };
export type { AppDispatch, RootState };
