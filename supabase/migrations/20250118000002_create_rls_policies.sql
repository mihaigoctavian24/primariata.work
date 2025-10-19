-- Migration: 20250118000002_create_rls_policies.sql
-- Description: Enable Row Level Security and create RLS policies for multi-tenant isolation
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20250118000001_create_extensions_and_core_tables.sql

BEGIN;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE primarii ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilizatori ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipuri_cereri ENABLE ROW LEVEL SECURITY;
ALTER TABLE cereri ENABLE ROW LEVEL SECURITY;
ALTER TABLE documente ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE plati ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificari ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistici_publice ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =====================================================

-- Get current authenticated user ID from JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION auth.current_user_id IS 'Extract user ID from Supabase JWT claims';

-- Get current user role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
  SELECT rol FROM utilizatori WHERE id = auth.current_user_id();
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION auth.current_user_role IS 'Get role of current authenticated user';

-- Get current user primarie_id
CREATE OR REPLACE FUNCTION auth.current_user_primarie()
RETURNS UUID AS $$
  SELECT primarie_id FROM utilizatori WHERE id = auth.current_user_id();
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION auth.current_user_primarie IS 'Get primarie_id of current authenticated user (NULL for cetățeni)';

-- =====================================================
-- RLS POLICIES: PRIMARII TABLE
-- =====================================================

-- Super admin can see and modify all primării
CREATE POLICY primarii_super_admin ON primarii
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM utilizatori
      WHERE id = auth.current_user_id()
        AND rol = 'super_admin'
    )
  );

-- Admin/funcționar can see their own primărie
CREATE POLICY primarii_own ON primarii
  FOR SELECT
  USING (id = auth.current_user_primarie());

-- Cetățeni can see any active primărie (for primărie selection on registration)
CREATE POLICY primarii_public ON primarii
  FOR SELECT
  USING (activa = TRUE AND deleted_at IS NULL);

COMMENT ON POLICY primarii_super_admin ON primarii IS 'Super admins have full access to all primării';
COMMENT ON POLICY primarii_own ON primarii IS 'Funcționari/admins can view their own primărie';
COMMENT ON POLICY primarii_public ON primarii IS 'Public can view active primării for selection';

-- =====================================================
-- RLS POLICIES: UTILIZATORI TABLE
-- =====================================================

-- Users can see and modify their own profile
CREATE POLICY utilizatori_self ON utilizatori
  FOR ALL
  USING (id = auth.current_user_id());

-- Funcționari/admins can see users in their primărie
CREATE POLICY utilizatori_same_primarie ON utilizatori
  FOR SELECT
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

COMMENT ON POLICY utilizatori_self ON utilizatori IS 'Users can manage their own profile';
COMMENT ON POLICY utilizatori_same_primarie ON utilizatori IS 'Funcționari can view users in their primărie';

-- =====================================================
-- RLS POLICIES: TIPURI_CERERI TABLE
-- =====================================================

-- Funcționari/admins can manage request types in their primărie
CREATE POLICY tipuri_cereri_functionar ON tipuri_cereri
  FOR ALL
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

-- Cetățeni can view active request types for any primărie
CREATE POLICY tipuri_cereri_public ON tipuri_cereri
  FOR SELECT
  USING (activ = TRUE);

COMMENT ON POLICY tipuri_cereri_functionar ON tipuri_cereri IS 'Funcționari manage request types in their primărie';
COMMENT ON POLICY tipuri_cereri_public ON tipuri_cereri IS 'Public can view active request types';

-- =====================================================
-- RLS POLICIES: CERERI TABLE
-- =====================================================

-- Cetățeni can see and create their own cereri
CREATE POLICY cereri_own ON cereri
  FOR ALL
  USING (solicitant_id = auth.current_user_id());

-- Funcționari/admins can see all cereri in their primărie
CREATE POLICY cereri_functionar ON cereri
  FOR ALL
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

-- Prevent users from modifying finalized/cancelled cereri (unless admin)
CREATE POLICY cereri_no_modify_finalized ON cereri
  FOR UPDATE
  USING (
    status NOT IN ('finalizata', 'anulata')
    OR auth.current_user_role() = 'admin'
  );

COMMENT ON POLICY cereri_own ON cereri IS 'Cetățeni can manage their own requests';
COMMENT ON POLICY cereri_functionar ON cereri IS 'Funcționari can manage all requests in their primărie';
COMMENT ON POLICY cereri_no_modify_finalized ON cereri IS 'Prevent modification of finalized requests';

-- =====================================================
-- RLS POLICIES: DOCUMENTE TABLE
-- =====================================================

-- Users can see documents for their own cereri
CREATE POLICY documente_own_cerere ON documente
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cereri
      WHERE cereri.id = documente.cerere_id
        AND cereri.solicitant_id = auth.current_user_id()
    )
  );

-- Users can upload documents for their own cereri
CREATE POLICY documente_upload_own ON documente
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cereri
      WHERE cereri.id = documente.cerere_id
        AND cereri.solicitant_id = auth.current_user_id()
    )
    AND incarcat_de_id = auth.current_user_id()
  );

-- Funcționari/admins can manage documents in their primărie
CREATE POLICY documente_functionar ON documente
  FOR ALL
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

COMMENT ON POLICY documente_own_cerere ON documente IS 'Users can view documents for their cereri';
COMMENT ON POLICY documente_upload_own ON documente IS 'Users can upload documents to their cereri';
COMMENT ON POLICY documente_functionar ON documente IS 'Funcționari can manage all documents in their primărie';

-- =====================================================
-- RLS POLICIES: MESAJE TABLE
-- =====================================================

