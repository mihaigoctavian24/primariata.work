-- Migration: 20260303000002_enable_realtime_user_primarii.sql
-- Description: Enable Realtime on user_primarii for instant registration status updates,
--              and extend notifications CHECK constraint with registration notification types.
-- Dependencies: 20260302000001_create_user_primarii_and_rewrite_rls.sql
-- Phase: 03-registration-approval, Plan: 01

BEGIN;

-- Enable REPLICA IDENTITY FULL for UPDATE events to include all columns in Realtime payload
-- This is required so subscribers can see the old AND new values on status changes
ALTER TABLE public.user_primarii REPLICA IDENTITY FULL;

-- Add to Realtime publication so clients can subscribe to INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_primarii;

COMMENT ON TABLE public.user_primarii IS 'Junction table: maps users to primarii with per-primarie role, status, and permissions. Realtime enabled for registration status updates.';

-- Extend notifications CHECK constraint to include registration notification types
-- Must drop and re-create since ALTER CHECK is not supported in PostgreSQL
-- The constraint was created in 20260109003629_dashboard_revamp_tables.sql
-- Dynamic drop in case the constraint has a different auto-generated name
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find the CHECK constraint on the 'type' column of notifications
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey)
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname = 'notifications'
    AND a.attname = 'type'
    AND c.contype = 'c'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.notifications DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped notifications type CHECK constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No CHECK constraint found on notifications.type -- skipping drop';
  END IF;
END $$;

-- Re-create with extended types including registration notifications
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'payment_due',
  'cerere_approved',
  'cerere_rejected',
  'document_missing',
  'document_uploaded',
  'status_updated',
  'deadline_approaching',
  'action_required',
  'info',
  'registration_approved',
  'registration_rejected',
  'registration_pending'
));

COMMIT;
