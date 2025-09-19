import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadCharacterBuilderData } from './dataService';
import { CharacterBuilderData } from './types';

export type DataStatus = 'idle' | 'loading' | 'ready' | 'error';

interface DataContextValue {
  data: CharacterBuilderData | null;
  status: DataStatus;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CharacterBuilderData | null>(null);
  const [status, setStatus] = useState<DataStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const payload = await loadCharacterBuilderData();
      setData(payload);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown data loading error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<DataContextValue>(() => ({ data, status, error, refresh: load }), [data, status, error, load]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useCharacterData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useCharacterData must be used within a DataProvider');
  }
  return ctx;
}
