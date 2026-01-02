-- =====================================================
-- MIGRATION: Create Documents Storage Bucket
-- =====================================================
-- Purpose: Create Supabase Storage bucket for document uploads
-- Date: 2025-12-29
-- Author: ATLAS
-- =====================================================

-- Create the 'cereri-documente' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cereri-documente',
  'cereri-documente',
  false, -- Private bucket, requires authentication
  5242880, -- 5MB max file size
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
);

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- Policy 1: Users can upload documents to their own cereri
-- Pattern: {primarie_id}/{cerere_id}/{timestamp}-{filename}
CREATE POLICY "Users can upload documents to their cereri"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text
    FROM cereri c
    WHERE c.solicitant_id = auth.uid()
  )
);

-- Policy 2: Users can view documents from their own cereri
CREATE POLICY "Users can view their cereri documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text
    FROM cereri c
    WHERE c.solicitant_id = auth.uid()
  )
);

-- Policy 3: Funcționari/admins can view all documents in their primărie
CREATE POLICY "Funcționari can view primărie documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[1] IN (
    SELECT u.primarie_id::text
    FROM utilizatori u
    WHERE u.id = auth.uid()
    AND u.rol IN ('functionar', 'admin')
  )
);

-- Policy 4: Funcționari/admins can upload documents to cereri in their primărie
CREATE POLICY "Funcționari can upload primărie documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[1] IN (
    SELECT u.primarie_id::text
    FROM utilizatori u
    WHERE u.id = auth.uid()
    AND u.rol IN ('functionar', 'admin')
  )
);

-- Policy 5: Users can delete their own uploaded documents
CREATE POLICY "Users can delete their uploaded documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text
    FROM cereri c
    WHERE c.solicitant_id = auth.uid()
  )
);

-- Policy 6: Admins can delete any documents in their primărie
CREATE POLICY "Admins can delete primărie documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cereri-documente'
  AND (storage.foldername(name))[1] IN (
    SELECT u.primarie_id::text
    FROM utilizatori u
    WHERE u.id = auth.uid()
    AND u.rol = 'admin'
  )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can upload documents to their cereri" ON storage.objects IS
'Allows authenticated users to upload documents to cereri they own';

COMMENT ON POLICY "Users can view their cereri documents" ON storage.objects IS
'Allows users to view documents from their own cereri';

COMMENT ON POLICY "Funcționari can view primărie documents" ON storage.objects IS
'Allows funcționari and admins to view all documents in their primărie';

COMMENT ON POLICY "Funcționari can upload primărie documents" ON storage.objects IS
'Allows funcționari and admins to upload documents to any cerere in their primărie';

COMMENT ON POLICY "Users can delete their uploaded documents" ON storage.objects IS
'Allows users to delete documents they uploaded to their own cereri';

COMMENT ON POLICY "Admins can delete primărie documents" ON storage.objects IS
'Allows admins to delete any documents in their primărie';
