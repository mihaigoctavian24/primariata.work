BEGIN;

-- Add denormalized columns to chitante for direct receipt queries
-- (generateAndStoreReceipt already inserts these but columns don't exist yet)
ALTER TABLE chitante
  ADD COLUMN IF NOT EXISTS suma DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS primarie_id UUID REFERENCES primarii(id),
  ADD COLUMN IF NOT EXISTS utilizator_id UUID REFERENCES utilizatori(id),
  ADD COLUMN IF NOT EXISTS cerere_id UUID REFERENCES cereri(id);

-- Add GDPR columns to utilizatori
ALTER TABLE utilizatori
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'pending_deletion', 'deleted'));

-- Partial index for admin cleanup queries (only non-active rows)
CREATE INDEX IF NOT EXISTS idx_utilizatori_status ON utilizatori(status)
  WHERE status != 'active';

COMMENT ON COLUMN utilizatori.deletion_requested_at IS 'GDPR: When user requested account deletion (30-day grace period)';
COMMENT ON COLUMN utilizatori.status IS 'Account status: active, pending_deletion (grace period), deleted';

COMMIT;
