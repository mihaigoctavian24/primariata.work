-- Migration: 20260102224520_create_plati_chitante.sql
-- Description: Create plati and chitante tables for M3 Payments Module
-- Phase 1 of M3: Database Schema pentru Plăți
-- Reference: docs/M3_IMPLEMENTATION_PLAN.md

BEGIN;

-- ============================================================================
-- TABLE: plati (Payments)
-- ============================================================================
-- Tracks all payment transactions for cereri requiring fees
-- Multi-tenancy: Isolated by primarie_id via RLS (consistent with cereri table)
-- External integration: Ghișeul.ro (production) / Mock (development)

CREATE TABLE IF NOT EXISTS plati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  primarie_id UUID REFERENCES primarii(id) ON DELETE RESTRICT NOT NULL,
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,
  utilizator_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,

  -- Payment Amount
  suma DECIMAL(10, 2) NOT NULL CHECK (suma > 0),

  -- Status Machine
  -- pending: Payment initiated, awaiting user action
  -- processing: Payment in progress (user at gateway)
  -- success: Payment confirmed by gateway
  -- failed: Payment rejected or error occurred
  -- refunded: Payment reversed (admin action)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'success', 'failed', 'refunded')
  ),

  -- Payment Method
  -- card: Credit/debit card
  -- bank_transfer: Bank transfer
  -- cash: Cash payment at city hall
  metoda_plata TEXT CHECK (
    metoda_plata IS NULL OR metoda_plata IN ('card', 'bank_transfer', 'cash')
  ),

  -- External Gateway Integration
  transaction_id TEXT UNIQUE,              -- Gateway transaction ID (Ghișeul.ro)
  gateway_response JSONB,                  -- Full response from payment gateway

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT plati_valid_references CHECK (
    primarie_id IS NOT NULL AND
    cerere_id IS NOT NULL AND
    utilizator_id IS NOT NULL
  )
);

-- Indexes for Performance
CREATE INDEX idx_plati_primarie ON plati(primarie_id);
CREATE INDEX idx_plati_cerere ON plati(cerere_id) WHERE status != 'refunded';
CREATE INDEX idx_plati_utilizator ON plati(utilizator_id);
CREATE INDEX idx_plati_status ON plati(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_plati_transaction ON plati(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_plati_created ON plati(created_at DESC);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_plati_updated_at
  BEFORE UPDATE ON plati
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: chitante (Receipts)
-- ============================================================================
-- Stores payment receipts (PDF) generated after successful payments
-- One-to-one relationship with successful plati records

CREATE TABLE IF NOT EXISTS chitante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  plata_id UUID REFERENCES plati(id) ON DELETE CASCADE NOT NULL,

  -- Receipt Identification
  numar_chitanta TEXT UNIQUE NOT NULL,     -- Format: CH-2025-00123

  -- PDF Storage
  pdf_url TEXT NOT NULL,                   -- Supabase Storage path

  -- Metadata
  data_emitere TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT chitante_unique_plata UNIQUE (plata_id)
);

-- Indexes for Performance
CREATE INDEX idx_chitante_plata ON chitante(plata_id);
CREATE INDEX idx_chitante_numar ON chitante(numar_chitanta);
CREATE INDEX idx_chitante_created ON chitante(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on both tables
ALTER TABLE plati ENABLE ROW LEVEL SECURITY;
ALTER TABLE chitante ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: plati
-- ============================================================================

-- Policy 1: Cetățeni can see their own payments
CREATE POLICY plati_own_user ON plati
  FOR SELECT
  USING (utilizator_id = auth.uid());

-- Policy 2: Cetățeni can create payments for their own cereri
CREATE POLICY plati_create_own ON plati
  FOR INSERT
  WITH CHECK (
    utilizator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cereri
      WHERE cereri.id = plati.cerere_id
        AND cereri.solicitant_id = auth.uid()
    )
  );

-- Policy 3: Funcționari can see all payments in their primarie
CREATE POLICY plati_functionar_view ON plati
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM utilizatori
      WHERE utilizatori.id = auth.uid()
        AND utilizatori.rol IN ('functionar', 'admin')
        AND utilizatori.primarie_id = plati.primarie_id
    )
  );

-- Policy 4: Only system can update payment status (via service role)
-- Users cannot modify payments after creation
CREATE POLICY plati_no_user_update ON plati
  FOR UPDATE
  USING (false);

-- ============================================================================
-- RLS POLICIES: chitante
-- ============================================================================

-- Policy 1: Users can see their own chitante
CREATE POLICY chitante_own_user ON chitante
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plati
      WHERE plati.id = chitante.plata_id
        AND plati.utilizator_id = auth.uid()
    )
  );

