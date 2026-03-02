-- Migration: 20260302000001_create_user_primarii_and_rewrite_rls.sql
-- Description: Create user_primarii junction table, per-request context function (db_pre_request),
--              new RLS helper functions, and rewrite ALL core RLS policies for multi-primarie support.
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: All prior migrations
--
-- CRITICAL: This migration is wrapped in BEGIN/COMMIT for atomicity.
-- All old policies are dropped and replaced in a single transaction.
-- If any step fails, the entire migration rolls back.
--
-- Context: Migrates from single-primarie-per-user (utilizatori.primarie_id) to
--          multi-primarie-per-user (user_primarii junction table) with per-request context.

BEGIN;

-- =====================================================
-- STEP 1: Create user_primarii junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_primarii (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primarie_id UUID NOT NULL REFERENCES public.primarii(id) ON DELETE CASCADE,
  rol VARCHAR(50) NOT NULL DEFAULT 'cetatean'
    CHECK (rol IN ('cetatean', 'functionar', 'admin', 'primar', 'super_admin')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  permissions JSONB DEFAULT '[]'::jsonb,
  departament VARCHAR(100),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, primarie_id)
);

-- Indexes for performance
CREATE INDEX idx_user_primarii_user ON public.user_primarii(user_id) WHERE status = 'approved';
CREATE INDEX idx_user_primarii_primarie ON public.user_primarii(primarie_id) WHERE status = 'approved';
CREATE INDEX idx_user_primarii_status ON public.user_primarii(status);
CREATE INDEX idx_user_primarii_rol ON public.user_primarii(primarie_id, rol) WHERE status = 'approved';

-- Enable RLS on user_primarii
ALTER TABLE public.user_primarii ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_primarii IS 'Junction table: maps users to primarii with per-primarie role, status, and permissions. Supports multi-primarie membership.';
COMMENT ON COLUMN public.user_primarii.rol IS 'User role within this primarie: cetatean, functionar, admin, primar, super_admin';
COMMENT ON COLUMN public.user_primarii.status IS 'Association status: pending (awaiting approval), approved (active), rejected, suspended';
COMMENT ON COLUMN public.user_primarii.permissions IS 'Fine-grained permissions as JSONB array (e.g., ["cereri.aprobare", "documente.generare"])';

-- =====================================================
-- STEP 2: Migrate existing data from utilizatori
-- =====================================================

INSERT INTO public.user_primarii (user_id, primarie_id, rol, status, created_at, updated_at)
SELECT
  u.id,
  u.primarie_id,
  COALESCE(u.rol, 'cetatean'),
  'approved',
  u.created_at,
  NOW()
FROM public.utilizatori u
WHERE u.primarie_id IS NOT NULL
ON CONFLICT (user_id, primarie_id) DO NOTHING;

-- =====================================================
-- STEP 3: Create db_pre_request function (set_request_context)
-- =====================================================
-- This function is called by PostgREST before every request.
-- It extracts x-primarie-id from request headers and JWT sub claim,
-- then sets transaction-scoped session variables for RLS policies.

CREATE OR REPLACE FUNCTION public.set_request_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  primarie_id text;
  user_id text;
BEGIN
  primarie_id := current_setting('request.headers', true)::json->>'x-primarie-id';
  user_id := (current_setting('request.jwt.claims', true)::json->>'sub');
  PERFORM set_config('app.current_primarie_id', COALESCE(primarie_id, ''), true);
  PERFORM set_config('app.current_user_id', COALESCE(user_id, ''), true);
END;
$$;

COMMENT ON FUNCTION public.set_request_context IS 'db_pre_request hook: extracts x-primarie-id header and JWT sub, sets app.current_primarie_id and app.current_user_id session variables for RLS.';

-- Configure PostgREST to call set_request_context before every request
ALTER ROLE authenticator SET pgrst.db_pre_request = 'public.set_request_context';
NOTIFY pgrst, 'reload config';

-- =====================================================
-- STEP 4: Create new helper functions
-- =====================================================

