-- Migration: 20250118000004_create_triggers.sql
-- Description: Create trigger functions and triggers for automated behavior
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20250118000001_create_extensions_and_core_tables.sql

BEGIN;

-- =====================================================
-- TRIGGER FUNCTION: Auto-generate Registration Number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_numar_inregistrare()
RETURNS TRIGGER AS $$
DECLARE
  judet_cod VARCHAR(2);
  localitate_slug VARCHAR(250);
  an INT;
  count INT;
  numar VARCHAR(50);
BEGIN
  -- Get județ code and localitate slug from primărie
  SELECT j.cod, l.slug INTO judet_cod, localitate_slug
  FROM primarii p
  JOIN localitati l ON p.localitate_id = l.id
  JOIN judete j ON l.judet_id = j.id
  WHERE p.id = NEW.primarie_id;

  -- Get current year
  an := EXTRACT(YEAR FROM NOW());

  -- Count existing cereri for this primărie in current year
  SELECT COUNT(*) + 1 INTO count
  FROM cereri
  WHERE primarie_id = NEW.primarie_id
    AND EXTRACT(YEAR FROM created_at) = an;

  -- Format: AR-ZN-2025-00123
  -- judet_cod: AR (Arad)
  -- localitate_slug first 2 chars: ZN (Zimandu Nou)
  -- year: 2025
  -- sequence: 00123 (zero-padded to 5 digits)
  numar := UPPER(judet_cod) || '-' || UPPER(LEFT(localitate_slug, 2)) || '-' ||
           an || '-' || LPAD(count::TEXT, 5, '0');

  NEW.numar_inregistrare := numar;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_numar_inregistrare IS 'Auto-generate unique registration number for cereri (e.g., AR-ZN-2025-00123)';

-- Create trigger on cereri table
CREATE TRIGGER set_numar_inregistrare
  BEFORE INSERT ON cereri
  FOR EACH ROW
  WHEN (NEW.numar_inregistrare IS NULL)
  EXECUTE FUNCTION generate_numar_inregistrare();

COMMENT ON TRIGGER set_numar_inregistrare ON cereri IS 'Auto-generate registration number on cerere creation';

