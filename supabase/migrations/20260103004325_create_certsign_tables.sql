-- =====================================================
-- Mock certSIGN - Digital Signature Service Tables
-- =====================================================
-- Created: 2026-01-03
-- Purpose: Mock implementation for certSIGN digital signature service
-- Note: is_mock=TRUE indicates these are development signatures (NOT legally valid)

-- =====================================================
-- 1. Mock Certificates Table
-- =====================================================
-- Stores mock digital certificates for testing signature workflows
-- In production, this would be replaced by real certSIGN certificates

CREATE TABLE IF NOT EXISTS mock_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Certificate owner
  user_name TEXT NOT NULL,
  cnp TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,

  -- Certificate details
  certificate_serial TEXT UNIQUE NOT NULL,
  certificate_type TEXT DEFAULT 'qualified' CHECK (certificate_type IN ('qualified', 'advanced', 'simple')),
  issuer TEXT DEFAULT 'Mock CA Authority',

  -- Validity period
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '2 years',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'suspended')),

  -- Mock-specific fields
  is_mock BOOLEAN DEFAULT TRUE,
  mock_pin TEXT, -- For simulation purposes only (demo: "1234")

  -- Multi-tenancy (RLS)
  primarie_id TEXT, -- NULL for citizen certificates
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_mock_certificates_cnp ON mock_certificates(cnp);
CREATE INDEX idx_mock_certificates_serial ON mock_certificates(certificate_serial);
CREATE INDEX idx_mock_certificates_status ON mock_certificates(status);
CREATE INDEX idx_mock_certificates_user_id ON mock_certificates(user_id);
CREATE INDEX idx_mock_certificates_primarie_id ON mock_certificates(primarie_id);

-- Enable RLS
ALTER TABLE mock_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own certificates"
  ON mock_certificates FOR SELECT
  USING (auth.uid() = user_id OR primarie_id IS NULL);

CREATE POLICY "Service role can manage all certificates"
  ON mock_certificates FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 2. Signature Audit Log Table
-- =====================================================
-- Complete audit trail for ALL signature operations
-- Provides non-repudiation and compliance tracking

CREATE TABLE IF NOT EXISTS signature_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction details
  transaction_id TEXT UNIQUE NOT NULL,
  session_id TEXT, -- For batch operations (links to batch_signature_log)

  -- Cerere context
  cerere_id TEXT NOT NULL,
  primarie_id TEXT NOT NULL,

  -- Signer details
  signer_name TEXT NOT NULL,
  signer_cnp TEXT NOT NULL,
  certificate_serial TEXT NOT NULL,

  -- Document URLs
  document_url TEXT NOT NULL, -- Original unsigned document
  signed_document_url TEXT NOT NULL, -- Signed document in Storage

  -- Signature metadata
  timestamp TIMESTAMPTZ NOT NULL,
  algorithm TEXT DEFAULT 'SHA256withRSA',
  signature_reason TEXT, -- "Aprobare cerere", "Respingere cerere", etc.

  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'revoked')),
  error_message TEXT,

  -- Mock flag
  is_mock BOOLEAN DEFAULT TRUE,

  -- Audit metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for fast queries
CREATE INDEX idx_signature_audit_transaction_id ON signature_audit_log(transaction_id);
CREATE INDEX idx_signature_audit_cerere_id ON signature_audit_log(cerere_id);
CREATE INDEX idx_signature_audit_primarie_id ON signature_audit_log(primarie_id);
CREATE INDEX idx_signature_audit_signer_cnp ON signature_audit_log(signer_cnp);
CREATE INDEX idx_signature_audit_timestamp ON signature_audit_log(timestamp DESC);
CREATE INDEX idx_signature_audit_status ON signature_audit_log(status);