-- get_request_primarie_id: replaces current_user_primarie()
-- Returns the per-request primarie_id from session config, or NULL if not set.
CREATE OR REPLACE FUNCTION public.get_request_primarie_id()
RETURNS UUID
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(current_setting('app.current_primarie_id', true), '')::uuid;
$$;

COMMENT ON FUNCTION public.get_request_primarie_id IS 'Get the per-request primarie_id from session config (set by db_pre_request). Returns NULL if no primarie context.';

-- get_user_role_in_primarie: replaces current_user_role()
-- Returns the user role for the current primarie context.
CREATE OR REPLACE FUNCTION public.get_user_role_in_primarie()
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT up.rol FROM public.user_primarii up
  WHERE up.user_id = auth.uid()
    AND up.primarie_id = public.get_request_primarie_id()
    AND up.status = 'approved'
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_role_in_primarie IS 'Get the current user role within the per-request primarie context. Returns NULL if user has no approved association.';

-- is_super_admin: check if current user has super_admin role anywhere
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.rol = 'super_admin'
      AND up.status = 'approved'
  );
$$;

COMMENT ON FUNCTION public.is_super_admin IS 'Check if current user is a super_admin (not primarie-scoped, checks any association).';

-- user_has_primarie_access: check if user has approved association with current primarie
CREATE OR REPLACE FUNCTION public.user_has_primarie_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_primarii up
    WHERE up.user_id = auth.uid()
      AND up.primarie_id = public.get_request_primarie_id()
      AND up.status = 'approved'
  );
$$;

COMMENT ON FUNCTION public.user_has_primarie_access IS 'Check if current user has an approved association with the current per-request primarie.';

-- =====================================================
-- STEP 5: Drop ALL existing RLS policies on core tables
-- =====================================================
-- Drop every policy from the original 20250118000002 migration
-- and from later migrations that added policies to the same tables.

-- primarii
DROP POLICY IF EXISTS primarii_super_admin ON public.primarii;
DROP POLICY IF EXISTS primarii_own ON public.primarii;
DROP POLICY IF EXISTS primarii_public ON public.primarii;

-- utilizatori
DROP POLICY IF EXISTS utilizatori_self ON public.utilizatori;
DROP POLICY IF EXISTS utilizatori_same_primarie ON public.utilizatori;

-- tipuri_cereri
DROP POLICY IF EXISTS tipuri_cereri_functionar ON public.tipuri_cereri;
DROP POLICY IF EXISTS tipuri_cereri_public ON public.tipuri_cereri;

-- cereri
DROP POLICY IF EXISTS cereri_own ON public.cereri;
DROP POLICY IF EXISTS cereri_functionar ON public.cereri;
DROP POLICY IF EXISTS cereri_no_modify_finalized ON public.cereri;

-- documente
DROP POLICY IF EXISTS documente_own_cerere ON public.documente;
DROP POLICY IF EXISTS documente_upload_own ON public.documente;
DROP POLICY IF EXISTS documente_functionar ON public.documente;

-- mesaje
DROP POLICY IF EXISTS mesaje_participant ON public.mesaje;
DROP POLICY IF EXISTS mesaje_send ON public.mesaje;
DROP POLICY IF EXISTS mesaje_update_own ON public.mesaje;

-- plati (original from 20250118000002)
DROP POLICY IF EXISTS plati_own ON public.plati;
DROP POLICY IF EXISTS plati_functionar ON public.plati;

-- plati (from 20260102224520_create_plati_chitante.sql -- these may have replaced originals)
DROP POLICY IF EXISTS plati_own_user ON public.plati;
DROP POLICY IF EXISTS plati_create_own ON public.plati;
DROP POLICY IF EXISTS plati_functionar_view ON public.plati;
DROP POLICY IF EXISTS plati_no_user_update ON public.plati;

-- notificari
DROP POLICY IF EXISTS notificari_own ON public.notificari;

-- audit_log
DROP POLICY IF EXISTS audit_functionar ON public.audit_log;
DROP POLICY IF EXISTS audit_super_admin ON public.audit_log;

-- templates
DROP POLICY IF EXISTS templates_functionar ON public.templates;

