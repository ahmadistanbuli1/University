import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};

const initialState: AuthState = { status: 'unknown', user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user;
      state.status = 'authenticated';
    },
    clearCredentials(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthStatus } = authSlice.actions;
export const authReducer = authSlice.reducer;
