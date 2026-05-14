import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice.js';
import { themeReducer } from './themeSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
