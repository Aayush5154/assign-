import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FavoriteItem, FavoriteType } from '@/types/content';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from '@/lib/storage/localStorage';

interface FavoritesState {
  items: FavoriteItem[];
  hydrated: boolean;
}

const initialState: FavoritesState = { items: [], hydrated: false };

function persist(items: FavoriteItem[]) {
  writeLocalStorage(STORAGE_KEYS.favorites, items);
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    hydrate(state) {
      const stored = readLocalStorage<FavoriteItem[] | null>(STORAGE_KEYS.favorites, null);
      state.items = Array.isArray(stored)
        ? stored.filter((f) => f && typeof f.id === 'string' && typeof f.type === 'string')
        : [];
      state.hydrated = true;
    },
    addFavorite(state, action: PayloadAction<FavoriteItem>) {
      const exists = state.items.some(
        (f) => f.id === action.payload.id && f.type === action.payload.type,
      );
      if (exists) return;
      state.items.unshift({ ...action.payload, addedAt: new Date().toISOString() });
      persist(state.items);
    },
    removeFavorite(state, action: PayloadAction<{ id: string; type: FavoriteType }>) {
      state.items = state.items.filter(
        (f) => !(f.id === action.payload.id && f.type === action.payload.type),
      );
      persist(state.items);
    },
    toggleFavorite(state, action: PayloadAction<FavoriteItem>) {
      const idx = state.items.findIndex(
        (f) => f.id === action.payload.id && f.type === action.payload.type,
      );
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.unshift({ ...action.payload, addedAt: new Date().toISOString() });
      }
      persist(state.items);
    },
    clearFavorites(state) {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { hydrate: hydrateFavorites, addFavorite, removeFavorite, toggleFavorite, clearFavorites } =
  favoritesSlice.actions;

export default favoritesSlice.reducer;

export const selectFavorites = (s: { favorites: FavoritesState }) => s.favorites.items;
export const selectIsFavorite = (s: { favorites: FavoritesState }, id: string, type: FavoriteType) =>
  s.favorites.items.some((f) => f.id === id && f.type === type);
