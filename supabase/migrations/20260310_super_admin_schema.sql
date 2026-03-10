-- Phase 22: Super Admin Module — schema extensions
-- Adds columns required for primarii management, admin profiles, and audit log

-- ─── 1. primarii: status, tier, uptime, satisfaction_score, avg_response_time ───

ALTER TABLE primarii
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('active', 'inactive', 'suspended'))
    DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS tier TEXT
    CHECK (tier IN ('Premium', 'Standard', 'Basic'))
    DEFAULT 'Basic',
  ADD COLUMN IF NOT EXISTS uptime NUMERIC(5, 2)
    CHECK (uptime >= 0 AND uptime <= 100)
    DEFAULT 99.9,
  ADD COLUMN IF NOT EXISTS satisfaction_score NUMERIC(3, 2)
    CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
  ADD COLUMN IF NOT EXISTS avg_response_time TEXT;

-- Populate status from existing activa boolean
UPDATE primarii
SET status = CASE
  WHEN activa IS TRUE THEN 'active'
  ELSE 'inactive'
END
WHERE status IS NULL;

-- Keep activa → status in sync (one-directional: activa toggle updates status for active/inactive)
-- Suspended state must be set directly on status column
CREATE OR REPLACE FUNCTION sync_primarii_status_from_activa()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activa IS DISTINCT FROM OLD.activa THEN
    -- Only sync if not suspended (suspended can only be cleared explicitly)
    IF NEW.activa IS TRUE THEN
      NEW.status := 'active';
    ELSIF OLD.status != 'suspended' THEN
      NEW.status := 'inactive';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS primarii_activa_to_status ON primarii;
CREATE TRIGGER primarii_activa_to_status
  BEFORE UPDATE ON primarii
  FOR EACH ROW
  EXECUTE FUNCTION sync_primarii_status_from_activa();

COMMENT ON COLUMN primarii.status IS 'Operational status: active | inactive | suspended. Synced from activa for active↔inactive transitions; suspended must be set directly.';
COMMENT ON COLUMN primarii.tier IS 'Subscription tier: Premium | Standard | Basic';
COMMENT ON COLUMN primarii.uptime IS 'Platform uptime percentage (0-100), updated by monitoring agent';
COMMENT ON COLUMN primarii.satisfaction_score IS 'Citizen satisfaction score (0-5), aggregated from feedback submissions';
COMMENT ON COLUMN primarii.avg_response_time IS 'Average cerere response time, human-readable (ex: "2.4 zile")';

-- ─── 2. utilizatori: two_fa_enabled ───────────────────────────────────────────

ALTER TABLE utilizatori
  ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN utilizatori.two_fa_enabled IS 'Whether the user has TOTP two-factor authentication enabled';

-- ─── 3. audit_log: cast ip_address inet → text ────────────────────────────────
-- inet maps to `unknown` in Supabase TS generator; text maps to `string | null`

ALTER TABLE audit_log
  ALTER COLUMN ip_address TYPE TEXT USING ip_address::text;

COMMENT ON COLUMN audit_log.ip_address IS 'Client IP address stored as text for TypeScript type safety (was inet)';
