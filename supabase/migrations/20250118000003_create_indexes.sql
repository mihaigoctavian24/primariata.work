-- Migration: 20250118000003_create_indexes.sql
-- Description: Create full-text search indexes and composite indexes for query performance
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20250118000001_create_extensions_and_core_tables.sql

BEGIN;

-- Set search path to include extensions schema for pg_trgm
SET search_path TO public, extensions;

-- =====================================================
-- FULL-TEXT SEARCH INDEXES (Romanian language)
-- =====================================================

-- Search localități by name (Romanian text search)
CREATE INDEX idx_localitati_search ON localitati
  USING gin(to_tsvector('romanian', nume));

COMMENT ON INDEX idx_localitati_search IS 'Full-text search on localități names with Romanian stemming';

-- Trigram index for fuzzy matching on localități names
CREATE INDEX idx_localitati_nume_trgm ON localitati
  USING gin(nume gin_trgm_ops);

COMMENT ON INDEX idx_localitati_nume_trgm IS 'Trigram index for fuzzy/partial matching on localități names';

-- Note: Full-slug index would require a generated column or function
-- For now, we'll use separate indexes on judet_id and slug (already exist)

-- Search cereri by content (Romanian text search)
CREATE INDEX idx_cereri_search ON cereri
  USING gin(to_tsvector('romanian',
    COALESCE(raspuns, '') || ' ' || COALESCE(observatii_solicitant, '')
  ));

COMMENT ON INDEX idx_cereri_search IS 'Full-text search on cereri responses and observations';

-- Search utilizatori by name (Romanian text search)
CREATE INDEX idx_utilizatori_search ON utilizatori
  USING gin(to_tsvector('romanian', nume || ' ' || prenume));

COMMENT ON INDEX idx_utilizatori_search IS 'Full-text search on user full names';

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Dashboard: Active cereri by status (most common query for funcționari)
CREATE INDEX idx_cereri_dashboard ON cereri(primarie_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_cereri_dashboard IS 'Optimized for funcționari dashboard query (filter by primărie, status, sort by date)';

-- User's cereri list (most common query for cetățeni)
CREATE INDEX idx_cereri_user_list ON cereri(solicitant_id, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_cereri_user_list IS 'Optimized for citizen request history query';

-- Unread notifications (for notification badge)
CREATE INDEX idx_notificari_unread ON notificari(utilizator_id, created_at DESC)
  WHERE citita = FALSE;

COMMENT ON INDEX idx_notificari_unread IS 'Optimized for unread notification count and list';

-- Pending payments (for payment reminders)
CREATE INDEX idx_plati_pending ON plati(utilizator_id, status, data_scadenta)
  WHERE status IN ('initiata', 'procesare');

COMMENT ON INDEX idx_plati_pending IS 'Optimized for pending payment queries with deadline sorting';

-- Cereri by type and status (for statistics)
CREATE INDEX idx_cereri_stats ON cereri(primarie_id, tip_cerere_id, status)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_cereri_stats IS 'Optimized for statistics aggregation by request type and status';

-- Documents by cerere and type (for document listing)
CREATE INDEX idx_documente_cerere_tip ON documente(cerere_id, tip_document, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_documente_cerere_tip IS 'Optimized for document listing by type within a request';

-- Mesaje unread count (for unread badge)
CREATE INDEX idx_mesaje_unread ON mesaje(cerere_id, destinatar_id, citit)
  WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_mesaje_unread IS 'Optimized for unread message count per cerere';

-- Audit log by entity (for entity history)
CREATE INDEX idx_audit_entity_history ON audit_log(entitate_tip, entitate_id, created_at DESC);

COMMENT ON INDEX idx_audit_entity_history IS 'Optimized for entity history queries (e.g., all changes to a specific cerere)';

-- Utilizatori by primărie and role (for admin user management)
CREATE INDEX idx_utilizatori_primarie_rol ON utilizatori(primarie_id, rol, created_at DESC)
  WHERE deleted_at IS NULL AND activ = TRUE;

COMMENT ON INDEX idx_utilizatori_primarie_rol IS 'Optimized for user management queries by primărie and role';

-- Tipuri cereri by primărie (for request type selection)
CREATE INDEX idx_tipuri_cereri_active ON tipuri_cereri(primarie_id, ordine_afisare)
  WHERE activ = TRUE;

COMMENT ON INDEX idx_tipuri_cereri_active IS 'Optimized for active request type listing with custom ordering';

COMMIT;

-- =====================================================
-- Performance Testing Queries (commented for reference)
-- =====================================================

-- Test full-text search performance
-- EXPLAIN ANALYZE
-- SELECT * FROM localitati
-- WHERE to_tsvector('romanian', nume) @@ plainto_tsquery('romanian', 'Arad');

-- Test dashboard query performance
-- EXPLAIN ANALYZE
-- SELECT * FROM cereri
-- WHERE primarie_id = 'some-uuid'
--   AND status = 'depusa'
--   AND deleted_at IS NULL
-- ORDER BY created_at DESC
-- LIMIT 20;

-- Test unread notifications performance
-- EXPLAIN ANALYZE
-- SELECT COUNT(*) FROM notificari
-- WHERE utilizator_id = 'some-uuid'
--   AND citita = FALSE;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- DROP INDEX IF EXISTS idx_tipuri_cereri_active;
-- DROP INDEX IF EXISTS idx_utilizatori_primarie_rol;
-- DROP INDEX IF EXISTS idx_audit_entity_history;
-- DROP INDEX IF EXISTS idx_mesaje_unread;
-- DROP INDEX IF EXISTS idx_documente_cerere_tip;
-- DROP INDEX IF EXISTS idx_cereri_stats;
-- DROP INDEX IF EXISTS idx_plati_pending;
-- DROP INDEX IF EXISTS idx_notificari_unread;
-- DROP INDEX IF EXISTS idx_cereri_user_list;
-- DROP INDEX IF EXISTS idx_cereri_dashboard;
-- DROP INDEX IF EXISTS idx_utilizatori_search;
-- DROP INDEX IF EXISTS idx_cereri_search;
-- DROP INDEX IF EXISTS idx_localitati_full_slug;
-- DROP INDEX IF EXISTS idx_localitati_nume_trgm;
-- DROP INDEX IF EXISTS idx_localitati_search;
