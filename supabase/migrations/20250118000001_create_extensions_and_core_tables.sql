-- Migration: 20250118000001_create_extensions_and_core_tables.sql
-- Description: Create extensions and all core tables for Primariata.work
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: None

BEGIN;

-- =====================================================
-- EXTENSIONS
-- =====================================================
-- Note: Supabase pre-installs extensions in 'extensions' schema
-- We reference them as extensions.uuid_generate_v4() or set search_path

-- Set search path to include extensions schema
SET search_path TO public, extensions;

-- =====================================================
-- CORE TABLES (in dependency order)
-- =====================================================

-- -----------------------------------------------------
-- 1. JUDETE (Counties) - No dependencies
-- -----------------------------------------------------
CREATE TABLE judete (
  id SERIAL PRIMARY KEY,
  cod VARCHAR(2) UNIQUE NOT NULL,              -- "AR", "AB", "TM", "B"
  nume VARCHAR(100) NOT NULL,                   -- "Arad", "Alba", "Timiș"
  nume_complet VARCHAR(150),                    -- "Județul Arad"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by county code
CREATE INDEX idx_judete_cod ON judete(cod);

COMMENT ON TABLE judete IS 'Romanian counties (județe) - 42 total including București';
COMMENT ON COLUMN judete.cod IS 'Official 2-letter county code (e.g., AR, TM, B)';

-- -----------------------------------------------------
-- 2. LOCALITATI (Municipalities) - Depends on: judete
-- -----------------------------------------------------
CREATE TABLE localitati (
  id SERIAL PRIMARY KEY,
  judet_id INT REFERENCES judete(id) ON DELETE RESTRICT,
  nume VARCHAR(200) NOT NULL,                   -- "Zimandu Nou", "București"
  slug VARCHAR(250) UNIQUE NOT NULL,            -- "zimandu-nou", "bucuresti"
  tip VARCHAR(50),                              -- "Comună", "Oraș", "Municipiu"
  cod_siruta VARCHAR(10),                       -- Official SIRUTA code
  populatie INT,                                -- Population count (optional)
  coordonate POINT,                             -- PostGIS (lng, lat) for map display
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_localitati_judet ON localitati(judet_id);
CREATE INDEX idx_localitati_slug ON localitati(slug);

COMMENT ON TABLE localitati IS 'Romanian localities (cities, towns, villages) - 13,851 total';
COMMENT ON COLUMN localitati.slug IS 'URL-safe identifier without diacritics (e.g., "zimandu-nou")';
COMMENT ON COLUMN localitati.coordonate IS 'PostGIS POINT(lng, lat) for geolocation features';

-- -----------------------------------------------------
-- 3. PRIMARII (City Halls - Tenants) - Depends on: localitati
-- -----------------------------------------------------
CREATE TABLE primarii (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  localitate_id INT UNIQUE REFERENCES localitati(id) ON DELETE RESTRICT,
  slug VARCHAR(250) UNIQUE NOT NULL,            -- "arad/zimandu-nou"
  nume_oficial VARCHAR(250) NOT NULL,           -- "Primăria Comunei Zimandu Nou"

  -- Contact Information
  email VARCHAR(255),
  telefon VARCHAR(50),
  adresa TEXT,
  program_lucru TEXT,                           -- "Luni-Vineri: 08:00-16:00"

  -- Configuration (module settings)
  config JSONB DEFAULT '{}'::jsonb,
  active_modules TEXT[] DEFAULT ARRAY['cereri', 'dashboard']::TEXT[],

  -- Branding
  logo_url TEXT,
  culoare_primara VARCHAR(7) DEFAULT '#ef4444',  -- Hex color for primary theme
  culoare_secundara VARCHAR(7) DEFAULT '#ffffff',

  -- Status
  activa BOOLEAN DEFAULT TRUE,
  setup_complet BOOLEAN DEFAULT FALSE,
  trial_end_at TIMESTAMPTZ,                     -- Optional trial period

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Indexes for queries (exclude soft-deleted)
CREATE INDEX idx_primarii_localitate ON primarii(localitate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_primarii_slug ON primarii(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_primarii_activa ON primarii(activa) WHERE deleted_at IS NULL;

COMMENT ON TABLE primarii IS 'Tenant table - each primărie is a separate tenant in multi-tenant architecture';
COMMENT ON COLUMN primarii.config IS 'JSONB config: max_file_size_mb, allowed_file_types, email_notifications, etc.';
COMMENT ON COLUMN primarii.active_modules IS 'Array of enabled module names: cereri, dashboard, plati, statistici';

-- -----------------------------------------------------
-- 4. UTILIZATORI (Users) - Depends on: primarii, localitati
-- -----------------------------------------------------
CREATE TABLE utilizatori (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Information
  email VARCHAR(255) UNIQUE NOT NULL,
  nume VARCHAR(100) NOT NULL,
  prenume VARCHAR(100) NOT NULL,
  telefon VARCHAR(20),
  cnp VARCHAR(13),                              -- Optional, should be encrypted

  -- Address
  adresa TEXT,
  localitate_id INT REFERENCES localitati(id),  -- Domiciliu/residence

  -- Role & Permissions
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('cetatean', 'functionar', 'admin', 'super_admin')),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,  -- NULL for cetățeni

  -- Permissions (for funcționari - JSONB array of permission strings)
  permisiuni JSONB DEFAULT '[]'::jsonb,         -- ["cereri.aprobare", "documente.generare"]
  departament VARCHAR(100),                     -- "Registratură", "Urbanism", "Financiar"

  -- Profile
  avatar_url TEXT,
  limba VARCHAR(5) DEFAULT 'ro',                -- "ro", "en"
  timezone VARCHAR(50) DEFAULT 'Europe/Bucharest',

  -- Settings
  notificari_email BOOLEAN DEFAULT TRUE,
  notificari_sms BOOLEAN DEFAULT FALSE,

  -- Status
  activ BOOLEAN DEFAULT TRUE,
  email_verificat BOOLEAN DEFAULT FALSE,
  telefon_verificat BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Indexes for common queries
CREATE INDEX idx_utilizatori_email ON utilizatori(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_utilizatori_primarie ON utilizatori(primarie_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_utilizatori_rol ON utilizatori(rol) WHERE deleted_at IS NULL;
CREATE INDEX idx_utilizatori_activ ON utilizatori(activ) WHERE deleted_at IS NULL;

COMMENT ON TABLE utilizatori IS 'Users table - includes cetățeni, funcționari, admins, super_admins';
COMMENT ON COLUMN utilizatori.permisiuni IS 'JSONB array of permission strings for funcționari/admins';

-- -----------------------------------------------------
-- 5. TIPURI_CERERI (Request Types) - Depends on: primarii
-- -----------------------------------------------------
CREATE TABLE tipuri_cereri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,

  -- Identification
  cod VARCHAR(50) NOT NULL,                     -- "ADV_DOMICILIU", "CERT_URBANISM"
  nume VARCHAR(250) NOT NULL,                   -- "Adeverință de domiciliu"
  descriere TEXT,

  -- Form Configuration (dynamic form field definitions)
  campuri_formular JSONB NOT NULL,
  documente_necesare TEXT[],                   -- ["Buletin", "Contract închiriere"]
  template_document_id UUID,                   -- FK to templates (nullable - we'll add constraint later)

  -- Processing
  termen_legal_zile INT,                       -- 30 zile
  necesita_taxa BOOLEAN DEFAULT FALSE,
  valoare_taxa DECIMAL(10, 2),                 -- RON
  necesita_aprobare BOOLEAN DEFAULT TRUE,
  departament_responsabil VARCHAR(100),

  -- Status
  activ BOOLEAN DEFAULT TRUE,
  ordine_afisare INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tipuri_cereri_primarie ON tipuri_cereri(primarie_id) WHERE activ = TRUE;
CREATE INDEX idx_tipuri_cereri_cod ON tipuri_cereri(primarie_id, cod);

COMMENT ON TABLE tipuri_cereri IS 'Request type definitions - each primărie can configure their own request types';
COMMENT ON COLUMN tipuri_cereri.campuri_formular IS 'JSONB dynamic form definition with field types, labels, validation rules';

-- -----------------------------------------------------
-- 6. CERERI (Requests) - Depends on: primarii, tipuri_cereri, utilizatori
-- -----------------------------------------------------
CREATE TABLE cereri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,
  tip_cerere_id UUID REFERENCES tipuri_cereri(id) ON DELETE RESTRICT,

  -- Ownership
  solicitant_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,
  preluat_de_id UUID REFERENCES utilizatori(id) ON DELETE SET NULL,  -- Funcționar assigned

  -- Identification (auto-generated via trigger)
  numar_inregistrare VARCHAR(50) UNIQUE NOT NULL,  -- "AR-ZN-2025-00123"

  -- Form Data
  date_formular JSONB NOT NULL,                -- User-submitted form data
  observatii_solicitant TEXT,

  -- Status (state machine)
  status VARCHAR(50) NOT NULL DEFAULT 'depusa' CHECK (
    status IN ('depusa', 'in_verificare', 'info_suplimentare', 'in_procesare',
               'aprobata', 'respinsa', 'anulata', 'finalizata')
  ),

  -- Response
  raspuns TEXT,                                -- Funcționar response message
  motiv_respingere TEXT,

  -- Payment
  necesita_plata BOOLEAN DEFAULT FALSE,
  valoare_plata DECIMAL(10, 2),
  plata_efectuata BOOLEAN DEFAULT FALSE,
  plata_efectuata_la TIMESTAMPTZ,

  -- Timeline
  data_termen TIMESTAMPTZ,                     -- Deadline
  data_finalizare TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_cereri_primarie ON cereri(primarie_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cereri_solicitant ON cereri(solicitant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cereri_preluat ON cereri(preluat_de_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cereri_status ON cereri(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_cereri_numar ON cereri(numar_inregistrare);
CREATE INDEX idx_cereri_created ON cereri(created_at DESC);

COMMENT ON TABLE cereri IS 'Citizen requests - main entity for request lifecycle tracking';
COMMENT ON COLUMN cereri.numar_inregistrare IS 'Auto-generated unique registration number (e.g., AR-ZN-2025-00123)';

-- -----------------------------------------------------
-- 7. DOCUMENTE (Documents) - Depends on: primarii, cereri, utilizatori
-- -----------------------------------------------------
CREATE TABLE documente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,

  -- Ownership
  incarcat_de_id UUID REFERENCES utilizatori(id) ON DELETE SET NULL,

  -- File Information
  nume_fisier VARCHAR(500) NOT NULL,
  tip_fisier VARCHAR(10) NOT NULL,             -- "pdf", "jpg", "png", "docx"
  marime_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,           -- Supabase Storage path

  -- Classification
  tip_document VARCHAR(100) NOT NULL,          -- "cerere", "atasament", "generat", "semnat"
  descriere TEXT,

  -- Generated Documents (from templates)
  este_generat BOOLEAN DEFAULT FALSE,
  template_folosit VARCHAR(250),

  -- Digital Signature (certSIGN integration)
  este_semnat BOOLEAN DEFAULT FALSE,
  semnat_de_id UUID REFERENCES utilizatori(id) ON DELETE SET NULL,
  semnat_la TIMESTAMPTZ,
  semnatura_certificat TEXT,                   -- certSIGN certificate data

  -- Metadata (extensible)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Indexes
CREATE INDEX idx_documente_primarie ON documente(primarie_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documente_cerere ON documente(cerere_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documente_tip ON documente(tip_document) WHERE deleted_at IS NULL;
CREATE INDEX idx_documente_semnat ON documente(este_semnat) WHERE deleted_at IS NULL;
CREATE INDEX idx_documente_storage ON documente(storage_path);

COMMENT ON TABLE documente IS 'Document storage metadata - files stored in Supabase Storage';
COMMENT ON COLUMN documente.storage_path IS 'Path in Supabase Storage bucket (e.g., "primarie-id/cerere-id/file.pdf")';

-- -----------------------------------------------------
-- 8. MESAJE (Messages/Chat) - Depends on: cereri, utilizatori
-- -----------------------------------------------------
CREATE TABLE mesaje (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,

  -- Ownership
  expeditor_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,
  destinatar_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,

  -- Message Content
  mesaj TEXT NOT NULL,
  atasamente UUID[],                           -- Array of document IDs

  -- Status
  citit BOOLEAN DEFAULT FALSE,
  citit_la TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft delete
);

-- Indexes
CREATE INDEX idx_mesaje_cerere ON mesaje(cerere_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_mesaje_expeditor ON mesaje(expeditor_id);
CREATE INDEX idx_mesaje_destinatar ON mesaje(destinatar_id);
CREATE INDEX idx_mesaje_citit ON mesaje(destinatar_id, citit) WHERE deleted_at IS NULL;
CREATE INDEX idx_mesaje_created ON mesaje(created_at DESC);

COMMENT ON TABLE mesaje IS 'Chat messages between cetățeni and funcționari within a cerere';
COMMENT ON COLUMN mesaje.atasamente IS 'Array of documente.id references for message attachments';

-- -----------------------------------------------------
-- 9. PLATI (Payments) - Depends on: primarii, cereri, utilizatori
-- -----------------------------------------------------
CREATE TABLE plati (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,
  cerere_id UUID REFERENCES cereri(id) ON DELETE CASCADE,
  utilizator_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,

  -- Amount
  valoare DECIMAL(10, 2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'RON',

  -- Payment Information
  tip_plata VARCHAR(50) NOT NULL,              -- "taxa_cerere", "amenda", "impozit"
  descriere TEXT,

  -- External Payment Gateway
  gateway VARCHAR(50),                         -- "ghiseul_ro", "stripe"
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'initiata' CHECK (
    status IN ('initiata', 'procesare', 'finalizata', 'esuata', 'anulata', 'rambursata')
  ),

  -- Timeline
  data_scadenta TIMESTAMPTZ,
  data_finalizare TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plati_primarie ON plati(primarie_id);
CREATE INDEX idx_plati_cerere ON plati(cerere_id);
CREATE INDEX idx_plati_utilizator ON plati(utilizator_id);
CREATE INDEX idx_plati_status ON plati(status);
CREATE INDEX idx_plati_gateway_tx ON plati(gateway_transaction_id);

COMMENT ON TABLE plati IS 'Payment tracking - integrates with external payment gateways';
COMMENT ON COLUMN plati.gateway_response IS 'JSONB response from payment gateway for debugging/reconciliation';

-- -----------------------------------------------------
-- 10. NOTIFICARI (Notifications) - Depends on: primarii, utilizatori
-- -----------------------------------------------------
CREATE TABLE notificari (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,
  utilizator_id UUID REFERENCES utilizatori(id) ON DELETE CASCADE,

  -- Content
  titlu VARCHAR(250) NOT NULL,
  mesaj TEXT NOT NULL,
  tip VARCHAR(50) NOT NULL,                    -- "cerere", "mesaj", "plata", "document"

  -- Link (to related entity)
  link_entitate_tip VARCHAR(50),               -- "cerere", "document", "plata"
  link_entitate_id UUID,                       -- ID of related entity

  -- Email Channel
  trimisa_email BOOLEAN DEFAULT FALSE,
  trimisa_email_la TIMESTAMPTZ,
  email_status VARCHAR(50),                    -- "trimis", "deschis", "esuat"

  -- SMS Channel
  trimisa_sms BOOLEAN DEFAULT FALSE,
  trimisa_sms_la TIMESTAMPTZ,
  sms_status VARCHAR(50),

  -- Status
  citita BOOLEAN DEFAULT FALSE,
  citita_la TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notificari_utilizator ON notificari(utilizator_id);
CREATE INDEX idx_notificari_citita ON notificari(utilizator_id, citita);
CREATE INDEX idx_notificari_created ON notificari(created_at DESC);

COMMENT ON TABLE notificari IS 'Multi-channel notifications (in-app, email, SMS)';
COMMENT ON COLUMN notificari.link_entitate_id IS 'Generic FK to any entity (not enforced by DB)';

-- -----------------------------------------------------
-- 11. AUDIT_LOG (Audit Trail) - Depends on: primarii, utilizatori
-- -----------------------------------------------------
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,

  -- Actor (who performed the action)
  utilizator_id UUID REFERENCES utilizatori(id) ON DELETE SET NULL,
  utilizator_nume VARCHAR(255),                -- Snapshot of user name
  utilizator_rol VARCHAR(50),

  -- Action
  actiune VARCHAR(100) NOT NULL,               -- "cerere.creare", "cerere.aprobare", "document.upload"
  entitate_tip VARCHAR(100) NOT NULL,          -- "cerere", "document", "utilizator"
  entitate_id UUID,

  -- Details (before/after values)
  detalii JSONB,
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_primarie ON audit_log(primarie_id);
CREATE INDEX idx_audit_utilizator ON audit_log(utilizator_id);
CREATE INDEX idx_audit_entitate ON audit_log(entitate_tip, entitate_id);
CREATE INDEX idx_audit_actiune ON audit_log(actiune);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for all sensitive operations';
COMMENT ON COLUMN audit_log.detalii IS 'JSONB with old/new values: {"old": {...}, "new": {...}}';

-- -----------------------------------------------------
-- 12. TEMPLATES (Document Templates) - Depends on: primarii
-- -----------------------------------------------------
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primarie_id UUID REFERENCES primarii(id) ON DELETE CASCADE,

  -- Identification
  cod VARCHAR(50) NOT NULL,                    -- "ADV_DOMICILIU", "CERT_URBANISM"
  nume VARCHAR(250) NOT NULL,
  descriere TEXT,

  -- Template Content
  continut TEXT NOT NULL,                      -- HTML with {{placeholders}}
  variabile TEXT[],                            -- ["nume", "cnp", "adresa", "data"]

  -- Configuration
  tip_output VARCHAR(10) DEFAULT 'pdf',        -- "pdf", "docx"

  -- Status
  activ BOOLEAN DEFAULT TRUE,
  versiune INT DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_primarie ON templates(primarie_id) WHERE activ = TRUE;
CREATE INDEX idx_templates_cod ON templates(primarie_id, cod);

COMMENT ON TABLE templates IS 'Document generation templates with variable substitution';
COMMENT ON COLUMN templates.continut IS 'HTML template with {{variable}} placeholders for substitution';

-- -----------------------------------------------------
-- 13. STATISTICI_PUBLICE (Public Stats Cache) - No dependencies
-- -----------------------------------------------------
CREATE TABLE statistici_publice (
  id SERIAL PRIMARY KEY,
  tip_statistica VARCHAR(100) NOT NULL UNIQUE,
  valoare JSONB NOT NULL,
  calculat_la TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure stats are recent (max 2 hours old)
  CONSTRAINT valid_recent_stats
    CHECK (calculat_la > NOW() - INTERVAL '2 hours')
);

-- Index for fast lookup
CREATE INDEX idx_statistici_publice_tip ON statistici_publice(tip_statistica);

COMMENT ON TABLE statistici_publice IS 'Cached statistics for landing page performance (refreshed hourly)';
COMMENT ON COLUMN statistici_publice.valoare IS 'JSONB with stat data: {"count": 13851, "updated_at": "..."}';

COMMIT;

-- =====================================================
-- Rollback Commands (commented for reference)
-- =====================================================
-- DROP TABLE IF EXISTS statistici_publice CASCADE;
-- DROP TABLE IF EXISTS templates CASCADE;
-- DROP TABLE IF EXISTS audit_log CASCADE;
-- DROP TABLE IF EXISTS notificari CASCADE;
-- DROP TABLE IF EXISTS plati CASCADE;
-- DROP TABLE IF EXISTS mesaje CASCADE;
-- DROP TABLE IF EXISTS documente CASCADE;
-- DROP TABLE IF EXISTS cereri CASCADE;
-- DROP TABLE IF EXISTS tipuri_cereri CASCADE;
-- DROP TABLE IF EXISTS utilizatori CASCADE;
-- DROP TABLE IF EXISTS primarii CASCADE;
-- DROP TABLE IF EXISTS localitati CASCADE;
-- DROP TABLE IF EXISTS judete CASCADE;
-- DROP EXTENSION IF EXISTS postgis;
-- DROP EXTENSION IF EXISTS pg_trgm;
-- DROP EXTENSION IF EXISTS pgcrypto;
-- DROP EXTENSION IF EXISTS "uuid-ossp";