-- Policy 2: Funcționari can see chitante in their primarie
CREATE POLICY chitante_functionar_view ON chitante
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plati
      JOIN utilizatori ON utilizatori.id = auth.uid()
      WHERE plati.id = chitante.plata_id
        AND utilizatori.rol IN ('functionar', 'admin')
        AND utilizatori.primarie_id = plati.primarie_id
    )
  );

-- Policy 3: Only system can create/update chitante (via service role)
CREATE POLICY chitante_system_only ON chitante
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- FUNCTIONS: Auto-generate numar_chitanta
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_numar_chitanta()
RETURNS TRIGGER AS $$
DECLARE
  an INT;
  count INT;
  numar TEXT;
BEGIN
  -- Get year
  an := EXTRACT(YEAR FROM NOW());

  -- Get sequential count for this year
  SELECT COUNT(*) + 1 INTO count
  FROM chitante
  WHERE EXTRACT(YEAR FROM created_at) = an;

  -- Format: CH-2025-00123
  numar := 'CH-' || an || '-' || LPAD(count::TEXT, 5, '0');

  NEW.numar_chitanta := numar;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate numar_chitanta on insert
CREATE TRIGGER set_numar_chitanta
  BEFORE INSERT ON chitante
  FOR EACH ROW
  WHEN (NEW.numar_chitanta IS NULL)
  EXECUTE FUNCTION generate_numar_chitanta();

-- ============================================================================
-- AUDIT: Log payment status changes
-- ============================================================================

CREATE OR REPLACE FUNCTION log_plata_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_log (
      primarie_id,
      utilizator_id,
      utilizator_nume,
      utilizator_rol,
      actiune,
      entitate_tip,
      entitate_id,
      detalii
    )
    SELECT
      NEW.primarie_id,
      u.id,
      u.nume || ' ' || u.prenume,
      u.rol,
      'plata.status_change',
      'plata',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'suma', NEW.suma,
        'transaction_id', NEW.transaction_id
      )
    FROM utilizatori u
    WHERE u.id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Log status changes
CREATE TRIGGER audit_plata_status
  AFTER UPDATE ON plati
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_plata_status_change();

-- ============================================================================
-- VALIDATION: Ensure cerere requires payment
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_plata_cerere()
RETURNS TRIGGER AS $$
DECLARE
  cerere_needs_payment BOOLEAN;
  cerere_amount DECIMAL;
BEGIN
  -- Check if cerere requires payment
  SELECT necesita_plata, valoare_plata INTO cerere_needs_payment, cerere_amount
  FROM cereri
  WHERE id = NEW.cerere_id;

  IF NOT cerere_needs_payment THEN
    RAISE EXCEPTION 'Cererea % nu necesită plată', NEW.cerere_id;
  END IF;

  IF NEW.suma != cerere_amount THEN
    RAISE EXCEPTION 'Suma plății (%) nu corespunde cu valoarea cererii (%)',
      NEW.suma, cerere_amount;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validate cerere payment requirement
CREATE TRIGGER validate_plata_cerere_trigger
  BEFORE INSERT ON plati
  FOR EACH ROW
  EXECUTE FUNCTION validate_plata_cerere();

-- ============================================================================
-- COMMENTS: Documentation
-- ============================================================================

COMMENT ON TABLE plati IS 'Payment transactions for cereri requiring fees. Multi-tenant via RLS.';
COMMENT ON COLUMN plati.suma IS 'Payment amount in RON';
COMMENT ON COLUMN plati.status IS 'Payment status: pending -> processing -> success/failed';
COMMENT ON COLUMN plati.transaction_id IS 'External payment gateway transaction ID';
COMMENT ON COLUMN plati.gateway_response IS 'Full JSON response from payment gateway';

COMMENT ON TABLE chitante IS 'Payment receipts (PDF) generated after successful payments';
COMMENT ON COLUMN chitante.numar_chitanta IS 'Unique receipt number (format: CH-YYYY-NNNNN)';
COMMENT ON COLUMN chitante.pdf_url IS 'Supabase Storage path to receipt PDF';

COMMIT;

-- Rollback instructions (if needed):
-- DROP TRIGGER IF EXISTS validate_plata_cerere_trigger ON plati;
-- DROP FUNCTION IF EXISTS validate_plata_cerere();
-- DROP TRIGGER IF EXISTS audit_plata_status ON plati;
-- DROP FUNCTION IF EXISTS log_plata_status_change();
-- DROP TRIGGER IF EXISTS set_numar_chitanta ON chitante;
-- DROP FUNCTION IF EXISTS generate_numar_chitanta();
-- DROP TABLE IF EXISTS chitante CASCADE;
-- DROP TABLE IF EXISTS plati CASCADE;
