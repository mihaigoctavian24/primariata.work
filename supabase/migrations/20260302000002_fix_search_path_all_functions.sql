-- Migration: 20260302000002_fix_search_path_all_functions.sql
-- Description: Set search_path = '' on ALL pre-existing database functions.
--              Rewrites function bodies with fully qualified table names where needed.
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: All prior migrations including 20260302000001
--
-- Purpose: Addresses Supabase Security Advisor lint 0011 (function_search_path_mutable).
--          Functions from 20260302000001 already have search_path = '' and are NOT touched here.
--
-- Note: SET search_path = '' prevents PostgreSQL from inlining SQL functions.
--       For plpgsql trigger functions, inlining is not applicable, so no performance impact.

BEGIN;

-- =====================================================
-- 1. LEGACY HELPER FUNCTIONS (deprecated but still exist)
-- =====================================================

-- current_user_role: simple SQL function, just ALTER
ALTER FUNCTION public.current_user_role() SET search_path = '';

-- current_user_primarie: simple SQL function, just ALTER
ALTER FUNCTION public.current_user_primarie() SET search_path = '';

-- =====================================================
-- 2. TRIGGER FUNCTIONS FROM 20250118000004_create_triggers.sql
-- =====================================================

-- generate_numar_inregistrare: references primarii, localitati, judete, cereri
CREATE OR REPLACE FUNCTION public.generate_numar_inregistrare()
RETURNS TRIGGER AS $$
DECLARE
  judet_cod VARCHAR(2);
  localitate_slug VARCHAR(250);
  an INT;
  count INT;
  numar VARCHAR(50);
BEGIN
  -- Get judet code and localitate slug from primarie
  SELECT j.cod, l.slug INTO judet_cod, localitate_slug
  FROM public.primarii p
  JOIN public.localitati l ON p.localitate_id = l.id
  JOIN public.judete j ON l.judet_id = j.id
  WHERE p.id = NEW.primarie_id;

  -- Get current year
  an := EXTRACT(YEAR FROM NOW());

  -- Count existing cereri for this primarie in current year
  SELECT COUNT(*) + 1 INTO count
  FROM public.cereri
  WHERE primarie_id = NEW.primarie_id
    AND EXTRACT(YEAR FROM created_at) = an;

  -- Format: AR-ZN-2025-00123
  numar := UPPER(judet_cod) || '-' || UPPER(LEFT(localitate_slug, 2)) || '-' ||
           an || '-' || LPAD(count::TEXT, 5, '0');

  NEW.numar_inregistrare := numar;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.generate_numar_inregistrare IS 'Auto-generate unique registration number for cereri (e.g., AR-ZN-2025-00123)';

-- update_updated_at_column: no table references, just ALTER
-- Note: This function is redefined in multiple migrations. We rewrite it once
-- with search_path to ensure the latest version has it set.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.update_updated_at_column IS 'Auto-update updated_at timestamp on row modification';

-- log_audit: references utilizatori, audit_log
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  user_name TEXT;
  user_role TEXT;
  primarie UUID;
