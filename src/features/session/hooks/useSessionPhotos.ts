import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { subscribeToTable } from '@/shared/lib/supabase';
import { sessionPhotoApi, type SessionPhoto } from '../api/session-photo-api';

export type SessionPhotoVM = {
  id: number;
  url: string | null;
  isFavorite: boolean;
  uploaderId: string;
};

/**
 * Session photos for a help request: lists with signed URLs, appends new ones
 * over realtime, and uploads from the photo library (party-only is enforced by
 * the storage policy + table RLS).
 */
export function useSessionPhotos(requestId: number | null, meId: string | undefined) {
  const [photos, setPhotos] = useState<SessionPhotoVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (requestId == null) return;
    setLoading(true);
    try {
      const rows: SessionPhoto[] = await sessionPhotoApi.list(requestId);
      const vms = await Promise.all(
        rows.map(async (r) => ({
          id: r.id,
          isFavorite: r.is_favorite,
          uploaderId: r.uploader_id,
          url: await sessionPhotoApi.signedUrl(r.storage_path).catch(() => null),
        })),
      );
      setPhotos(vms);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (requestId == null) return;
    return subscribeToTable({
      channel: `session_photos_${requestId}`,
      table: 'session_photos',
      event: 'INSERT',
      filter: `help_request_id=eq.${requestId}`,
      onChange: () => void load(),
    });
  }, [requestId, load]);

  const pickAndUpload = useCallback(async () => {
    if (requestId == null || !meId) return;
    setUploadError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setUploadError('Autorise l’accès aux photos pour partager.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled || !res.assets[0]) return;
    setUploading(true);
    try {
      const bytes = await fetch(res.assets[0].uri).then((r) => r.arrayBuffer());
      await sessionPhotoApi.upload({ requestId, uploaderId: meId, data: bytes });
      await load();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'upload error');
    } finally {
      setUploading(false);
    }
  }, [requestId, meId, load]);

  return { photos, loading, uploading, uploadError, pickAndUpload, retry: load };
}
