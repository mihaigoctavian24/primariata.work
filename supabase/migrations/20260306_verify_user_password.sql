-- Run via Supabase Dashboard > SQL Editor or supabase db push
-- verify_user_password: Verifies the current user's password
-- Used by admin settings password change flow
-- SECURITY DEFINER runs as the function owner (has access to auth.users)
CREATE OR REPLACE FUNCTION verify_user_password(password text)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = extensions, public, auth
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  RETURN EXISTS (
    SELECT id
    FROM auth.users
    WHERE id = user_id
    AND encrypted_password = crypt(password::text, auth.users.encrypted_password)
  );
END;
$$ LANGUAGE plpgsql;