BEGIN
  -- Get current user info from utilizatori table
  SELECT id, nume || ' ' || prenume, rol, primarie_id
  INTO user_id, user_name, user_role, primarie
  FROM public.utilizatori
  WHERE id = auth.current_user_id();

  -- If user not found in utilizatori (e.g., system operation), use NULL
  IF user_id IS NULL THEN
    user_id := auth.current_user_id();
    user_name := 'System';
    user_role := 'system';
  END IF;

  -- Log the action to audit_log
  INSERT INTO public.audit_log (
    primarie_id,
    utilizator_id,
    utilizator_nume,
    utilizator_rol,
    actiune,
    entitate_tip,
    entitate_id,
    detalii,
    ip_address
  ) VALUES (
    primarie,
    user_id,
    user_name,
    user_role,
    TG_TABLE_NAME || '.' || lower(TG_OP),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    inet_client_addr()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION public.log_audit IS 'Log all sensitive table operations to audit_log with before/after values';

-- validate_cerere_status_transition: references auth.current_user_role()
CREATE OR REPLACE FUNCTION public.validate_cerere_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changes to finalized cereri (unless admin override)
  IF OLD.status = 'finalizata' AND NEW.status != 'finalizata' THEN
    IF auth.current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Cannot change status of finalized cerere (ID: %). Only admins can modify finalized requests.', OLD.id;
    END IF;
  END IF;

  -- Prevent changes to cancelled cereri (unless admin override)
  IF OLD.status = 'anulata' AND NEW.status != 'anulata' THEN
    IF auth.current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Cannot change status of cancelled cerere (ID: %). Only admins can modify cancelled requests.', OLD.id;
    END IF;
  END IF;

  -- Auto-set data_finalizare when status changes to finalizata
  IF NEW.status = 'finalizata' AND OLD.status != 'finalizata' THEN
    NEW.data_finalizare := NOW();
  END IF;

  -- Clear data_finalizare if status changes from finalizata
  IF NEW.status != 'finalizata' AND OLD.status = 'finalizata' THEN
    NEW.data_finalizare := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.validate_cerere_status_transition IS 'Enforce status transition rules and auto-set data_finalizare';

-- refresh_public_stats: references localitati, primarii, cereri, statistici_publice
CREATE OR REPLACE FUNCTION public.refresh_public_stats()
RETURNS void AS $$
BEGIN
  -- Update localitati count
  UPDATE public.statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM public.localitati),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'localitati_count';

  IF NOT FOUND THEN
    INSERT INTO public.statistici_publice (tip_statistica, valoare)
    VALUES (
      'localitati_count',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM public.localitati),
        'updated_at', NOW()
      )
    );
  END IF;

  -- Update primarii active count
  UPDATE public.statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM public.primarii WHERE activa = TRUE AND deleted_at IS NULL),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'primarii_active';

  IF NOT FOUND THEN
    INSERT INTO public.statistici_publice (tip_statistica, valoare)
    VALUES (
      'primarii_active',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM public.primarii WHERE activa = TRUE AND deleted_at IS NULL),
        'updated_at', NOW()
      )
    );
  END IF;

  -- Update cereri processed (last 30 days)
  UPDATE public.statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM public.cereri WHERE created_at >= NOW() - INTERVAL '30 days'),
      'avg_time_days', (
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (data_finalizare - created_at)) / 86400), 0)
        FROM public.cereri
        WHERE data_finalizare IS NOT NULL
          AND created_at >= NOW() - INTERVAL '30 days'
      ),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'cereri_processed_month';

  IF NOT FOUND THEN
    INSERT INTO public.statistici_publice (tip_statistica, valoare)
    VALUES (
      'cereri_processed_month',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM public.cereri WHERE created_at >= NOW() - INTERVAL '30 days'),
        'avg_time_days', 0,
        'updated_at', NOW()
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.refresh_public_stats IS 'Refresh public statistics cache (should be called hourly via cron)';

-- =====================================================
-- 3. SURVEY AI INSIGHTS FUNCTIONS (20251101101231)
-- =====================================================

-- cleanup_expired_analysis_cache: references survey_analysis_cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.survey_analysis_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.cleanup_expired_analysis_cache IS 'Removes expired cache entries (should be called daily)';

-- get_latest_ai_insight: references survey_ai_insights
CREATE OR REPLACE FUNCTION public.get_latest_ai_insight(
  p_question_id VARCHAR(50),
  p_respondent_type VARCHAR(20) DEFAULT NULL
)
RETURNS public.survey_ai_insights AS $$
  SELECT *
  FROM public.survey_ai_insights
  WHERE question_id = p_question_id
    AND (p_respondent_type IS NULL OR respondent_type = p_respondent_type)
  ORDER BY generated_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE
SET search_path = '';

COMMENT ON FUNCTION public.get_latest_ai_insight IS 'Helper to retrieve most recent AI insight for a question';

-- is_cache_valid: references survey_analysis_cache
CREATE OR REPLACE FUNCTION public.is_cache_valid(p_cache_key VARCHAR(255))
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.survey_analysis_cache
    WHERE cache_key = p_cache_key
      AND expires_at > NOW()
  );
$$ LANGUAGE sql STABLE
SET search_path = '';

COMMENT ON FUNCTION public.is_cache_valid IS 'Check if cached analysis is still valid';

-- update_cache_access: references survey_analysis_cache
CREATE OR REPLACE FUNCTION public.update_cache_access(p_cache_key VARCHAR(255))
RETURNS void AS $$
BEGIN
  UPDATE public.survey_analysis_cache
  SET access_count = access_count + 1,
      last_accessed_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

COMMENT ON FUNCTION public.update_cache_access IS 'Update cache access statistics for monitoring';

-- =====================================================
-- 4. SURVEY CORRELATION/COHORT TRIGGER FUNCTIONS (20251102111500)
-- =====================================================

-- update_survey_correlation_analysis_updated_at: no table refs
CREATE OR REPLACE FUNCTION public.update_survey_correlation_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- update_survey_cohort_analysis_updated_at: no table refs
CREATE OR REPLACE FUNCTION public.update_survey_cohort_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =====================================================
-- 5. EMAIL NOTIFICATION FUNCTION (20251231000001)
-- =====================================================

