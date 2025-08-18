import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/gamification';

interface GamificationState {
  userId: number;
  summary: api.GamificationSummary | null;
  loading: boolean;
  refresh: () => Promise<void>;
  record: (eventType: string) => Promise<number>;
}

const GamificationContext = createContext<GamificationState | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialUserId = useMemo(() => {
    const stored = Number(localStorage.getItem('userId'));
    return Number.isFinite(stored) && stored > 0 ? stored : 1; // fallback demo user
  }, []);

  const [userId] = useState<number>(initialUserId);
  const [summary, setSummary] = useState<api.GamificationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const s = await api.getSummary(userId);
      setSummary(s);
    } catch (e) {
      // fail silently to avoid UI breakage
      // console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const record = async (eventType: string) => {
    const pts = await api.recordEvent(userId, eventType);
    // refresh in background
    refresh().catch(() => {});
    return pts;
  };

  useEffect(() => { refresh().catch(() => {}); }, [userId]);

  const value: GamificationState = { userId, summary, loading, refresh, record };
  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};
