import { supabase } from './client';

export type StorageBucket = 'avatars' | 'posts' | 'session-photos' | 'spots';

export async function uploadToBucket(params: {
  bucket: StorageBucket;
  path: string;
  data: ArrayBuffer | Blob | Uint8Array;
  contentType?: string;
  upsert?: boolean;
}): Promise<string> {
  const { bucket, path, data, contentType, upsert = false } = params;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, { contentType, upsert });
  if (error) throw error;
  return path;
}

export function getPublicUrl(params: {
  bucket: StorageBucket;
  path: string;
}): string {
  const { bucket, path } = params;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function createSignedUrl(params: {
  bucket: StorageBucket;
  path: string;
  expiresIn?: number;
}): Promise<string> {
  const { bucket, path, expiresIn = 3600 } = params;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeFromBucket(params: {
  bucket: StorageBucket;
  paths: string[];
}): Promise<void> {
  const { bucket, paths } = params;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}
