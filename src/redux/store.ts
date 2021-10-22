import { configureStore } from '@reduxjs/toolkit';
import cmsItemReducer from './slices/cmsItemSlice';

const store = configureStore({
  reducer: {
    cmsItem: cmsItemReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export { store };
export type { RootState, AppDispatch };
