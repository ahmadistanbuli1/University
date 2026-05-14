import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const TOKEN_KEY = 'university_token';
const USER_KEY = 'university_user';

function readPersisted(): AuthState {
  if (typeof localStorage === 'undefined') {
    return { token: null, user: null };
  }
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    if (token && user) {
      return { token, user };
    }
  } catch {
    /* ignore */
  }
  return { token: null, user: null };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, user: null } as AuthState,
  reducers: {
    hydrateFromStorage(state) {
      const next = readPersisted();
      state.token = next.token;
      state.user = next.user;
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { hydrateFromStorage, setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
