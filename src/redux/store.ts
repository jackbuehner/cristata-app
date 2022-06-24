import { configureStore } from '@reduxjs/toolkit';
import appbarReducer from './slices/appbarSlice';
import authUserReducer from './slices/authUserSlice';
import cmsItemReducer from './slices/cmsItemSlice';
import graphiqlReducer from './slices/graphiqlSlice';

const store = configureStore({
  reducer: {
    appbar: appbarReducer,
    authUser: authUserReducer,
    cmsItem: cmsItemReducer,
    graphiql: graphiqlReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['appbar/setAppActions'],
        ignoredPaths: ['appbar.actions'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { store };
export type { RootState, AppDispatch };
