import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './client';

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function subscribeToTable<Row extends Record<string, unknown>>(params: {
  channel: string;
  table: string;
  schema?: string;
  event?: PostgresEvent;
  filter?: string;
  onChange: (payload: RealtimePostgresChangesPayload<Row>) => void;
}): () => void {
  const { channel, table, schema = 'public', event = '*', filter, onChange } = params;
  const sub: RealtimeChannel = supabase
    .channel(channel)
    .on(
      'postgres_changes',
      { event, schema, table, ...(filter ? { filter } : {}) },
      (payload) => onChange(payload as RealtimePostgresChangesPayload<Row>),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(sub);
  };
}
