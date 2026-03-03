-- Migration: 20260303000001_extend_handle_new_user_for_user_primarii.sql
-- Description: Extend handle_new_user() trigger to atomically create user_primarii rows on registration.
--   - Normal registration (email/password): reads localitate_id from metadata, resolves primarie, creates pending user_primarii
--   - Invitation-based registration: creates approved user_primarii with invitation role and permissions
--   - No location metadata: creates utilizatori only (no user_primarii row)
-- Dependencies: 20260302000001_create_user_primarii_and_rewrite_rls.sql, 20260302000002_fix_search_path_all_functions.sql
-- Phase: 03-registration-approval, Plan: 01

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  user_localitate_id INTEGER;
BEGIN
  -- STEP 1: Check for invitation token in metadata
  invitation_token_str := NEW.raw_user_meta_data->>'invitation_token';

  IF invitation_token_str IS NOT NULL THEN
    BEGIN
      invitation_token := invitation_token_str::UUID;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Invalid invitation token format for user %: %', NEW.id, invitation_token_str;
      invitation_token := NULL;
    END;
  END IF;

  -- STEP 2: Look up invitation (if token exists)
  IF invitation_token IS NOT NULL THEN
    SELECT
      id, email, nume, prenume, rol, primarie_id, departament, permisiuni,
      status, expires_at, invited_by
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

      -- Get localitate_id from primarie (INTEGER type)
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

  -- STEP 3: Normal registration (no invitation or invalid)
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
    user_departament := NULL;
    user_permisiuni := '{}'::jsonb;

    -- Read location from registration metadata (passed via signUp options.data)
    user_localitate_id := (NEW.raw_user_meta_data->>'localitate_id')::INTEGER;
    IF user_localitate_id IS NOT NULL THEN
      SELECT id INTO user_primarie_id
      FROM public.primarii
      WHERE localitate_id = user_localitate_id AND activa = true
      LIMIT 1;
    ELSE
      user_primarie_id := NULL;
    END IF;

    RAISE NOTICE 'User % registering as cetatean (normal registration, primarie: %)', NEW.id, user_primarie_id;
  END IF;

  -- STEP 4: Create utilizatori record
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

  -- STEP 4b: Create user_primarii association
  -- For invitation-based registration: status = 'approved' (pre-approved by inviter)
  -- For normal registration with location: status = 'pending' (awaiting admin approval)
  -- Wrapped in own BEGIN/EXCEPTION block so duplicate-key does NOT roll back utilizatori creation
  IF user_primarie_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_primarii (
        user_id, primarie_id, rol, status, permissions, approved_by, approved_at
      ) VALUES (
        NEW.id,
        user_primarie_id,
        user_rol,
        CASE WHEN invitation_token IS NOT NULL THEN 'approved' ELSE 'pending' END,
        COALESCE(user_permisiuni, '[]'::jsonb),
        CASE WHEN invitation_token IS NOT NULL THEN invitation_record.invited_by ELSE NULL END,
        CASE WHEN invitation_token IS NOT NULL THEN NOW() ELSE NULL END
      );
    EXCEPTION WHEN unique_violation THEN
      RAISE WARNING 'user_primarii record already exists for user % at primarie %', NEW.id, user_primarie_id;
    END;
  END IF;

  -- STEP 5: Mark invitation as accepted (if used)
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
'Auto-create utilizatori + user_primarii records when auth.users is created.
Supports invitation-based registration (approved status) and normal registration (pending status).
Reads localitate_id from raw_user_meta_data to resolve primarie.
search_path hardened to empty string. Extended with STEP 4b for user_primarii (2026-03-03).';

COMMIT;
