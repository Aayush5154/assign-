'use client';

import { useCallback, useState } from 'react';
import { readLocalStorage, writeLocalStorage } from '@/lib/storage/localStorage';

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() =>
    typeof window === 'undefined' ? initial : readLocalStorage(key, initial),
  );

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        writeLocalStorage(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
