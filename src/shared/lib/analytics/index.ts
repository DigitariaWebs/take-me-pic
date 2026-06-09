type AnalyticsProperties = Record<string, string | number | boolean | null>;

export interface AnalyticsClient {
  track: (event: string, properties?: AnalyticsProperties) => void;
  identify: (userId: string, traits?: AnalyticsProperties) => void;
  reset: () => void;
}

export const analytics: AnalyticsClient = {
  track: (event, properties) => {
    if (__DEV__) console.log('[analytics] track', event, properties ?? {});
  },
  identify: (userId, traits) => {
    if (__DEV__) console.log('[analytics] identify', userId, traits ?? {});
  },
  reset: () => {
    if (__DEV__) console.log('[analytics] reset');
  },
};
