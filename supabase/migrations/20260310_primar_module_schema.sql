-- Migration: Primar Module Schema
-- Phase 23 Plan 01 — Foundation: DB tables, cereri extension, mandat columns
-- Created: 2026-03-10

-- ============================================================
-- 1. departamente table
-- ============================================================
CREATE TABLE IF NOT EXISTS departamente (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primarie_id UUID NOT NULL REFERENCES primarii(id) ON DELETE CASCADE,
  nume        TEXT NOT NULL,
  sef         TEXT,
  nr_functionari INTEGER DEFAULT 0,
  buget_alocat   NUMERIC(15,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE departamente ENABLE ROW LEVEL SECURITY;

-- Staff can view departamente for their primarie
CREATE POLICY "Staff can view departamente"
  ON departamente FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = departamente.primarie_id
        AND up.status = 'approved'
    )
  );

-- Primar can manage departamente for their primarie
CREATE POLICY "Primar can manage departamente"
  ON departamente FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = departamente.primarie_id
        AND up.status = 'approved'
        AND up.rol = 'primar'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = departamente.primarie_id
        AND up.status = 'approved'
        AND up.rol = 'primar'
    )
  );

-- ============================================================
-- 2. proiecte_municipale table
-- ============================================================
CREATE TABLE IF NOT EXISTS proiecte_municipale (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primarie_id      UUID NOT NULL REFERENCES primarii(id) ON DELETE CASCADE,
  nume             TEXT NOT NULL,
  categorie        TEXT,
  status           TEXT DEFAULT 'planificat'
                     CHECK (status IN ('in_derulare', 'planificat', 'finalizat', 'intarziat')),
  progres_pct      INTEGER DEFAULT 0
                     CHECK (progres_pct >= 0 AND progres_pct <= 100),
  buget            NUMERIC(15,2) DEFAULT 0,
  buget_consumat   NUMERIC(15,2) DEFAULT 0,
  deadline         DATE,
  responsabil      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE proiecte_municipale ENABLE ROW LEVEL SECURITY;

-- Staff can view proiecte_municipale for their primarie
CREATE POLICY "Staff can view proiecte_municipale"
  ON proiecte_municipale FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = proiecte_municipale.primarie_id
        AND up.status = 'approved'
    )
  );

-- Primar can manage proiecte_municipale for their primarie
CREATE POLICY "Primar can manage proiecte_municipale"
  ON proiecte_municipale FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = proiecte_municipale.primarie_id
        AND up.status = 'approved'
        AND up.rol = 'primar'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_primarii up
      WHERE up.user_id = auth.uid()
        AND up.primarie_id = proiecte_municipale.primarie_id
        AND up.status = 'approved'
        AND up.rol = 'primar'
    )
  );

-- ============================================================
-- 3. agende_primar table
-- ============================================================
CREATE TABLE IF NOT EXISTS agende_primar (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primarie_id      UUID NOT NULL REFERENCES primarii(id) ON DELETE CASCADE,
  primar_id        UUID NOT NULL REFERENCES auth.users(id),
  titlu            TEXT NOT NULL,
  data_eveniment   DATE NOT NULL,
  ora_start        TIME,
  ora_sfarsit      TIME,
  tip              TEXT DEFAULT 'eveniment'
                     CHECK (tip IN ('sedinta', 'audienta', 'eveniment', 'termen')),
  descriere        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agende_primar ENABLE ROW LEVEL SECURITY;

-- Primar can view their own agenda
CREATE POLICY "Primar can view own agenda"
  ON agende_primar FOR SELECT
  USING (primar_id = auth.uid());

-- Primar can insert their own agenda entries
CREATE POLICY "Primar can insert own agenda"
  ON agende_primar FOR INSERT
  WITH CHECK (primar_id = auth.uid());

-- Primar can update their own agenda entries
CREATE POLICY "Primar can update own agenda"
  ON agende_primar FOR UPDATE
  USING (primar_id = auth.uid())
  WITH CHECK (primar_id = auth.uid());

-- Primar can delete their own agenda entries
CREATE POLICY "Primar can delete own agenda"
  ON agende_primar FOR DELETE
  USING (primar_id = auth.uid());

-- ============================================================
-- 4. Extend cereri table: add note_primar JSONB column
-- ============================================================
ALTER TABLE cereri
  ADD COLUMN IF NOT EXISTS note_primar JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN cereri.note_primar IS 'Primar notes array: [{text, timestamp, actor}]';

-- ============================================================
-- 5. Extend user_primarii table: add mandat columns
-- ============================================================
ALTER TABLE user_primarii
  ADD COLUMN IF NOT EXISTS mandat_start DATE;

ALTER TABLE user_primarii
  ADD COLUMN IF NOT EXISTS mandat_sfarsit DATE;

COMMENT ON COLUMN user_primarii.mandat_start IS 'Primar mandate start date';
COMMENT ON COLUMN user_primarii.mandat_sfarsit IS 'Primar mandate end date';
