'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { hydratePreferences } from '@/features/preferences/preferencesSlice';
import { hydrateFavorites } from '@/features/favorites/favoritesSlice';
import { hydrateTheme } from '@/features/theme/themeSlice';
import { hydrateDashboard } from '@/features/dashboard/dashboardSlice';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    store.dispatch(hydratePreferences());
    store.dispatch(hydrateFavorites());
    store.dispatch(hydrateTheme());
    store.dispatch(hydrateDashboard());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
