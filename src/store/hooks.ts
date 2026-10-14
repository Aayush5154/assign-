import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { makeStore } from '@/store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<ReturnType<typeof makeStore>>;
