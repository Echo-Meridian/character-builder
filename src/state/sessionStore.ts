import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analytics } from '../utils/analytics';

const GM_PASSPHRASE = 'CodexRules!!!!!';

type AnalyticsConsent = 'unknown' | 'accepted' | 'declined';

interface SessionState {
  gmUnlocked: boolean;
  gmUnlockedAt: string | null;
  analyticsConsent: AnalyticsConsent;
  analyticsNotified: boolean;
  authenticateGm: (code: string) => boolean;
  lockGm: () => void;
  setAnalyticsConsent: (value: boolean) => void;
  markAnalyticsNotified: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      gmUnlocked: false,
      gmUnlockedAt: null,
      analyticsConsent: 'unknown',
      analyticsNotified: false,
      authenticateGm: (code) => {
        if (code.trim().toUpperCase() === GM_PASSPHRASE) {
          set({ gmUnlocked: true, gmUnlockedAt: new Date().toISOString() });
          analytics.track('gm.unlocked', {});
          return true;
        }
        analytics.track('gm.failed_auth', { attempt: code.trim().length });
        return false;
      },
      lockGm: () => set({ gmUnlocked: false, gmUnlockedAt: null }),
      setAnalyticsConsent: (value) => {
        set({ analyticsConsent: value ? 'accepted' : 'declined' });
        analytics.setEnabled(value);
        analytics.track('analytics.consent', { granted: value });
      },
      markAnalyticsNotified: () => set({ analyticsNotified: true })
    }),
    {
      name: 'sidonia-session-state',
      version: 1,
      migrate: (state: any) => ({
        gmUnlocked: false,
        gmUnlockedAt: null,
        analyticsConsent: state?.analyticsConsent ?? 'unknown',
        analyticsNotified: false
      })
    }
  )
);
