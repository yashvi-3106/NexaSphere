import { configureStore } from '@reduxjs/toolkit';
import connectivityReducer from './slices/connectivitySlice';

export const store = configureStore({
  reducer: {
    connectivity: connectivityReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
