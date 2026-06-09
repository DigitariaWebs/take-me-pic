import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 1000 * 60;
const GC_TIME_MS = 1000 * 60 * 5;
const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: MAX_RETRIES,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
