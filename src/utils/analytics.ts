interface AnalyticsEntry {
  event: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

class AnalyticsClient {
  private enabled = false;
  private readonly storageKey = 'sidonia-analytics-buffer';

  setEnabled(value: boolean) {
    this.enabled = value;
    if (typeof window === 'undefined') {
      return;
    }
    if (!value) {
      this.clear();
    }
  }

  track(event: string, data?: Record<string, unknown>) {
    if (typeof window === 'undefined') {
      return;
    }
    if (!this.enabled) {
      return;
    }
    const entry: AnalyticsEntry = {
      event,
      timestamp: new Date().toISOString(),
      data
    };
    try {
      const existing = this.load();
      existing.push(entry);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
      // eslint-disable-next-line no-console
      console.info('[analytics]', entry);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Analytics storage failed', error);
    }
  }

  getAll(): AnalyticsEntry[] {
    if (typeof window === 'undefined') {
      return [];
    }
    return this.load();
  }

  clear() {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(this.storageKey);
  }

  private load(): AnalyticsEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      return JSON.parse(raw) as AnalyticsEntry[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to read analytics buffer', error);
      return [];
    }
  }
}

export const analytics = new AnalyticsClient();
