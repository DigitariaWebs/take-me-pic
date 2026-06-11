import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { subscribeToTable } from '@/shared/lib/supabase';
import { helpRequestApi, type HelpRequest } from '../api/help-request-api';

const FALLBACK = { lat: 48.8578, lng: 2.3622 }; // le Marais, if location is denied

export type BroadcastState = 'creating' | 'waiting' | 'accepted' | 'cancelled' | 'error';

/**
 * Requester side of the broadcast lifecycle: create one help request from the
 * current location, then watch its row over realtime for acceptance. No polling.
 */
export function useBroadcastRequest(requesterId: string | undefined) {
  const [state, setState] = useState<BroadcastState>('creating');
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!requesterId || startedRef.current) return;
    startedRef.current = true;
    let unsub: (() => void) | undefined;

    void (async () => {
      try {
        let coords = FALLBACK;
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }
        const req = await helpRequestApi.create({ requesterId, lat: coords.lat, lng: coords.lng });
        idRef.current = req.id;
        setRequest(req);
        setState('waiting');

        unsub = subscribeToTable<HelpRequest>({
          channel: `help_request_${req.id}`,
          table: 'help_requests',
          event: 'UPDATE',
          filter: `id=eq.${req.id}`,
          onChange: (payload) => {
            const next = payload.new as HelpRequest;
            setRequest(next);
            if (next.status === 'accepted') {
              setState('accepted');
              void helpRequestApi.getConversationId(next.id).then(setConversationId);
            }
          },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'request error');
        setState('error');
      }
    })();

    return () => unsub?.();
  }, [requesterId]);

  const cancel = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    try {
      await helpRequestApi.cancel(id);
      setState('cancelled');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'cancel error');
    }
  }, []);

  return { state, request, conversationId, error, cancel };
}