-- send_cerere_email_notification: references auth.users
CREATE OR REPLACE FUNCTION public.send_cerere_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_email_type TEXT;
  v_edge_function_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get Edge Function URL and service role key from environment
  v_edge_function_url := current_setting('app.settings.edge_function_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);

  -- Fallback to default if not set (for local development)
  IF v_edge_function_url IS NULL THEN
    v_edge_function_url := 'http://localhost:54321/functions/v1/send-email';
  END IF;

  -- Get user email and name from auth.users
  SELECT
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.solicitant_id;

  -- Skip if user email not found
  IF v_user_email IS NULL THEN
    RAISE WARNING 'User email not found for solicitant_id: %', NEW.solicitant_id;
    RETURN NEW;
  END IF;

  -- Determine email type based on trigger operation and status
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('depusa', 'trimisa') THEN
      v_email_type := 'cerere_submitted';
    ELSE
      RETURN NEW;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      IF NEW.status = 'finalizata' THEN
        v_email_type := 'cerere_finalizata';
      ELSIF NEW.status = 'respinsa' THEN
        v_email_type := 'cerere_respinsa';
      ELSIF NEW.status != 'draft' THEN
        v_email_type := 'status_changed';
      ELSE
        RETURN NEW;
      END IF;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Call Edge Function asynchronously using pg_net extension
  PERFORM extensions.http_post(
    url := v_edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(v_service_role_key, '')
    ),
    body := jsonb_build_object(
      'type', v_email_type,
      'cerereId', NEW.id::text,
      'toEmail', v_user_email,
      'toName', v_user_name
    )
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error sending email notification for cerere %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION public.send_cerere_email_notification() IS
  'Sends email notifications for cereri events via Edge Function.
   Triggered on INSERT (cerere submitted) and UPDATE (status changed).';

-- =====================================================
-- 6. PLATI/CHITANTE FUNCTIONS (20260102224520)
-- =====================================================

-- generate_numar_chitanta: references chitante
CREATE OR REPLACE FUNCTION public.generate_numar_chitanta()
RETURNS TRIGGER AS $$
DECLARE
  an INT;
  count INT;
  numar TEXT;
BEGIN
  -- Get year
  an := EXTRACT(YEAR FROM NOW());

  -- Get sequential count for this year
  SELECT COUNT(*) + 1 INTO count
  FROM public.chitante
  WHERE EXTRACT(YEAR FROM created_at) = an;

  -- Format: CH-2025-00123
  numar := 'CH-' || an || '-' || LPAD(count::TEXT, 5, '0');

  NEW.numar_chitanta := numar;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- log_plata_status_change: references audit_log, utilizatori
CREATE OR REPLACE FUNCTION public.log_plata_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (
      primarie_id,
      utilizator_id,
      utilizator_nume,
      utilizator_rol,
      actiune,
      entitate_tip,
      entitate_id,
      detalii
    )
    SELECT
      NEW.primarie_id,
      u.id,
      u.nume || ' ' || u.prenume,
      u.rol,
      'plata.status_change',
      'plata',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'suma', NEW.suma,
        'transaction_id', NEW.transaction_id
      )
    FROM public.utilizatori u
    WHERE u.id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- validate_plata_cerere: references cereri
CREATE OR REPLACE FUNCTION public.validate_plata_cerere()
RETURNS TRIGGER AS $$
DECLARE
  cerere_needs_payment BOOLEAN;
  cerere_amount DECIMAL;
BEGIN
  -- Check if cerere requires payment
  SELECT necesita_plata, valoare_plata INTO cerere_needs_payment, cerere_amount
  FROM public.cereri
  WHERE id = NEW.cerere_id;

  IF NOT cerere_needs_payment THEN
    RAISE EXCEPTION 'Cererea % nu necesita plata', NEW.cerere_id;
  END IF;

  IF NEW.suma != cerere_amount THEN
    RAISE EXCEPTION 'Suma platii (%) nu corespunde cu valoarea cererii (%)',
      NEW.suma, cerere_amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- =====================================================
-- 7. DASHBOARD REVAMP FUNCTIONS (20260109003629)
-- =====================================================

-- calculate_cerere_progress: IMMUTABLE, no table refs, just ALTER
ALTER FUNCTION public.calculate_cerere_progress(VARCHAR) SET search_path = '';

-- expire_old_notifications: references notifications
CREATE OR REPLACE FUNCTION public.expire_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND dismissed_at IS NULL;
END;
$$;

