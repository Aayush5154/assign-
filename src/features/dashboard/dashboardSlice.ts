import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_WIDGET_ORDER } from '@/lib/constants/categories';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from '@/lib/storage/localStorage';

interface DashboardState {
  widgetOrder: string[];
  hydrated: boolean;
}

const initialState: DashboardState = { widgetOrder: DEFAULT_WIDGET_ORDER, hydrated: false };

function sanitize(order: unknown): string[] | null {
  if (!Array.isArray(order)) return null;
  const known = new Set(DEFAULT_WIDGET_ORDER);
  const filtered = order.filter((id): id is string => typeof id === 'string' && known.has(id));
  if (filtered.length !== DEFAULT_WIDGET_ORDER.length) return null;
  if (new Set(filtered).size !== filtered.length) return null;
  return filtered;
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    hydrate(state) {
      const stored = readLocalStorage<unknown>(STORAGE_KEYS.widgetOrder, null);
      const clean = sanitize(stored);
      state.widgetOrder = clean ?? DEFAULT_WIDGET_ORDER;
      state.hydrated = true;
    },
    setWidgetOrder(state, action: PayloadAction<string[]>) {
      const clean = sanitize(action.payload);
      if (!clean) return;
      state.widgetOrder = clean;
      writeLocalStorage(STORAGE_KEYS.widgetOrder, clean);
    },
    moveWidget(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      if (from < 0 || to < 0 || from >= state.widgetOrder.length || to >= state.widgetOrder.length)
        return;
      const next = [...state.widgetOrder];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      state.widgetOrder = next;
      writeLocalStorage(STORAGE_KEYS.widgetOrder, next);
    },
    resetLayout(state) {
      state.widgetOrder = DEFAULT_WIDGET_ORDER;
      writeLocalStorage(STORAGE_KEYS.widgetOrder, DEFAULT_WIDGET_ORDER);
    },
  },
});

export const { hydrate: hydrateDashboard, setWidgetOrder, moveWidget, resetLayout } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
export const selectWidgetOrder = (s: { dashboard: DashboardState }) => s.dashboard.widgetOrder;

/** Pure helper used by dnd-kit handlers and unit tests. */
export function reorderList<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
