-- Migration: 20260120000001_modify_handle_new_user_trigger.sql
-- Description: Modify handle_new_user() trigger to support invitation-based registration
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 
--   - 20260117224406_create_utilizatori_auto_creation_trigger.sql
--   - 20260120000000_create_user_invitations_table.sql
--
-- Purpose: Enable invited users to register with pre-assigned roles and primărie
--
-- Flow:
--   1. Check for invitation_token in auth metadata
--   2. Look up pending invitation (not expired)
--   3. Use invitation data: rol, primarie_id, departament, permisiuni
--   4. Mark invitation as accepted atomically
--   5. Fall back to cetatean registration if no invitation
--
-- Security:
--   - Validates invitation: pending, not expired, email match
--   - Atomic invitation acceptance (prevents race conditions)
--   - Graceful fallback to normal registration

BEGIN;

-- =====================================================
-- MODIFIED TRIGGER FUNCTION: handle_new_user()
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name TEXT;
  first_name TEXT;
  last_name TEXT;
  invitation_token_str TEXT;
  invitation_token UUID;
  invitation_record RECORD;
  user_rol VARCHAR(50);
  user_primarie_id UUID;
  user_departament VARCHAR(200);
  user_permisiuni JSONB;
  user_localitate_id UUID;
BEGIN
  -- =====================================================
  -- STEP 1: Check for invitation token in metadata
  -- =====================================================
  
  invitation_token_str := NEW.raw_user_meta_data->>'invitation_token';
  
  IF invitation_token_str IS NOT NULL THEN
    -- Convert string to UUID
    BEGIN
      invitation_token := invitation_token_str::UUID;
    EXCEPTION WHEN OTHERS THEN
      -- Invalid token format - log warning and fall back to normal registration
      RAISE WARNING 'Invalid invitation token format for user %: %', NEW.id, invitation_token_str;
      invitation_token := NULL;
    END;
  END IF;
  
  -- =====================================================
  -- STEP 2: Look up invitation (if token exists)
  -- =====================================================
  
  IF invitation_token IS NOT NULL THEN
    SELECT 
      id, email, nume, prenume, rol, primarie_id, departament, permisiuni,
      status, expires_at
    INTO invitation_record
    FROM public.user_invitations
    WHERE token = invitation_token
      AND status = 'pending'
      AND expires_at > NOW()
      AND email = NEW.email  -- Security: email must match
    FOR UPDATE;  -- Lock row to prevent race conditions
    
    IF FOUND THEN
      -- Valid invitation found - use invitation data
      user_rol := invitation_record.rol;
      user_primarie_id := invitation_record.primarie_id;
      user_departament := invitation_record.departament;
      user_permisiuni := invitation_record.permisiuni;
      
      -- Get localitate_id from primărie
      SELECT localitate_id INTO user_localitate_id
      FROM public.primarii
      WHERE id = user_primarie_id;
      
      -- Use names from invitation (pre-filled by admin)
      first_name := invitation_record.prenume;
      last_name := invitation_record.nume;
      
      RAISE NOTICE 'User % registering via invitation (token: %, rol: %, primarie: %)',
        NEW.id, invitation_token, user_rol, user_primarie_id;
    ELSE
      -- Invalid invitation (expired, wrong email, or already used)
      RAISE WARNING 'Invalid invitation token for user % (email: %): token not found or expired',
        NEW.id, NEW.email;
      
      -- Fall back to normal registration
      invitation_token := NULL;
    END IF;
  END IF;
  
  -- =====================================================
  -- STEP 3: Normal registration (no invitation or invalid)
  -- =====================================================
  
  IF invitation_token IS NULL THEN
    -- Extract full_name from user metadata if available
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    );
    
    -- Try to parse full_name into first_name and last_name
    IF full_name != '' AND position(' ' IN full_name) > 0 THEN
      first_name := split_part(full_name, ' ', 1);
      last_name := substring(full_name FROM position(' ' IN full_name) + 1);
    ELSE
      -- No space found or empty name - use email prefix or defaults
      first_name := COALESCE(
        split_part(NEW.email, '@', 1),
        'Utilizator'
      );
      last_name := '';
    END IF;
    
    -- Default values for normal registration
    user_rol := 'cetatean';
    user_primarie_id := NULL;
    user_departament := NULL;
    user_permisiuni := '{}'::jsonb;
    user_localitate_id := NULL;
    
    RAISE NOTICE 'User % registering as cetatean (normal registration)', NEW.id;
  END IF;
  
  -- =====================================================
  -- STEP 4: Create utilizatori record
  -- =====================================================
  
  INSERT INTO public.utilizatori (
    id,
    email,
    nume,
    prenume,
    rol,
    primarie_id,
    departament,
    permisiuni,
    localitate_id,
    activ,
    email_verificat,
    notificari_email,
    notificari_sms,
    limba,
    timezone
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(last_name, ''),
    COALESCE(first_name, 'Utilizator'),
    user_rol,
    user_primarie_id,
    user_departament,
    COALESCE(user_permisiuni, '{}'::jsonb),
    user_localitate_id,
    true,  -- Active by default
    NEW.email_confirmed_at IS NOT NULL,  -- Email verified if confirmed
    true,  -- Email notifications enabled
    false,  -- SMS notifications disabled by default
    'ro',  -- Romanian language
    'Europe/Bucharest'  -- Romanian timezone
  );
  
  -- =====================================================
  -- STEP 5: Mark invitation as accepted (if used)
  -- =====================================================
  
  IF invitation_token IS NOT NULL AND invitation_record IS NOT NULL THEN
    UPDATE public.user_invitations
    SET 
      status = 'accepted',
      accepted_at = NOW(),
      accepted_by = NEW.id,
      updated_at = NOW()
    WHERE token = invitation_token;
    
    RAISE NOTICE 'Invitation % marked as accepted by user %', invitation_token, NEW.id;
  END IF;
  
  -- Return NEW to continue with auth.users insertion
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    -- If utilizatori record already exists (shouldn't happen, but handle gracefully)
    RAISE WARNING 'Utilizatori record already exists for user %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log any other errors but don't fail auth.users insertion
    RAISE WARNING 'Error creating utilizatori record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
'Auto-create utilizatori record when auth.users is created.
Supports invitation-based registration: checks for invitation_token in metadata,
looks up pending invitation, uses invitation data (rol, primarie_id, departament),
marks invitation as accepted. Falls back to cetatean registration if no invitation.
Gracefully handles invalid tokens and expired invitations.';

-- =====================================================
-- RE-CREATE TRIGGER (trigger already exists)
-- =====================================================

-- Drop and recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
'Auto-create utilizatori record immediately after auth.users creation.
Supports invitation-based registration for staff members (functionar, admin).
Falls back to cetatean registration for normal signups.';

COMMIT;

-- =====================================================
-- Usage Examples (commented for reference)
-- =====================================================

-- Test normal registration (no invitation):
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data
-- ) VALUES (
--   gen_random_uuid(),
--   'normal@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{\"full_name\": \"Jane Doe\"}'::jsonb
-- );
-- SELECT * FROM utilizatori WHERE email = 'normal@example.com';
-- Expected: rol = 'cetatean', primarie_id = NULL

