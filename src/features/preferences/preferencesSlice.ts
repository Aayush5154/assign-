import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, UserPreferences } from '@/types/content';
import { DEFAULT_CATEGORIES } from '@/lib/constants/categories';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from '@/lib/storage/localStorage';
import { categorySchema } from '@/lib/validation/schemas';

interface PreferencesState extends UserPreferences {
  hydrated: boolean;
}

function loadInitial(): PreferencesState {
  const fallback: PreferencesState = {
    categories: DEFAULT_CATEGORIES,
    personalizedMode: true,
    hydrated: false,
  };
  if (typeof window === 'undefined') return fallback;
  const stored = readLocalStorage<Partial<UserPreferences> | null>(STORAGE_KEYS.preferences, null);
  if (!stored || !Array.isArray(stored.categories)) return { ...fallback, hydrated: true };
  const valid = stored.categories.filter((c): c is Category => categorySchema.safeParse(c).success);
  if (valid.length === 0) return { ...fallback, hydrated: true };
  return {
    categories: valid,
    personalizedMode: stored.personalizedMode !== false,
    hydrated: true,
  };
}

const initialState: PreferencesState = {
  categories: DEFAULT_CATEGORIES,
  personalizedMode: true,
  hydrated: false,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    hydrate(state) {
      const loaded = loadInitial();
      state.categories = loaded.categories;
      state.personalizedMode = loaded.personalizedMode;
      state.hydrated = true;
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      const valid = action.payload.filter((c) => categorySchema.safeParse(c).success);
      if (valid.length === 0) return;
      state.categories = [...new Set(valid)];
      writeLocalStorage(STORAGE_KEYS.preferences, {
        categories: state.categories,
        personalizedMode: state.personalizedMode,
      });
    },
    toggleCategory(state, action: PayloadAction<Category>) {
      const cat = action.payload;
      if (state.categories.includes(cat)) {
        if (state.categories.length === 1) return;
        state.categories = state.categories.filter((c) => c !== cat);
      } else {
        state.categories = [...state.categories, cat];
      }
      writeLocalStorage(STORAGE_KEYS.preferences, {
        categories: state.categories,
        personalizedMode: state.personalizedMode,
      });
    },
    setPersonalizedMode(state, action: PayloadAction<boolean>) {
      state.personalizedMode = action.payload;
      writeLocalStorage(STORAGE_KEYS.preferences, {
        categories: state.categories,
        personalizedMode: state.personalizedMode,
      });
    },
    resetPreferences(state) {
      state.categories = DEFAULT_CATEGORIES;
      state.personalizedMode = true;
      writeLocalStorage(STORAGE_KEYS.preferences, {
        categories: state.categories,
        personalizedMode: state.personalizedMode,
      });
    },
  },
});

export const {
  hydrate: hydratePreferences,
  setCategories,
  toggleCategory,
  setPersonalizedMode,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const selectCategories = (s: { preferences: PreferencesState }) => s.preferences.categories;
export const selectPersonalizedMode = (s: { preferences: PreferencesState }) =>
  s.preferences.personalizedMode;
