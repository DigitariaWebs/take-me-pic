import { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<QueryClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = createQueryClient();
  }
  return (
    <QueryClientProvider client={clientRef.current}>{children}</QueryClientProvider>
  );
}
