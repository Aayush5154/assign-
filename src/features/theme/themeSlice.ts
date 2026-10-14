import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from '@/lib/storage/localStorage';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
}

const initialState: ThemeState = { mode: 'dark', hydrated: false };

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    hydrate(state) {
      const stored = readLocalStorage<string | null>(STORAGE_KEYS.theme, null);
      state.mode = stored === 'light' || stored === 'dark' ? stored : 'dark';
      state.hydrated = true;
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = state.mode;
        document.documentElement.classList.toggle('light', state.mode === 'light');
      }
    },
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      writeLocalStorage(STORAGE_KEYS.theme, state.mode);
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = state.mode;
        document.documentElement.classList.toggle('light', state.mode === 'light');
      }
    },
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      writeLocalStorage(STORAGE_KEYS.theme, state.mode);
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = state.mode;
        document.documentElement.classList.toggle('light', state.mode === 'light');
      }
    },
  },
});

export const { hydrate: hydrateTheme, setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
export const selectTheme = (s: { theme: ThemeState }) => s.theme.mode;
