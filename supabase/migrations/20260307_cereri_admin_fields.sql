-- Phase 19 Wave 0: Add admin supervision fields to cereri table
ALTER TABLE cereri
  ADD COLUMN IF NOT EXISTS prioritate TEXT
    CHECK (prioritate IN ('urgenta', 'ridicata', 'medie', 'scazuta')),
  ADD COLUMN IF NOT EXISTS note_admin JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS escaladata BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN cereri.prioritate IS 'Admin priority: urgenta/ridicata/medie/scazuta';
COMMENT ON COLUMN cereri.note_admin IS 'Admin notes array: [{text, timestamp, actor}]';
COMMENT ON COLUMN cereri.escaladata IS 'Whether cerere is escalated to higher authority';
