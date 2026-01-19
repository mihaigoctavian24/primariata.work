-- Migration: 20260117224406_create_utilizatori_auto_creation_trigger.sql
-- Description: Auto-create utilizatori record when auth.users record is created
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20250118000001_create_extensions_and_core_tables.sql
--
-- Purpose: Fix 400 errors for new users by ensuring utilizatori record exists
--          immediately after registration (auth.users creation)
--
-- Context: New users get "Te rugăm să selectezi o localitate mai întâi" error
--          because registration creates auth.users but NOT utilizatori record.
--
-- Solution: Database trigger automatically creates utilizatori record with:
--           - id from auth.users.id
--           - email from auth.users.email
--           - nume/prenume parsed from metadata or defaults
--           - rol = 'cetatean' (default)
--           - email_verificat based on email_confirmed_at
--           - localitate_id = NULL (user can select later)

BEGIN;

-- =====================================================
-- TRIGGER FUNCTION: Auto-create Utilizatori Record
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
BEGIN
  -- Extract full_name from user metadata if available
  full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  -- Try to parse full_name into first_name and last_name
  -- If full_name is empty or doesn't have space, use defaults
  IF full_name != '' AND position(' ' IN full_name) > 0 THEN
    -- Split on first space: "John Doe" -> first="John", last="Doe"
    first_name := split_part(full_name, ' ', 1);
    last_name := substring(full_name FROM position(' ' IN full_name) + 1);
  ELSE
    -- No space found or empty name - use email prefix or defaults
    first_name := COALESCE(
      split_part(NEW.email, '@', 1),  -- Use email prefix (e.g., "john" from "john@email.com")
      'Utilizator'
    );
    last_name := '';
  END IF;

  -- Insert into utilizatori table
  INSERT INTO public.utilizatori (
    id,
    email,
    nume,
    prenume,
    rol,
    activ,
    email_verificat,
    notificari_email,
    notificari_sms,
    limba,
    timezone
  ) VALUES (
    NEW.id,                                           -- UUID from auth.users
    NEW.email,                                        -- Email from auth.users
    COALESCE(last_name, ''),                         -- Last name (or empty string)
    COALESCE(first_name, 'Utilizator'),              -- First name (or default)
    'cetatean',                                       -- Default role for new users
    true,                                             -- Active by default
    NEW.email_confirmed_at IS NOT NULL,              -- Email verified if confirmed
    true,                                             -- Email notifications enabled
    false,                                            -- SMS notifications disabled by default
    'ro',                                             -- Romanian language
    'Europe/Bucharest'                                -- Romanian timezone
  );

  -- Return NEW to continue with auth.users insertion
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If utilizatori record already exists (shouldn't happen, but handle gracefully)
    -- Log warning but don't fail the auth.users insertion
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
Fixes 400 errors for new users by ensuring utilizatori record exists immediately after registration.
Extracts name from metadata, defaults to email prefix if not provided.
Sets rol=cetatean, activ=true, localitate_id=NULL (user selects later).';

-- =====================================================
-- TRIGGER: On Auth User Created
-- =====================================================

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
'Auto-create utilizatori record immediately after auth.users creation.
Ensures new users can access application without 400 localitate_id errors.';

-- =====================================================
-- TEST DATA (commented - uncomment to test)
-- =====================================================

-- To test this trigger:
-- 1. Insert a test user into auth.users
-- 2. Verify utilizatori record is created automatically
-- 3. Check fields are populated correctly

-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data
-- ) VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   '{"full_name": "John Doe"}'::jsonb
-- );

-- SELECT * FROM utilizatori WHERE email = 'test@example.com';
-- Expected: Record exists with:
--   - email = 'test@example.com'
--   - nume = 'Doe'
--   - prenume = 'John'
--   - rol = 'cetatean'
--   - activ = true
--   - email_verificat = true
--   - localitate_id = NULL

COMMIT;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- BEGIN;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- COMMIT;