-- Test invitation-based registration:
-- 1. Create invitation (as admin)
-- INSERT INTO user_invitations (email, nume, prenume, rol, primarie_id, invited_by)
-- VALUES ('staff@example.com', 'Smith', 'John', 'functionar', 'some-primarie-uuid', auth.uid());
-- 
-- 2. Get token
-- SELECT token FROM user_invitations WHERE email = 'staff@example.com';
-- 
-- 3. Register with token
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data
-- ) VALUES (
--   gen_random_uuid(),
--   'staff@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   jsonb_build_object('invitation_token', 'TOKEN_FROM_STEP_2')
-- );
-- 
-- 4. Verify
-- SELECT * FROM utilizatori WHERE email = 'staff@example.com';
-- Expected: rol = 'functionar', primarie_id = 'some-primarie-uuid'
-- SELECT status FROM user_invitations WHERE email = 'staff@example.com';
-- Expected: status = 'accepted'

-- Test invalid token (falls back to cetatean):
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data
-- ) VALUES (
--   gen_random_uuid(),
--   'invalid@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{\"invitation_token\": \"00000000-0000-0000-0000-000000000000\"}'::jsonb
-- );
-- SELECT * FROM utilizatori WHERE email = 'invalid@example.com';
-- Expected: rol = 'cetatean', primarie_id = NULL (graceful fallback)

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- This migration modifies an existing function, so rollback would be:
-- 1. Restore the original handle_new_user() function from 20260117224406
-- 2. Recreate the trigger
-- See 20260117224406_create_utilizatori_auto_creation_trigger.sql for original code