-- =====================================================
-- TRIGGER FUNCTION: Update updated_at Timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Auto-update updated_at timestamp on row modification';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_primarii_updated_at
  BEFORE UPDATE ON primarii
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utilizatori_updated_at
  BEFORE UPDATE ON utilizatori
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cereri_updated_at
  BEFORE UPDATE ON cereri
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipuri_cereri_updated_at
  BEFORE UPDATE ON tipuri_cereri
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plati_updated_at
  BEFORE UPDATE ON plati
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FUNCTION: Audit Log
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit()
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
  FROM utilizatori
  WHERE id = auth.current_user_id();

  -- If user not found in utilizatori (e.g., system operation), use NULL
  IF user_id IS NULL THEN
    user_id := auth.current_user_id();
    user_name := 'System';
    user_role := 'system';
  END IF;

  -- Log the action to audit_log
  INSERT INTO audit_log (
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
    TG_TABLE_NAME || '.' || lower(TG_OP),  -- e.g., "cereri.insert", "cereri.update"
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    inet_client_addr()  -- IP address of the client
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit IS 'Log all sensitive table operations to audit_log with before/after values';

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_cereri
  AFTER INSERT OR UPDATE OR DELETE ON cereri
  FOR EACH ROW
  EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_documente
  AFTER INSERT OR UPDATE OR DELETE ON documente
  FOR EACH ROW
  EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_utilizatori
  AFTER INSERT OR UPDATE OR DELETE ON utilizatori
  FOR EACH ROW
  EXECUTE FUNCTION log_audit();

COMMENT ON TRIGGER audit_cereri ON cereri IS 'Log all cereri changes to audit_log';
COMMENT ON TRIGGER audit_documente ON documente IS 'Log all document changes to audit_log';
COMMENT ON TRIGGER audit_utilizatori ON utilizatori IS 'Log all user changes to audit_log';

-- =====================================================
-- TRIGGER FUNCTION: Validate Cerere Status Transitions
-- =====================================================

CREATE OR REPLACE FUNCTION validate_cerere_status_transition()
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

  -- Clear data_finalizare if status changes from finalizata to something else
  IF NEW.status != 'finalizata' AND OLD.status = 'finalizata' THEN
    NEW.data_finalizare := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_cerere_status_transition IS 'Enforce status transition rules and auto-set data_finalizare';

-- Create trigger on cereri table
CREATE TRIGGER validate_cerere_status
  BEFORE UPDATE ON cereri
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_cerere_status_transition();

COMMENT ON TRIGGER validate_cerere_status ON cereri IS 'Validate status transitions and auto-set completion date';

-- =====================================================
-- FUNCTION: Refresh Public Statistics
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_public_stats()
RETURNS void AS $$
BEGIN
  -- Update localități count
  UPDATE statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM localitati),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'localitati_count';

  -- If row doesn't exist, insert it
  IF NOT FOUND THEN
    INSERT INTO statistici_publice (tip_statistica, valoare)
    VALUES (
      'localitati_count',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM localitati),
        'updated_at', NOW()
      )
    );
  END IF;

  -- Update primării active count
  UPDATE statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM primarii WHERE activa = TRUE AND deleted_at IS NULL),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'primarii_active';

  IF NOT FOUND THEN
    INSERT INTO statistici_publice (tip_statistica, valoare)
    VALUES (
      'primarii_active',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM primarii WHERE activa = TRUE AND deleted_at IS NULL),
        'updated_at', NOW()
      )
    );
  END IF;

  -- Update cereri processed (last 30 days)
  UPDATE statistici_publice
  SET
    valoare = jsonb_build_object(
      'count', (SELECT COUNT(*) FROM cereri WHERE created_at >= NOW() - INTERVAL '30 days'),
      'avg_time_days', (
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (data_finalizare - created_at)) / 86400), 0)
        FROM cereri
        WHERE data_finalizare IS NOT NULL
          AND created_at >= NOW() - INTERVAL '30 days'
      ),
      'updated_at', NOW()
    ),
    calculat_la = NOW()
  WHERE tip_statistica = 'cereri_processed_month';

  IF NOT FOUND THEN
    INSERT INTO statistici_publice (tip_statistica, valoare)
    VALUES (
      'cereri_processed_month',
      jsonb_build_object(
        'count', (SELECT COUNT(*) FROM cereri WHERE created_at >= NOW() - INTERVAL '30 days'),
        'avg_time_days', 0,
        'updated_at', NOW()
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_public_stats IS 'Refresh public statistics cache (should be called hourly via cron)';

-- Initial population of statistici_publice
SELECT refresh_public_stats();

COMMIT;

-- =====================================================
-- Usage Examples (commented for reference)
-- =====================================================

-- Test registration number generation:
-- INSERT INTO cereri (primarie_id, tip_cerere_id, solicitant_id, date_formular)
-- VALUES (
--   'some-primarie-uuid',
--   'some-tip-cerere-uuid',
--   'some-user-uuid',
--   '{}'::jsonb
-- );
-- SELECT numar_inregistrare FROM cereri ORDER BY created_at DESC LIMIT 1;
-- Expected: AR-ZN-2025-00001

-- Test status transition validation:
-- UPDATE cereri SET status = 'finalizata' WHERE id = 'some-uuid';
-- UPDATE cereri SET status = 'depusa' WHERE id = 'same-uuid';
-- Expected: ERROR - Cannot change status of finalized cerere

-- Test stats refresh:
-- SELECT refresh_public_stats();
-- SELECT * FROM statistici_publice;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- DROP TRIGGER IF EXISTS validate_cerere_status ON cereri;
-- DROP TRIGGER IF EXISTS audit_utilizatori ON utilizatori;
-- DROP TRIGGER IF EXISTS audit_documente ON documente;
-- DROP TRIGGER IF EXISTS audit_cereri ON cereri;
-- DROP TRIGGER IF EXISTS update_plati_updated_at ON plati;
-- DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
-- DROP TRIGGER IF EXISTS update_tipuri_cereri_updated_at ON tipuri_cereri;
-- DROP TRIGGER IF EXISTS update_cereri_updated_at ON cereri;
-- DROP TRIGGER IF EXISTS update_utilizatori_updated_at ON utilizatori;
-- DROP TRIGGER IF EXISTS update_primarii_updated_at ON primarii;
-- DROP TRIGGER IF EXISTS set_numar_inregistrare ON cereri;
-- DROP FUNCTION IF EXISTS refresh_public_stats();
-- DROP FUNCTION IF EXISTS validate_cerere_status_transition();
-- DROP FUNCTION IF EXISTS log_audit();
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS generate_numar_inregistrare();
