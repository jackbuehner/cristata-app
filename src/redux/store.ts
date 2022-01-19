import { configureStore } from '@reduxjs/toolkit';
import cmsItemReducer from './slices/cmsItemSlice';
import authUserReducer from './slices/authUserSlice';

const store = configureStore({
  reducer: {
    cmsItem: cmsItemReducer,
    authUser: authUserReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { store };
export type { RootState, AppDispatch };
