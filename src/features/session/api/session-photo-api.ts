import { supabase, uploadToBucket, createSignedUrl } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/lib/supabase';

export type SessionPhoto = Tables<'session_photos'>;

export const sessionPhotoApi = {
  // Upload a photo into the session's private folder, then record the row.
  // Path is `{requestId}/...` so the storage policy can check session membership.
  async upload(params: {
    requestId: number;
    uploaderId: string;
    data: ArrayBuffer | Blob | Uint8Array;
    ext?: string;
    contentType?: string;
  }): Promise<SessionPhoto> {
    const { requestId, uploaderId, data, ext = 'jpg', contentType = 'image/jpeg' } = params;
    const path = `${requestId}/${uploaderId}-${Date.now()}.${ext}`;
    await uploadToBucket({ bucket: 'session-photos', path, data, contentType });
    const { data: row, error } = await supabase
      .from('session_photos')
      .insert({ help_request_id: requestId, uploader_id: uploaderId, storage_path: path } as never)
      .select('*')
      .single();
    if (error) throw error;
    return row;
  },

  // Photos for a session. RLS (session_photos_party_read) restricts to the two
  // parties.
  async list(requestId: number): Promise<SessionPhoto[]> {
    const { data, error } = await supabase
      .from('session_photos')
      .select('*')
      .eq('help_request_id', requestId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  // Private bucket → signed URL for display/download.
  async signedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    return createSignedUrl({ bucket: 'session-photos', path: storagePath, expiresIn });
  },
};
