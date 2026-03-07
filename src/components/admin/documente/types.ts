/**
 * StorageFile — shape returned by supabase.storage.from(...).list()
 *
 * Mirrors @supabase/storage-js FileObject without requiring a direct import.
 */
export interface StorageFile {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: {
    size: number;
    mimetype: string;
    eTag: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  } | null;
}