-- statistici_publice
DROP POLICY IF EXISTS statistici_publice_public_read ON public.statistici_publice;
DROP POLICY IF EXISTS statistici_publice_admin_write ON public.statistici_publice;

-- =====================================================
-- STEP 5b: Create new RLS policies for all core tables
-- =====================================================
-- All policies use get_request_primarie_id() for primarie context
-- and user_primarii junction table for role/access checks.
-- NULL primarie_id is handled naturally: NULL != any_uuid evaluates
-- to FALSE, so protected tables deny access when no primarie context.

-- =====================================================
-- RLS POLICIES: primarii
-- =====================================================

-- super_admin: full access to all primarii
CREATE POLICY primarii_super_admin ON public.primarii
  FOR ALL
  USING (public.is_super_admin());

-- staff: can view their own primarie (approved association)
CREATE POLICY primarii_staff_select ON public.primarii
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = public.primarii.id
        AND up.status = 'approved'
    )
  );

-- public: any user can see active primarii (for location selection, no auth required)
CREATE POLICY primarii_public_select ON public.primarii
  FOR SELECT
  USING (activa = TRUE AND deleted_at IS NULL);

-- =====================================================
-- RLS POLICIES: utilizatori
-- =====================================================

-- self: users can manage their own profile
CREATE POLICY utilizatori_self ON public.utilizatori
  FOR ALL
  USING (id = auth.uid());

-- staff: functionar/admin/primar can view users in current primarie
CREATE POLICY utilizatori_staff_select ON public.utilizatori
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_primarii up_viewer
      WHERE up_viewer.user_id = auth.uid()
        AND up_viewer.primarie_id = public.get_request_primarie_id()
        AND up_viewer.status = 'approved'
        AND up_viewer.rol IN ('functionar', 'admin', 'primar', 'super_admin')
    )
    AND EXISTS (
      SELECT 1 FROM public.user_primarii up_target
      WHERE up_target.user_id = public.utilizatori.id
        AND up_target.primarie_id = public.get_request_primarie_id()
        AND up_target.status = 'approved'
    )
  );

-- =====================================================
-- RLS POLICIES: user_primarii (NEW table)
-- =====================================================

-- self: users can view their own associations
CREATE POLICY user_primarii_self_select ON public.user_primarii
  FOR SELECT
  USING (user_id = auth.uid());

-- admin/primar: can manage associations for their primarie
CREATE POLICY user_primarii_admin_all ON public.user_primarii
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_primarii up_admin
      WHERE up_admin.user_id = auth.uid()
        AND up_admin.primarie_id = public.user_primarii.primarie_id
        AND up_admin.status = 'approved'
        AND up_admin.rol IN ('admin', 'primar')
    )
  );

-- super_admin: full access to all associations
CREATE POLICY user_primarii_super_admin ON public.user_primarii
  FOR ALL
  USING (public.is_super_admin());

-- =====================================================
-- RLS POLICIES: tipuri_cereri
-- =====================================================

-- staff: full access for current primarie (functionar/admin/primar)
CREATE POLICY tipuri_cereri_staff ON public.tipuri_cereri
  FOR ALL
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- citizen: can view active request types for current primarie (approved association)
CREATE POLICY tipuri_cereri_citizen_select ON public.tipuri_cereri
  FOR SELECT
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.user_has_primarie_access()
    AND activ = TRUE
  );

-- public: anyone can view active request types (for browsing without auth)
CREATE POLICY tipuri_cereri_public_select ON public.tipuri_cereri
  FOR SELECT
  USING (activ = TRUE);

-- =====================================================
-- RLS POLICIES: cereri
-- =====================================================

-- citizen: full access on own cereri in current primarie
CREATE POLICY cereri_citizen ON public.cereri
  FOR ALL
  USING (
    solicitant_id = auth.uid()
    AND primarie_id = public.get_request_primarie_id()
  );

-- staff: can view and update cereri in current primarie (functionar/admin/primar)
CREATE POLICY cereri_staff_select ON public.cereri
  FOR SELECT
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

