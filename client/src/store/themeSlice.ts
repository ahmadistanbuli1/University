import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'university_theme';

function readTheme(): ThemeMode {
  try {
    if (typeof localStorage === 'undefined') return 'light';
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: readTheme() as ThemeMode },
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      try {
        localStorage.setItem(THEME_KEY, action.payload);
      } catch {
        /* ignore */
      }
    },
    toggleTheme(state) {
      const next: ThemeMode = state.mode === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* ignore */
      }
      state.mode = next;
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
