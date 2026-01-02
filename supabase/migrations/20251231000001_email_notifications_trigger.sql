-- =====================================================
-- MIGRATION: Email Notifications Trigger
-- =====================================================
-- Purpose: Automatically send email notifications on cereri events
-- Date: 2025-12-31
-- Author: ATLAS
-- Issue: #76 - Email Notifications for Cereri Events
-- =====================================================

-- Enable pg_net extension for HTTP requests from PostgreSQL
-- This allows database triggers to call Edge Functions asynchronously
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =====================================================
-- Function: send_cerere_email_notification
-- =====================================================
-- Calls the send-email Edge Function via HTTP request
-- This function is invoked by triggers on cereri table

CREATE OR REPLACE FUNCTION send_cerere_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_email_type TEXT;
  v_edge_function_url TEXT;
  v_service_role_key TEXT;
BEGIN
  -- Get Edge Function URL and service role key from environment
  -- These will be set in Supabase project settings
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

  -- Skip if user email not found (should not happen with proper FK constraints)
  IF v_user_email IS NULL THEN
    RAISE WARNING 'User email not found for solicitant_id: %', NEW.solicitant_id;
    RETURN NEW;
  END IF;

  -- Determine email type based on trigger operation and status
  IF TG_OP = 'INSERT' THEN
    -- New cerere submitted (only send if status is 'depusa' or 'trimisa')
    IF NEW.status IN ('depusa', 'trimisa') THEN
      v_email_type := 'cerere_submitted';
    ELSE
      -- Skip email for draft submissions
      RETURN NEW;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      -- Check for specific status changes
      IF NEW.status = 'finalizata' THEN
        v_email_type := 'cerere_finalizata';
      ELSIF NEW.status = 'respinsa' THEN
        v_email_type := 'cerere_respinsa';
      ELSIF NEW.status != 'draft' THEN
        -- General status change notification
        v_email_type := 'status_changed';
      ELSE
        -- Skip email for draft status
        RETURN NEW;
      END IF;
    ELSE
      -- Status didn't change, skip email
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
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error sending email notification for cerere %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger: After INSERT on cereri (New cerere submitted)
-- =====================================================

CREATE TRIGGER trigger_send_email_on_cerere_insert
  AFTER INSERT ON cereri
  FOR EACH ROW
  WHEN (NEW.status IN ('depusa', 'trimisa'))
  EXECUTE FUNCTION send_cerere_email_notification();

-- =====================================================
-- Trigger: After UPDATE on cereri (Status changed)
-- =====================================================

CREATE TRIGGER trigger_send_email_on_cerere_update
  AFTER UPDATE ON cereri
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status != 'draft')
  EXECUTE FUNCTION send_cerere_email_notification();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON FUNCTION send_cerere_email_notification() IS
  'Sends email notifications for cereri events via Edge Function.
   Triggered on INSERT (cerere submitted) and UPDATE (status changed).';

COMMENT ON TRIGGER trigger_send_email_on_cerere_insert ON cereri IS
  'Sends confirmation email when a new cerere is submitted (status: depusa/trimisa)';

COMMENT ON TRIGGER trigger_send_email_on_cerere_update ON cereri IS
  'Sends notification email when cerere status changes (excluding draft)';
