import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from '@/features/preferences/preferencesSlice';
import favoritesReducer from '@/features/favorites/favoritesSlice';
import themeReducer from '@/features/theme/themeSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    favorites: favoritesReducer,
    theme: themeReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function makeStore() {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      favorites: favoritesReducer,
      theme: themeReducer,
      dashboard: dashboardReducer,
    },
  });
}