CREATE POLICY cereri_staff_update ON public.cereri
  FOR UPDATE
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- super_admin: full access to all cereri
CREATE POLICY cereri_super_admin ON public.cereri
  FOR ALL
  USING (public.is_super_admin());

-- =====================================================
-- RLS POLICIES: documente
-- =====================================================

-- owner: full access on documents for own cereri
CREATE POLICY documente_owner ON public.documente
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cereri c
      WHERE c.id = public.documente.cerere_id
        AND c.solicitant_id = auth.uid()
    )
  );

-- staff: can view and insert documents for cereri in their primarie
CREATE POLICY documente_staff_select ON public.documente
  FOR SELECT
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

CREATE POLICY documente_staff_insert ON public.documente
  FOR INSERT
  WITH CHECK (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- =====================================================
-- RLS POLICIES: mesaje
-- =====================================================

-- participants: can view messages for cereri they own or process
CREATE POLICY mesaje_participant_select ON public.mesaje
  FOR SELECT
  USING (
    expeditor_id = auth.uid()
    OR destinatar_id = auth.uid()
  );

-- sender: only the sender can create messages
CREATE POLICY mesaje_sender_insert ON public.mesaje
  FOR INSERT
  WITH CHECK (expeditor_id = auth.uid());

-- sender: can update own messages (mark as deleted)
CREATE POLICY mesaje_sender_update ON public.mesaje
  FOR UPDATE
  USING (expeditor_id = auth.uid());

-- =====================================================
-- RLS POLICIES: plati
-- =====================================================

-- citizen: can view and create own payments in current primarie
CREATE POLICY plati_citizen_select ON public.plati
  FOR SELECT
  USING (
    utilizator_id = auth.uid()
    AND primarie_id = public.get_request_primarie_id()
  );

CREATE POLICY plati_citizen_insert ON public.plati
  FOR INSERT
  WITH CHECK (
    utilizator_id = auth.uid()
    AND primarie_id = public.get_request_primarie_id()
    AND EXISTS (
      SELECT 1 FROM public.cereri c
      WHERE c.id = public.plati.cerere_id
        AND c.solicitant_id = auth.uid()
    )
  );

-- staff: can view payments in current primarie
CREATE POLICY plati_staff_select ON public.plati
  FOR SELECT
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- =====================================================
-- RLS POLICIES: notificari
-- =====================================================

-- self: users can manage their own notifications
CREATE POLICY notificari_self ON public.notificari
  FOR ALL
  USING (utilizator_id = auth.uid());

-- =====================================================
-- RLS POLICIES: audit_log
-- =====================================================

-- staff: can view audit log for current primarie
CREATE POLICY audit_log_staff_select ON public.audit_log
  FOR SELECT
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- super_admin: can view all audit logs
CREATE POLICY audit_log_super_admin_select ON public.audit_log
  FOR SELECT
  USING (public.is_super_admin());

-- system: INSERT only (via triggers, no direct user insert needed on this table)
-- Triggers run as SECURITY DEFINER so they bypass RLS. No explicit INSERT policy needed.

-- =====================================================
-- RLS POLICIES: templates
-- =====================================================

-- staff: full access for current primarie
CREATE POLICY templates_staff ON public.templates
  FOR ALL
  USING (
    primarie_id = public.get_request_primarie_id()
    AND public.get_user_role_in_primarie() IN ('functionar', 'admin', 'primar', 'super_admin')
  );

-- citizen: can view active templates (for document preview)
CREATE POLICY templates_citizen_select ON public.templates
  FOR SELECT
  USING (activ = TRUE);

-- =====================================================
-- RLS POLICIES: statistici_publice
-- =====================================================

-- public: anyone can read public stats (no auth required)
CREATE POLICY statistici_publice_public_read ON public.statistici_publice
  FOR SELECT
  USING (TRUE);

-- admin: full access for current primarie (admin/primar/super_admin can manage stats)
CREATE POLICY statistici_publice_admin ON public.statistici_publice
  FOR ALL
  USING (
    public.get_user_role_in_primarie() IN ('admin', 'primar', 'super_admin')
    OR public.is_super_admin()
  );

-- =====================================================
-- STEP 7: Add updated_at trigger for user_primarii
-- =====================================================

CREATE TRIGGER set_updated_at_user_primarii
  BEFORE UPDATE ON public.user_primarii
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 8: Deprecation comments on legacy functions
-- =====================================================
-- Do NOT drop current_user_primarie() and current_user_role() yet --
-- keep them for backward compatibility during the transition.

COMMENT ON FUNCTION public.current_user_primarie IS 'DEPRECATED: Use get_request_primarie_id() instead. Kept for backward compatibility.';
COMMENT ON FUNCTION public.current_user_role IS 'DEPRECATED: Use get_user_role_in_primarie() instead. Kept for backward compatibility.';

COMMIT;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- BEGIN;
-- -- Drop new policies
-- DROP POLICY IF EXISTS primarii_super_admin ON public.primarii;
-- DROP POLICY IF EXISTS primarii_staff_select ON public.primarii;
-- DROP POLICY IF EXISTS primarii_public_select ON public.primarii;
-- DROP POLICY IF EXISTS utilizatori_self ON public.utilizatori;
-- DROP POLICY IF EXISTS utilizatori_staff_select ON public.utilizatori;
-- DROP POLICY IF EXISTS user_primarii_self_select ON public.user_primarii;
-- DROP POLICY IF EXISTS user_primarii_admin_all ON public.user_primarii;
-- DROP POLICY IF EXISTS user_primarii_super_admin ON public.user_primarii;
-- DROP POLICY IF EXISTS tipuri_cereri_staff ON public.tipuri_cereri;
-- DROP POLICY IF EXISTS tipuri_cereri_citizen_select ON public.tipuri_cereri;
-- DROP POLICY IF EXISTS tipuri_cereri_public_select ON public.tipuri_cereri;
-- DROP POLICY IF EXISTS cereri_citizen ON public.cereri;
-- DROP POLICY IF EXISTS cereri_staff_select ON public.cereri;
-- DROP POLICY IF EXISTS cereri_staff_update ON public.cereri;
-- DROP POLICY IF EXISTS cereri_super_admin ON public.cereri;
-- DROP POLICY IF EXISTS documente_owner ON public.documente;
-- DROP POLICY IF EXISTS documente_staff_select ON public.documente;
-- DROP POLICY IF EXISTS documente_staff_insert ON public.documente;
-- DROP POLICY IF EXISTS mesaje_participant_select ON public.mesaje;
-- DROP POLICY IF EXISTS mesaje_sender_insert ON public.mesaje;
-- DROP POLICY IF EXISTS mesaje_sender_update ON public.mesaje;
-- DROP POLICY IF EXISTS plati_citizen_select ON public.plati;
-- DROP POLICY IF EXISTS plati_citizen_insert ON public.plati;
-- DROP POLICY IF EXISTS plati_staff_select ON public.plati;
-- DROP POLICY IF EXISTS notificari_self ON public.notificari;
-- DROP POLICY IF EXISTS audit_log_staff_select ON public.audit_log;
-- DROP POLICY IF EXISTS audit_log_super_admin_select ON public.audit_log;
-- DROP POLICY IF EXISTS templates_staff ON public.templates;
-- DROP POLICY IF EXISTS templates_citizen_select ON public.templates;
-- DROP POLICY IF EXISTS statistici_publice_public_read ON public.statistici_publice;
-- DROP POLICY IF EXISTS statistici_publice_admin ON public.statistici_publice;
-- -- Drop new functions
-- DROP FUNCTION IF EXISTS public.user_has_primarie_access();
-- DROP FUNCTION IF EXISTS public.is_super_admin();
-- DROP FUNCTION IF EXISTS public.get_user_role_in_primarie();
-- DROP FUNCTION IF EXISTS public.get_request_primarie_id();
-- DROP FUNCTION IF EXISTS public.set_request_context();
-- -- Drop junction table
-- DROP TABLE IF EXISTS public.user_primarii CASCADE;
-- COMMIT;