-- notify_cerere_status_change: references notifications, primarii, judete, localitati
CREATE OR REPLACE FUNCTION public.notify_cerere_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  notification_priority VARCHAR(20);
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN

    -- Determine notification content based on new status
    CASE NEW.status
      WHEN 'aprobat' THEN
        notification_title := 'Cerere Aprobata';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' a fost aprobata!';
        notification_priority := 'high';

      WHEN 'respins' THEN
        notification_title := 'Cerere Respinsa';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' a fost respinsa. Verificati motivul.';
        notification_priority := 'high';

      WHEN 'in_aprobare' THEN
        notification_title := 'Cerere in Aprobare';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' este in proces de aprobare.';
        notification_priority := 'medium';

      WHEN 'in_verificare' THEN
        notification_title := 'Cerere in Verificare';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' este in verificare tehnica.';
        notification_priority := 'medium';

      ELSE
        notification_title := 'Status Actualizat';
        notification_message := 'Cererea dvs. #' || NEW.numar_cerere || ' si-a schimbat statusul.';
        notification_priority := 'low';
    END CASE;

    -- Insert notification
    INSERT INTO public.notifications (
      utilizator_id,
      primarie_id,
      type,
      priority,
      title,
      message,
      action_url,
      action_label,
      expires_at
    ) VALUES (
      NEW.utilizator_id,
      NEW.primarie_id,
      'status_updated',
      notification_priority,
      notification_title,
      notification_message,
      '/app/' || (SELECT slug FROM public.judete WHERE id = (SELECT judet_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/' || (SELECT slug FROM public.localitati WHERE id = (SELECT localitate_id FROM public.primarii WHERE id = NEW.primarie_id)) ||
      '/cereri/' || NEW.id,
      'Vezi Cererea',
      NOW() + INTERVAL '30 days'
    );

    -- Update progress_data
    NEW.progress_data := jsonb_set(
      COALESCE(NEW.progress_data, '{}'::jsonb),
      '{percentage}',
      to_jsonb(public.calculate_cerere_progress(NEW.status))
    );

    NEW.progress_data := jsonb_set(
      NEW.progress_data,
      '{current_step}',
      to_jsonb(NEW.status)
    );

    NEW.progress_data := jsonb_set(
      NEW.progress_data,
      '{last_activity}',
      to_jsonb(NOW())
    );

  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- 8. USER INVITATIONS FUNCTION (20260120000000)
-- =====================================================

-- expire_old_invitations: references user_invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Mark all pending invitations past expiration as expired
  UPDATE public.user_invitations
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE
    status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

COMMENT ON FUNCTION public.expire_old_invitations IS 'Mark all pending invitations past expiration as expired - should be called daily via cron job';

-- =====================================================
-- 9. HANDLE NEW USER FUNCTION (20260124221004 - latest version)
-- =====================================================
-- This function had SET search_path = public, needs to be '' instead.
-- Rewrite with fully qualified table names.

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
    user_primarie_id := NULL;
    user_departament := NULL;
    user_permisiuni := '{}'::jsonb;
    user_localitate_id := NULL;

    RAISE NOTICE 'User % registering as cetatean (normal registration)', NEW.id;
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
'Auto-create utilizatori record when auth.users is created.
Supports invitation-based registration. Falls back to cetatean.
search_path hardened to empty string (2026-03-02).';

COMMIT;

-- =====================================================
-- Summary of functions fixed in this migration:
-- =====================================================
-- 1.  public.current_user_role() - ALTER
-- 2.  public.current_user_primarie() - ALTER
-- 3.  public.generate_numar_inregistrare() - REWRITE
-- 4.  public.update_updated_at_column() - REWRITE
-- 5.  public.log_audit() - REWRITE
-- 6.  public.validate_cerere_status_transition() - REWRITE
-- 7.  public.refresh_public_stats() - REWRITE
-- 8.  public.cleanup_expired_analysis_cache() - REWRITE
-- 9.  public.get_latest_ai_insight(VARCHAR, VARCHAR) - REWRITE
-- 10. public.is_cache_valid(VARCHAR) - REWRITE
-- 11. public.update_cache_access(VARCHAR) - REWRITE
-- 12. public.update_survey_correlation_analysis_updated_at() - REWRITE
-- 13. public.update_survey_cohort_analysis_updated_at() - REWRITE
-- 14. public.send_cerere_email_notification() - REWRITE
-- 15. public.generate_numar_chitanta() - REWRITE
-- 16. public.log_plata_status_change() - REWRITE
-- 17. public.validate_plata_cerere() - REWRITE
-- 18. public.calculate_cerere_progress(VARCHAR) - ALTER
-- 19. public.expire_old_notifications() - REWRITE
-- 20. public.notify_cerere_status_change() - REWRITE
-- 21. public.expire_old_invitations() - REWRITE
-- 22. public.handle_new_user() - REWRITE (search_path = public -> '')
-- Total: 22 functions (3 ALTER + 19 CREATE OR REPLACE)