-- Users can see messages where they are sender or recipient
CREATE POLICY mesaje_participant ON mesaje
  FOR SELECT
  USING (
    expeditor_id = auth.current_user_id()
    OR destinatar_id = auth.current_user_id()
  );

-- Only sender can insert (must be expeditor)
CREATE POLICY mesaje_send ON mesaje
  FOR INSERT
  WITH CHECK (expeditor_id = auth.current_user_id());

-- Users can update messages they sent (mark as deleted)
CREATE POLICY mesaje_update_own ON mesaje
  FOR UPDATE
  USING (expeditor_id = auth.current_user_id());

COMMENT ON POLICY mesaje_participant ON mesaje IS 'Users can view messages they sent or received';
COMMENT ON POLICY mesaje_send ON mesaje IS 'Users can only send messages as themselves';

-- =====================================================
-- RLS POLICIES: PLATI TABLE
-- =====================================================

-- Users can see their own payments
CREATE POLICY plati_own ON plati
  FOR SELECT
  USING (utilizator_id = auth.current_user_id());

-- Funcționari/admins can see all payments in their primărie
CREATE POLICY plati_functionar ON plati
  FOR ALL
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

COMMENT ON POLICY plati_own ON plati IS 'Users can view their own payments';
COMMENT ON POLICY plati_functionar ON plati IS 'Funcționari can manage all payments in their primărie';

-- =====================================================
-- RLS POLICIES: NOTIFICARI TABLE
-- =====================================================

-- Users can see their own notifications
CREATE POLICY notificari_own ON notificari
  FOR ALL
  USING (utilizator_id = auth.current_user_id());

COMMENT ON POLICY notificari_own ON notificari IS 'Users can view and manage their own notifications';

-- =====================================================
-- RLS POLICIES: AUDIT_LOG TABLE
-- =====================================================

-- Funcționari/admins can see audit log for their primărie
CREATE POLICY audit_functionar ON audit_log
  FOR SELECT
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

-- Super admin can see all audit logs
CREATE POLICY audit_super_admin ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM utilizatori
      WHERE id = auth.current_user_id()
        AND rol = 'super_admin'
    )
  );

COMMENT ON POLICY audit_functionar ON audit_log IS 'Funcționari can view audit log for their primărie';
COMMENT ON POLICY audit_super_admin ON audit_log IS 'Super admins can view all audit logs';

-- =====================================================
-- RLS POLICIES: TEMPLATES TABLE
-- =====================================================

-- Funcționari/admins can manage templates in their primărie
CREATE POLICY templates_functionar ON templates
  FOR ALL
  USING (
    primarie_id = auth.current_user_primarie()
    AND auth.current_user_role() IN ('functionar', 'admin')
  );

COMMENT ON POLICY templates_functionar ON templates IS 'Funcționari can manage templates in their primărie';

-- =====================================================
-- RLS POLICIES: STATISTICI_PUBLICE TABLE
-- =====================================================

-- Public read access (no authentication required)
CREATE POLICY statistici_publice_public_read ON statistici_publice
  FOR SELECT
  USING (TRUE);

-- Only super admins can modify stats
CREATE POLICY statistici_publice_admin_write ON statistici_publice
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM utilizatori
      WHERE id = auth.current_user_id()
        AND rol = 'super_admin'
    )
  );

COMMENT ON POLICY statistici_publice_public_read ON statistici_publice IS 'Public can read stats (no auth required)';
COMMENT ON POLICY statistici_publice_admin_write ON statistici_publice IS 'Only super admins can modify stats';

COMMIT;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- DROP POLICY IF EXISTS statistici_publice_admin_write ON statistici_publice;
-- DROP POLICY IF EXISTS statistici_publice_public_read ON statistici_publice;
-- DROP POLICY IF EXISTS templates_functionar ON templates;
-- DROP POLICY IF EXISTS audit_super_admin ON audit_log;
-- DROP POLICY IF EXISTS audit_functionar ON audit_log;
-- DROP POLICY IF EXISTS notificari_own ON notificari;
-- DROP POLICY IF EXISTS plati_functionar ON plati;
-- DROP POLICY IF EXISTS plati_own ON plati;
-- DROP POLICY IF EXISTS mesaje_update_own ON mesaje;
-- DROP POLICY IF EXISTS mesaje_send ON mesaje;
-- DROP POLICY IF EXISTS mesaje_participant ON mesaje;
-- DROP POLICY IF EXISTS documente_functionar ON documente;
-- DROP POLICY IF EXISTS documente_upload_own ON documente;
-- DROP POLICY IF EXISTS documente_own_cerere ON documente;
-- DROP POLICY IF EXISTS cereri_no_modify_finalized ON cereri;
-- DROP POLICY IF EXISTS cereri_functionar ON cereri;
-- DROP POLICY IF EXISTS cereri_own ON cereri;
-- DROP POLICY IF EXISTS tipuri_cereri_public ON tipuri_cereri;
-- DROP POLICY IF EXISTS tipuri_cereri_functionar ON tipuri_cereri;
-- DROP POLICY IF EXISTS utilizatori_same_primarie ON utilizatori;
-- DROP POLICY IF EXISTS utilizatori_self ON utilizatori;
-- DROP POLICY IF EXISTS primarii_public ON primarii;
-- DROP POLICY IF EXISTS primarii_own ON primarii;
-- DROP POLICY IF EXISTS primarii_super_admin ON primarii;
-- DROP FUNCTION IF EXISTS auth.current_user_primarie();
-- DROP FUNCTION IF EXISTS auth.current_user_role();
-- DROP FUNCTION IF EXISTS auth.current_user_id();
-- ALTER TABLE statistici_publice DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE notificari DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE plati DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE mesaje DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE documente DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE cereri DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE tipuri_cereri DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE utilizatori DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE primarii DISABLE ROW LEVEL SECURITY;