-- Enable RLS
ALTER TABLE signature_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view signatures for their primarie"
  ON signature_audit_log FOR SELECT
  USING (
    primarie_id IN (
      SELECT up.primarie_id
      FROM user_primarie_roles up
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all audit logs"
  ON signature_audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 3. Batch Signature Log Table
-- =====================================================
-- Track batch signature operations (Scenario 9: 13 docs in ~30s)
-- Provides performance metrics and bulk operation tracking

CREATE TABLE IF NOT EXISTS batch_signature_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Batch session
  session_id TEXT UNIQUE NOT NULL,
  primarie_id TEXT NOT NULL,

  -- Signer
  signer_name TEXT NOT NULL,
  signer_cnp TEXT NOT NULL,

  -- Batch summary
  total_documents INTEGER NOT NULL,
  succeeded_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL, -- Total time in milliseconds

  -- Context
  batch_reason TEXT, -- "Bulk approval", "Monthly batch", etc.
  is_mock BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for reporting
CREATE INDEX idx_batch_signature_session_id ON batch_signature_log(session_id);
CREATE INDEX idx_batch_signature_primarie_id ON batch_signature_log(primarie_id);
CREATE INDEX idx_batch_signature_created_at ON batch_signature_log(created_at DESC);
CREATE INDEX idx_batch_signature_signer_cnp ON batch_signature_log(signer_cnp);

-- Enable RLS
ALTER TABLE batch_signature_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view batch logs for their primarie"
  ON batch_signature_log FOR SELECT
  USING (
    primarie_id IN (
      SELECT up.primarie_id
      FROM user_primarie_roles up
      WHERE up.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all batch logs"
  ON batch_signature_log FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 4. Seed Mock Certificates
-- =====================================================
-- Pre-populate with test certificates for development

-- Primar Alexandru Popescu (Scenario 1, 2, 3)
INSERT INTO mock_certificates (user_name, cnp, email, certificate_serial, valid_from, valid_until, status, mock_pin)
VALUES (
  'Alexandru Popescu',
  '1700101123456',
  'primar.alexandru@beltiug.ro',
  'MOCK-CERT-PRIMAR-001-20250116-5A3B',
  '2024-01-01 00:00:00+02',
  '2026-01-01 00:00:00+02',
  'active',
  '1234' -- Mock PIN for demo
)
ON CONFLICT (cnp) DO NOTHING;

-- Primar Vasile Mureșan (Scenario 6 - Admin Tehnic)
INSERT INTO mock_certificates (user_name, cnp, email, certificate_serial, valid_from, valid_until, status, mock_pin)
VALUES (
  'Vasile Mureșan',
  '1680515234567',
  'primar.vasile@zimandu-nou.ro',
  'MOCK-CERT-PRIMAR-002-20240601-7C9D',
  '2024-06-01 00:00:00+03',
  '2026-06-01 00:00:00+03',
  'active',
  '5678'
)
ON CONFLICT (cnp) DO NOTHING;

-- Funcționar Maria Ionescu (backup signing authority)
INSERT INTO mock_certificates (user_name, cnp, email, certificate_serial, valid_from, valid_until, status, mock_pin)
VALUES (
  'Maria Ionescu',
  '2850312345678',
  'maria.ionescu@beltiug.ro',
  'MOCK-CERT-FUNC-001-20240301-2E8F',
  '2024-03-01 00:00:00+02',
  '2026-03-01 00:00:00+02',
  'active',
  '9999'
)
ON CONFLICT (cnp) DO NOTHING;

-- Expired certificate (testing error scenarios)
INSERT INTO mock_certificates (user_name, cnp, email, certificate_serial, valid_from, valid_until, status, mock_pin)
VALUES (
  'Test User Expired',
  '1900101111111',
  'expired@test.ro',
  'MOCK-CERT-EXPIRED-001-20230101-DEAD',
  '2023-01-01 00:00:00+02',
  '2024-01-01 00:00:00+02',
  'expired',
  '0000'
)
ON CONFLICT (cnp) DO NOTHING;

-- Revoked certificate (testing security scenarios)
INSERT INTO mock_certificates (user_name, cnp, email, certificate_serial, valid_from, valid_until, status, mock_pin)
VALUES (
  'Test User Revoked',
  '1900101222222',
  'revoked@test.ro',
  'MOCK-CERT-REVOKED-001-20240101-BEEF',
  '2024-01-01 00:00:00+02',
  '2026-01-01 00:00:00+02',
  'revoked',
  '1111'
)
ON CONFLICT (cnp) DO NOTHING;

-- =====================================================
-- 5. Functions for Automatic Timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for mock_certificates
CREATE TRIGGER update_mock_certificates_updated_at
  BEFORE UPDATE ON mock_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- End of Migration
-- =====================================================
