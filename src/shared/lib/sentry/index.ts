type ErrorContext = Record<string, string | number | boolean | null>;

export interface CrashReporter {
  captureException: (error: unknown, context?: ErrorContext) => void;
  captureMessage: (message: string, context?: ErrorContext) => void;
  setUser: (userId: string | null) => void;
}

export const sentry: CrashReporter = {
  captureException: (error, context) => {
    if (__DEV__) console.error('[sentry] exception', error, context ?? {});
  },
  captureMessage: (message, context) => {
    if (__DEV__) console.warn('[sentry] message', message, context ?? {});
  },
  setUser: (userId) => {
    if (__DEV__) console.log('[sentry] setUser', userId);
  },
};
