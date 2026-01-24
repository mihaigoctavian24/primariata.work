-- Migration: 20260124221004_fix_handle_new_user_localitate_id_type.sql
-- Description: Fix type mismatch in handle_new_user() trigger function
-- Bug: user_localitate_id was UUID, should be INTEGER
-- Error: "invalid input syntax for type uuid: '13852'"
-- Impact: Trigger was failing silently, users without utilizatori records
-- Fix: Change DECLARE user_localitate_id from UUID to INTEGER

BEGIN;

-- =====================================================
-- FIX: handle_new_user() - Change localitate_id type
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
  user_localitate_id INTEGER;  -- FIXED: Changed from UUID to INTEGER
BEGIN
  -- =====================================================
  -- STEP 1: Check for invitation token in metadata
  -- =====================================================

  invitation_token_str := NEW.raw_user_meta_data->>'invitation_token';

  IF invitation_token_str IS NOT NULL THEN
    BEGIN
      invitation_token := invitation_token_str::UUID;
    EXCEPTION WHEN OTHERS THEN
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
      AND email = NEW.email
    FOR UPDATE;

    IF FOUND THEN
      user_rol := invitation_record.rol;
      user_primarie_id := invitation_record.primarie_id;
      user_departament := invitation_record.departament;
      user_permisiuni := invitation_record.permisiuni;

      -- Get localitate_id from primarie (INTEGER type, not UUID)
      SELECT localitate_id INTO user_localitate_id
      FROM public.primarii
      WHERE id = user_primarie_id;

      first_name := invitation_record.prenume;
      last_name := invitation_record.nume;

      RAISE NOTICE 'User % registering via invitation (rol: %, primarie: %)',
        NEW.id, user_rol, user_primarie_id;
    ELSE
      RAISE WARNING 'Invalid invitation token for user % (email: %)', NEW.id, NEW.email;
      invitation_token := NULL;
    END IF;
  END IF;

  -- =====================================================
  -- STEP 3: Normal registration (no invitation or invalid)
  -- =====================================================

  IF invitation_token IS NULL THEN
    full_name := COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      ''
    );

    IF full_name != '' AND position(' ' IN full_name) > 0 THEN
      first_name := split_part(full_name, ' ', 1);
      last_name := substring(full_name FROM position(' ' IN full_name) + 1);
    ELSE
      first_name := COALESCE(split_part(NEW.email, '@', 1), 'Utilizator');
      last_name := '';
    END IF;

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
    true,
    NEW.email_confirmed_at IS NOT NULL,
    true,
    false,
    'ro',
    'Europe/Bucharest'
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

  RETURN NEW;

EXCEPTION
  WHEN unique_violation THEN
    RAISE WARNING 'Utilizatori record already exists for user %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating utilizatori record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
'Auto-create utilizatori record when auth.users is created.
Supports invitation-based registration: checks for invitation_token in metadata,
looks up pending invitation, uses invitation data (rol, primarie_id, departament),
marks invitation as accepted. Falls back to cetatean registration if no invitation.
FIXED (2026-01-24): user_localitate_id type changed from UUID to INTEGER to match schema.';

COMMIT;

-- =====================================================
-- Migration Notes
-- =====================================================

-- BEFORE (broken):
-- DECLARE
--   user_localitate_id UUID;  -- ❌ Wrong type

-- AFTER (fixed):
-- DECLARE
--   user_localitate_id INTEGER;  -- ✅ Correct type

-- Root Cause:
-- - primarii.localitate_id is INTEGER
-- - utilizatori.localitate_id is INTEGER
-- - Attempting to assign INTEGER → UUID caused error: "invalid input syntax for type uuid: '13852'"

-- Verification:
-- SELECT data_type FROM information_schema.columns
-- WHERE table_name IN ('primarii', 'utilizatori') AND column_name = 'localitate_id';
-- Result: Both are "integer"
