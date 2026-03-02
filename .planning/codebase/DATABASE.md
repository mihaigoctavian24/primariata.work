# primariata.work - Database Schema & Architecture

**Last Updated**: March 2, 2026
**Database**: PostgreSQL 17
**Project**: ihwfqsongyaahdtypgnh (Supabase EU-North-1)

## Table of Contents

1. [Core Tables](#core-tables)
2. [Authentication & Authorization](#authentication--authorization)
3. [Geographic Data](#geographic-data)
4. [Digital Services (Cereri)](#digital-services-cereri)
5. [Documents & Storage](#documents--storage)
6. [Payments (Plati)](#payments-plati)
7. [Digital Signatures](#digital-signatures)
8. [Notifications & Communication](#notifications--communication)
9. [Survey & Research](#survey--research)
10. [Audit & Analytics](#audit--analytics)
11. [Row Level Security (RLS)](#row-level-security-rls)
12. [Database Functions](#database-functions)
13. [Triggers](#triggers)
14. [Indexes](#indexes)
15. [Storage Buckets](#storage-buckets)
16. [Migrations & Version History](#migrations--version-history)
17. [Edge Functions](#edge-functions)
18. [Current Data State](#current-data-state)
19. [Security Advisors & Issues](#security-advisors--issues)

---

## Core Tables

### utilizatori (Users)

**Purpose**: Central user management for all actors in the system (citizens, staff, admins)

| Column           | Type         | Nullable | Default            | Notes                                          |
| ---------------- | ------------ | -------- | ------------------ | ---------------------------------------------- |
| id               | uuid         | NO       | auth.uid()         | Primary key, linked to auth.users              |
| email            | varchar(255) | NO       |                    | Unique, indexed                                |
| nume             | varchar(100) | YES      |                    | Last name                                      |
| prenume          | varchar(100) | YES      |                    | First name                                     |
| rol              | varchar(50)  | NO       | 'cetatean'         | Enum: cetatean, functionar, admin, super_admin |
| primarie_id      | uuid         | YES      |                    | FK to primarii (NULL for citizens)             |
| localitate_id    | integer      | YES      |                    | FK to localitati (populated from primarie)     |
| departament      | varchar(200) | YES      |                    | Department/office name                         |
| permisiuni       | jsonb        | YES      | {}                 | Role-based permissions JSON                    |
| activ            | boolean      | NO       | true               | Soft delete indicator                          |
| email_verificat  | boolean      | NO       | false              | Email confirmation status                      |
| notificari_email | boolean      | NO       | true               | Email notification preference                  |
| notificari_sms   | boolean      | NO       | false              | SMS notification preference                    |
| limba            | varchar(10)  | NO       | 'ro'               | Language preference                            |
| timezone         | varchar(50)  | NO       | 'Europe/Bucharest' | Timezone                                       |
| created_at       | timestamptz  | NO       | now()              | Account creation timestamp                     |
| updated_at       | timestamptz  | NO       | now()              | Last update timestamp                          |
| deleted_at       | timestamptz  | YES      |                    | Soft delete timestamp                          |

**Indexes**:

- PK: utilizatori_pkey (id)
- UNIQUE: utilizatori_email_key (email)
- idx_utilizatori_primarie (primarie_id) WHERE deleted_at IS NULL
- idx_utilizatori_rol (rol) WHERE deleted_at IS NULL
- idx_utilizatori_activ (activ) WHERE deleted_at IS NULL
- idx_utilizatori_email (email) WHERE deleted_at IS NULL
- idx_utilizatori_primarie_rol (primarie_id, rol, created_at DESC)
- idx_utilizatori_search (full text search on nume || prenume)

**Data Count**: 13 rows

**Key Functions**:

- `handle_new_user()` - Trigger on auth.users INSERT, creates utilizatori record with invitation handling
- Created via invitation system or direct registration as cetatean

---

### primarii (City Halls / Local Administrations)

**Purpose**: Represents each city hall that uses the platform

| Column            | Type         | Nullable | Default           | Notes                            |
| ----------------- | ------------ | -------- | ----------------- | -------------------------------- |
| id                | uuid         | NO       | gen_random_uuid() | Primary key                      |
| localitate_id     | integer      | NO       |                   | FK to localitati (UNIQUE)        |
| slug              | varchar(250) | NO       |                   | URL-friendly identifier (UNIQUE) |
| denumire          | varchar(255) | YES      |                   | Display name                     |
| descriere         | text         | YES      |                   | Description                      |
| logo_url          | varchar(500) | YES      |                   | Logo image URL                   |
| website           | varchar(500) | YES      |                   | Official website                 |
| email             | varchar(255) | YES      |                   | Contact email                    |
| telefon           | varchar(20)  | YES      |                   | Contact phone                    |
| activa            | boolean      | NO       | true              | Active status                    |
| configuratie      | jsonb        | YES      | {}                | Custom settings JSON             |
| data_inregistrare | timestamptz  | YES      |                   | Registration date                |
| created_at        | timestamptz  | NO       | now()             |                                  |
| updated_at        | timestamptz  | NO       | now()             |                                  |
| deleted_at        | timestamptz  | YES      |                   | Soft delete                      |

**Indexes**:

- PK: primarii_pkey (id)
- UNIQUE: primarii_slug_key (slug)
- UNIQUE: primarii_localitate_id_key (localitate_id)
- idx_primarii_slug (slug) WHERE deleted_at IS NULL
- idx_primarii_localitate (localitate_id) WHERE deleted_at IS NULL
- idx_primarii_activa (activa) WHERE deleted_at IS NULL

**Data Count**: 5 rows (demo/test primarii)

**RLS Policies**:

- `primarii_own`: Users can see primarii they're assigned to
- `primarii_public`: Everyone can see active primarii (for registration flow)
- `primarii_super_admin`: Super admins can manage all

---

## Authentication & Authorization

### user_invitations (Staff Invitations)

**Purpose**: Manage staff recruitment and onboarding flow

| Column      | Type         | Nullable | Default           | Notes                                                |
| ----------- | ------------ | -------- | ----------------- | ---------------------------------------------------- |
| id          | uuid         | NO       | gen_random_uuid() | Primary key                                          |
| primarie_id | uuid         | NO       |                   | FK to primarii (invitation scope)                    |
| token       | varchar(255) | NO       |                   | UNIQUE invitation token                              |
| email       | varchar(255) | NO       |                   | Invited email address                                |
| nume        | varchar(100) | NO       |                   | Last name                                            |
| prenume     | varchar(100) | NO       |                   | First name                                           |
| rol         | varchar(50)  | NO       |                   | Assigned role (functionar, admin, never super_admin) |
| departament | varchar(200) | YES      |                   | Department assignment                                |
| permisiuni  | jsonb        | YES      | {}                | Role-specific permissions                            |
| status      | varchar(20)  | NO       | 'pending'         | Enum: pending, accepted, expired, rejected           |
| invited_by  | uuid         | NO       |                   | FK to utilizatori (who invited)                      |
| accepted_by | uuid         | YES      |                   | FK to utilizatori (who accepted)                     |
| created_at  | timestamptz  | NO       | now()             |                                                      |
| updated_at  | timestamptz  | NO       | now()             |                                                      |
| accepted_at | timestamptz  | YES      |                   | Acceptance timestamp                                 |
| expires_at  | timestamptz  | NO       | now() + 7 days    | Token expiration (auto-calculated)                   |

**Indexes**:

- PK: user_invitations_pkey (id)
- UNIQUE: user_invitations_token_key (token)
- UNIQUE: idx_user_invitations_token (token) WHERE status = 'pending'
- idx_user_invitations_primarie_status (primarie_id, status)
- idx_user_invitations_email (email) WHERE status = 'pending'
- idx_user_invitations_expiration (expires_at) WHERE status = 'pending'

**Data Count**: 4 rows

**RLS Policies**:

- `Admins can create invitations for their primarie`: Restrict to admins of the primarie
- `Admins can view/update their primarie invitations`: Same primarie check
- `Public can view pending invitations by token`: Anyone can view with valid token

**Flow**:

1. Admin invites staff member via email/token
2. Staff receives invitation link
3. Staff signs up with invitation token
4. `handle_new_user()` automatically marks invitation as accepted
5. Staff account created with assigned role/permissions

---

## Geographic Data

### judete (Counties)

**Purpose**: Romanian administrative divisions (counties)

| Column     | Type         | Nullable | Default           | Notes                                |
| ---------- | ------------ | -------- | ----------------- | ------------------------------------ |
| id         | uuid         | NO       | gen_random_uuid() | Primary key                          |
| cod        | varchar(2)   | NO       |                   | UNIQUE county code (AB, B, BT, etc.) |
| nume       | varchar(100) | NO       |                   | County name                          |
| slug       | varchar(250) | NO       |                   | URL-friendly (UNIQUE)                |
| regiune    | varchar(100) | YES      |                   | Region name                          |
| created_at | timestamptz  | NO       | now()             |                                      |
| updated_at | timestamptz  | NO       | now()             |                                      |

**Indexes**:

- PK: judete_pkey (id)
- UNIQUE: judete_cod_key (cod)
- UNIQUE: judete_slug_unique (slug)
- idx_judete_cod (cod)

**Data Count**: 0 rows (reference data not loaded in dev/test environment)

**RLS Status**: ⚠️ **RLS DISABLED** - This is intentional (public reference data)

---

### localitati (Localities / Cities / Towns)

**Purpose**: All cities, towns, and villages in Romania

| Column      | Type         | Nullable | Default | Notes                                            |
| ----------- | ------------ | -------- | ------- | ------------------------------------------------ |
| id          | integer      | NO       |         | Primary key (3-digit or 4-digit code from SIRUL) |
| judet_id    | uuid         | NO       |         | FK to judete                                     |
| nume        | varchar(250) | NO       |         | Locality name                                    |
| slug        | varchar(250) | NO       |         | URL-friendly (UNIQUE)                            |
| clasificare | varchar(50)  | YES      |         | Classification (oras, comuna, sat, etc.)         |
| cod_sirul   | varchar(10)  | YES      |         | SIRUL code                                       |
| cod_postal  | varchar(6)   | YES      |         | Postal code                                      |
| created_at  | timestamptz  | NO       | now()   |                                                  |
| updated_at  | timestamptz  | NO       | now()   |                                                  |

**Indexes**:

- PK: localitati_pkey (id)
- UNIQUE: localitati_slug_key (slug)
- idx_localitati_judet (judet_id)
- idx_localitati_slug (slug)
- idx_localitati_search (full text search on nume)
- idx_localitati_nume_trgm (trigram search on nume)

**Data Count**: 0 rows

**RLS Status**: ⚠️ **RLS DISABLED** - Public reference data for location selection

---

## Digital Services (Cereri)

### cereri (Requests / Applications)

**Purpose**: Core feature - citizen requests to city halls

| Column                | Type          | Nullable | Default           | Notes                                                                                                  |
| --------------------- | ------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| id                    | uuid          | NO       | gen_random_uuid() | Primary key                                                                                            |
| primarie_id           | uuid          | YES      |                   | FK to primarii (NULL for drafts)                                                                       |
| solicitant_id         | uuid          | NO       |                   | FK to utilizatori (request creator)                                                                    |
| tip_cerere_id         | uuid          | YES      |                   | FK to tipuri_cereri (type)                                                                             |
| numar_inregistrare    | varchar(50)   | NO       |                   | UNIQUE sequential number (DRAFT-2025-00001 or AR-ZN-2025-00001)                                        |
| titlu                 | varchar(500)  | YES      |                   | Request title/subject                                                                                  |
| descriere             | text          | YES      |                   | Full description                                                                                       |
| raspuns               | text          | YES      |                   | Staff response                                                                                         |
| observatii_solicitant | text          | YES      |                   | Citizen notes                                                                                          |
| status                | varchar(30)   | NO       | 'draft'           | Enum: draft, depusa, in_verificare, in_asteptare, in_aprobare, aprobata, respinsa, finalizata, anulata |
| prioritate            | varchar(20)   | YES      | 'normala'         | Enum: joasa, normala, inalta                                                                           |
| necesita_plata        | boolean       | NO       | false             | Payment required flag                                                                                  |
| valoare_plata         | decimal(10,2) | YES      | 0                 | Payment amount                                                                                         |
| data_termenului       | date          | YES      |                   | Deadline date                                                                                          |
| data_finalizare       | timestamptz   | YES      |                   | Completion timestamp                                                                                   |
| progress_data         | jsonb         | YES      | {}                | Progress tracking JSON (percentage, current_step, last_activity)                                       |
| preluat_de_id         | uuid          | YES      |                   | FK to utilizatori (staff member handling)                                                              |
| atasamente_ciudadean  | jsonb         | YES      | []                | JSON array of attachment metadata                                                                      |
| created_at            | timestamptz   | NO       | now()             |                                                                                                        |
| updated_at            | timestamptz   | NO       | now()             |                                                                                                        |
| deleted_at            | timestamptz   | YES      |                   | Soft delete                                                                                            |

**Indexes**:

- PK: cereri_pkey (id)
- UNIQUE: cereri_numar_inregistrare_key (numar_inregistrare)
- idx_cereri_solicitant (solicitant_id) WHERE deleted_at IS NULL
- idx_cereri_primarie (primarie_id) WHERE deleted_at IS NULL
- idx_cereri_status (status) WHERE deleted_at IS NULL
- idx_cereri_numar (numar_inregistrare)
- idx_cereri_created (created_at DESC)
- idx_cereri_dashboard (primarie_id, status, created_at DESC) WHERE deleted_at IS NULL
- idx_cereri_preluat (preluat_de_id) WHERE deleted_at IS NULL
- idx_cereri_progress_percentage ((progress_data ->> 'percentage'))
- idx_cereri_stats (primarie_id, tip_cerere_id, status) WHERE deleted_at IS NULL
- idx_cereri_user_list (solicitant_id, created_at DESC) WHERE deleted_at IS NULL
- idx_cereri_search (full text search on raspuns || observatii_solicitant)

**Data Count**: 39 rows

**RLS Policies**:

- `cereri_own`: Citizens can see/edit their own requests
- `cereri_functionar`: Staff can manage requests for their primarie
- `cereri_no_modify_finalized`: Prevent modification of finalized requests (unless admin)

**Triggers**:

- `set_numar_inregistrare`: Auto-generate registration number on INSERT
- `trg_cerere_status_notification`: Create notification on status change
- `trigger_send_email_on_cerere_insert/update`: Send email notifications
- `validate_cerere_status`: Validate status transitions
- `audit_cereri`: Log all changes to audit_log
- `update_cereri_updated_at`: Auto-update timestamp

**Functions**:

- `generate_numar_inregistrare()`: Generates format DRAFT-YYYY-##### for drafts or JD-LL-YYYY-##### for submitted
- `notify_cerere_status_change()`: Creates in-app notification with title/message based on status
- `calculate_cerere_progress()`: Maps status to percentage (draft=0%, depusa=25%, aprobata=100%, etc.)

---

### tipuri_cereri (Request Types)

**Purpose**: Configurable request categories per city hall

| Column         | Type          | Nullable | Default           | Notes                    |
| -------------- | ------------- | -------- | ----------------- | ------------------------ |
| id             | uuid          | NO       | gen_random_uuid() | Primary key              |
| primarie_id    | uuid          | NO       |                   | FK to primarii           |
| cod            | varchar(50)   | NO       |                   | Request type code        |
| denumire       | varchar(255)  | NO       |                   | Display name             |
| descriere      | text          | YES      |                   | Description              |
| necesita_plata | boolean       | NO       | false             | Payment required         |
| valoare_plata  | decimal(10,2) | YES      | 0                 | Default payment amount   |
| termen_zile    | integer       | YES      | 30                | Default deadline in days |
| ordine_afisare | integer       | NO       | 0                 | Display order            |
| activ          | boolean       | NO       | true              | Active status            |
| created_at     | timestamptz   | NO       | now()             |                          |
| updated_at     | timestamptz   | NO       | now()             |                          |

**Indexes**:

- PK: tipuri_cereri_pkey (id)
- idx_tipuri_cereri_primarie (primarie_id) WHERE activ = true
- idx_tipuri_cereri_active (primarie_id, ordine_afisare) WHERE activ = true
- idx_tipuri_cereri_cod (primarie_id, cod)

**Data Count**: 5 rows

**RLS Policies**:

- `tipuri_cereri_functionar`: Staff can manage types for their primarie
- `tipuri_cereri_public`: Everyone can view active types (for form submission)

---

### templates (Response Templates)

**Purpose**: Reusable response/answer templates for staff

| Column      | Type         | Nullable | Default           | Notes                                       |
| ----------- | ------------ | -------- | ----------------- | ------------------------------------------- |
| id          | uuid         | NO       | gen_random_uuid() | Primary key                                 |
| primarie_id | uuid         | NO       |                   | FK to primarii                              |
| cod         | varchar(100) | NO       |                   | Template code/identifier                    |
| denumire    | varchar(255) | NO       |                   | Template name                               |
| continut    | text         | YES      |                   | Template content                            |
| variabile   | jsonb        | YES      | {}                | Available variable names (for substitution) |
| activ       | boolean      | NO       | true              | Active status                               |
| created_at  | timestamptz  | NO       | now()             |                                             |
| updated_at  | timestamptz  | NO       | now()             |                                             |

**Indexes**:

- PK: templates_pkey (id)
- idx_templates_primarie (primarie_id) WHERE activ = true
- idx_templates_cod (primarie_id, cod)

**Data Count**: 0 rows

**RLS Policies**:

- `templates_functionar`: Staff can manage templates for their primarie

---

## Documents & Storage

### documente (Document Records)

**Purpose**: Metadata for documents attached to requests (citizen uploads or staff documents)

| Column             | Type         | Nullable | Default           | Notes                                      |
| ------------------ | ------------ | -------- | ----------------- | ------------------------------------------ |
| id                 | uuid         | NO       | gen_random_uuid() | Primary key                                |
| cerere_id          | uuid         | NO       |                   | FK to cereri (document belongs to request) |
| primarie_id        | uuid         | YES      |                   | FK to primarii (populated from cerere)     |
| storage_path       | varchar(500) | NO       |                   | UNIQUE path in Supabase Storage            |
| nume_fisier        | varchar(255) | NO       |                   | Original filename                          |
| tip_document       | varchar(50)  | YES      |                   | Type (invoice, ID scan, proof, etc.)       |
| extensie           | varchar(10)  | YES      |                   | File extension (pdf, jpg, etc.)            |
| dimensiune_bytes   | bigint       | YES      |                   | File size in bytes                         |
| mime_type          | varchar(100) | YES      |                   | MIME type                                  |
| incarcat_de_id     | uuid         | NO       |                   | FK to utilizatori (uploader)               |
| este_semnat        | boolean      | NO       | false             | Digital signature status                   |
| semnatura_metadata | jsonb        | YES      |                   | Signature certificate metadata             |
| semnat_de_id       | uuid         | YES      |                   | FK to utilizatori (signer)                 |
| data_semnare       | timestamptz  | YES      |                   | Signature timestamp                        |
| verificat_de       | uuid         | YES      |                   | FK to utilizatori (verified by)            |
| data_verificare    | timestamptz  | YES      |                   | Verification timestamp                     |
| created_at         | timestamptz  | NO       | now()             |                                            |
| updated_at         | timestamptz  | NO       | now()             |                                            |
| deleted_at         | timestamptz  | YES      |                   | Soft delete                                |

**Indexes**:

- PK: documente_pkey (id)
- UNIQUE: documente_storage_path_key (storage_path)
- idx_documente_cerere (cerere_id) WHERE deleted_at IS NULL
- idx_documente_cerere_tip (cerere_id, tip_document, created_at DESC) WHERE deleted_at IS NULL
- idx_documente_primarie (primarie_id) WHERE deleted_at IS NULL
- idx_documente_tip (tip_document) WHERE deleted_at IS NULL
- idx_documente_semnat (este_semnat) WHERE deleted_at IS NULL
- idx_documente_storage (storage_path)

**Data Count**: 20 rows

**RLS Policies**:

- `documente_own_cerere`: Citizens can see/upload documents for their cereri
- `documente_functionar`: Staff can see documents for their primarie's cereri
- `documente_upload_own`: Citizens can only upload documents for their own cereri

---

## Payments (Plati)

### plati (Payments)

**Purpose**: Payment records for requests that require fees

| Column            | Type          | Nullable | Default           | Notes                                                  |
| ----------------- | ------------- | -------- | ----------------- | ------------------------------------------------------ |
| id                | uuid          | NO       | gen_random_uuid() | Primary key                                            |
| cerere_id         | uuid          | NO       |                   | FK to cereri                                           |
| utilizator_id     | uuid          | NO       |                   | FK to utilizatori (who paid)                           |
| primarie_id       | uuid          | NO       |                   | FK to primarii (payment destination)                   |
| suma              | decimal(10,2) | NO       |                   | Payment amount                                         |
| valuta            | varchar(3)    | NO       | 'RON'             | Currency                                               |
| status            | varchar(30)   | NO       | 'pending'         | Enum: pending, processing, completed, failed, refunded |
| metoda_plata      | varchar(50)   | YES      |                   | Payment method (card, bank_transfer, etc.)             |
| provider          | varchar(100)  | YES      |                   | Payment provider (stripe, wise, etc.)                  |
| transaction_id    | varchar(255)  | YES      |                   | UNIQUE provider transaction ID                         |
| reference_code    | varchar(100)  | YES      |                   | Payment reference code                                 |
| data_initiere     | timestamptz   | YES      |                   | Payment initiation timestamp                           |
| data_completare   | timestamptz   | YES      |                   | Completion timestamp                                   |
| mesaj_eroare      | text          | YES      |                   | Error message if failed                                |
| metadata_plata    | jsonb         | YES      | {}                | Provider response metadata                             |
| chitanta_generata | boolean       | NO       | false             | Receipt generation status                              |
| created_at        | timestamptz   | NO       | now()             |                                                        |
| updated_at        | timestamptz   | NO       | now()             |                                                        |

**Indexes**:

- PK: plati_pkey (id)
- UNIQUE: plati_transaction_id_key (transaction_id)
- idx_plati_utilizator (utilizator_id)
- idx_plati_primarie (primarie_id)
- idx_plati_cerere (cerere_id) WHERE status <> 'refunded'
- idx_plati_status (status) WHERE status IN ('pending', 'processing')
- idx_plati_transaction (transaction_id) WHERE transaction_id IS NOT NULL
- idx_plati_created (created_at DESC)

**Data Count**: 5 rows

**RLS Policies**:

- `plati_own_user`: Citizens can see their own payments
- `plati_functionar_view`: Staff can see payments for their primarie
- `plati_create_own`: Citizens can create payments for their own cereri
- `plati_no_user_update`: Users cannot update payment records (system only)

**Validation**:

- `validate_plata_cerere()`: Ensures cerere necessita_plata=true and suma matches

---

### chitante (Receipts/Invoices)

**Purpose**: Generated receipts for completed payments

| Column             | Type          | Nullable | Default           | Notes                                          |
| ------------------ | ------------- | -------- | ----------------- | ---------------------------------------------- |
| id                 | uuid          | NO       | gen_random_uuid() | Primary key                                    |
| plata_id           | uuid          | NO       |                   | FK to plati (UNIQUE - one receipt per payment) |
| numar_chitanta     | varchar(50)   | NO       |                   | UNIQUE sequential number (CH-2025-00001)       |
| data_emitere       | timestamptz   | NO       | now()             |                                                |
| suma_totala        | decimal(10,2) | NO       |                   | Total amount                                   |
| descriere          | text          | YES      |                   | Item description                               |
| perioada_facturare | varchar(50)   | YES      |                   | Billing period                                 |
| created_at         | timestamptz   | NO       | now()             |                                                |
| updated_at         | timestamptz   | NO       | now()             |                                                |

**Indexes**:

- PK: chitante_pkey (id)
- UNIQUE: chitante_unique_plata (plata_id)
- UNIQUE: chitante_numar_chitanta_key (numar_chitanta)
- idx_chitante_plata (plata_id)
- idx_chitante_numar (numar_chitanta)
- idx_chitante_created (created_at DESC)

**Data Count**: 3 rows

**RLS Policies**:

- `chitante_own_user`: Citizens can see receipts for their payments
- `chitante_functionar_view`: Staff can see receipts for their primarie
- `chitante_system_only`: All other access blocked (system managed)

**Trigger**:

- `set_numar_chitanta`: Auto-generate sequential receipt number

---

## Digital Signatures

### signature_audit_log (Signature Audit Trail)

**Purpose**: Complete audit trail for all digital signature operations

| Column                    | Type         | Nullable | Default           | Notes                                             |
| ------------------------- | ------------ | -------- | ----------------- | ------------------------------------------------- |
| id                        | uuid         | NO       | gen_random_uuid() | Primary key                                       |
| transaction_id            | varchar(255) | NO       |                   | UNIQUE signature session identifier               |
| cerere_id                 | uuid         | NO       |                   | FK to cereri                                      |
| primarie_id               | uuid         | NO       |                   | FK to primarii                                    |
| signer_cnp                | varchar(13)  | NO       |                   | Signer's personal ID number                       |
| signer_name               | varchar(255) | NO       |                   | Signer's full name                                |
| signer_certificate_serial | varchar(255) | YES      |                   | X.509 certificate serial                          |
| status                    | varchar(50)  | NO       |                   | Enum: initiated, pending, signed, failed, expired |
| signature_algorithm       | varchar(50)  | YES      |                   | Algorithm used (SHA256RSA, etc.)                  |
| certificate_issuer        | varchar(500) | YES      |                   | CA issuer                                         |
| timestamp                 | timestamptz  | NO       | now()             |                                                   |
| details                   | jsonb        | YES      | {}                | Additional metadata                               |

**Indexes**:

- PK: signature_audit_log_pkey (id)
- UNIQUE: signature_audit_log_transaction_id_key (transaction_id)
- idx_signature_audit_primarie_id (primarie_id)
- idx_signature_audit_cerere_id (cerere_id)
- idx_signature_audit_signer_cnp (signer_cnp)
- idx_signature_audit_status (status)
- idx_signature_audit_transaction_id (transaction_id)
- idx_signature_audit_timestamp (timestamp DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Service role can manage all batch logs`: System internal
- `Users can view signatures for their primarie`: Staff access

---

### batch_signature_log (Batch Signature Sessions)

**Purpose**: Track batch/concurrent digital signature sessions

| Column           | Type         | Nullable | Default           | Notes                                         |
| ---------------- | ------------ | -------- | ----------------- | --------------------------------------------- |
| id               | uuid         | NO       | gen_random_uuid() | Primary key                                   |
| session_id       | varchar(255) | NO       |                   | UNIQUE batch session identifier               |
| primarie_id      | uuid         | NO       |                   | FK to primarii                                |
| signer_cnp       | varchar(13)  | NO       |                   | Signer's ID number                            |
| documents_count  | integer      | NO       | 0                 | Number of documents in batch                  |
| documents_signed | integer      | NO       | 0                 | Number successfully signed                    |
| status           | varchar(50)  | NO       | 'pending'         | Enum: pending, in_progress, completed, failed |
| error_message    | text         | YES      |                   | Error details if failed                       |
| created_at       | timestamptz  | NO       | now()             |                                               |
| completed_at     | timestamptz  | YES      |                   | Completion timestamp                          |

**Indexes**:

- PK: batch_signature_log_pkey (id)
- UNIQUE: batch_signature_log_session_id_key (session_id)
- idx_batch_signature_primarie_id (primarie_id)
- idx_batch_signature_session_id (session_id)
- idx_batch_signature_signer_cnp (signer_cnp)
- idx_batch_signature_created_at (created_at DESC)

**Data Count**: 0 rows

---

### mock_certificates (Testing Digital Certificates)

**Purpose**: Development/testing use - mock X.509 certificates for signature testing

| Column             | Type         | Nullable | Default           | Notes                                |
| ------------------ | ------------ | -------- | ----------------- | ------------------------------------ |
| id                 | uuid         | NO       | gen_random_uuid() | Primary key                          |
| user_id            | uuid         | YES      |                   | FK to utilizatori (optional binding) |
| primarie_id        | uuid         | YES      |                   | FK to primarii (optional binding)    |
| cnp                | varchar(13)  | NO       |                   | UNIQUE Personal ID number            |
| full_name          | varchar(255) | NO       |                   | Certificate name                     |
| certificate_serial | varchar(255) | NO       |                   | UNIQUE certificate serial number     |
| certificate_pem    | text         | NO       |                   | PEM-encoded certificate              |
| private_key_pem    | text         | NO       |                   | PEM-encoded private key (encrypted)  |
| issuer_cn          | varchar(255) | YES      |                   | Issuer common name                   |
| valid_from         | timestamptz  | NO       |                   | Certificate validity start           |
| valid_until        | timestamptz  | NO       |                   | Certificate expiration               |
| status             | varchar(50)  | NO       | 'active'          | Enum: active, revoked, expired       |
| created_at         | timestamptz  | NO       | now()             |                                      |
| updated_at         | timestamptz  | NO       | now()             |                                      |

**Indexes**:

- PK: mock_certificates_pkey (id)
- UNIQUE: mock_certificates_cnp_key (cnp)
- UNIQUE: mock_certificates_certificate_serial_key (certificate_serial)
- idx_mock_certificates_user_id (user_id)
- idx_mock_certificates_primarie_id (primarie_id)
- idx_mock_certificates_cnp (cnp)
- idx_mock_certificates_serial (certificate_serial)
- idx_mock_certificates_status (status)

**Data Count**: 5 rows

**RLS Policies**:

- `Service role can manage all certificates`: System internal
- `Users can view their own certificates`: User-scoped access

---

## Notifications & Communication

### notifications (In-App Notifications - New)

**Purpose**: Real-time in-app notifications for users (newer implementation)

| Column        | Type         | Nullable | Default           | Notes                                         |
| ------------- | ------------ | -------- | ----------------- | --------------------------------------------- |
| id            | uuid         | NO       | gen_random_uuid() | Primary key                                   |
| utilizator_id | uuid         | NO       |                   | FK to utilizatori                             |
| primarie_id   | uuid         | YES      |                   | FK to primarii (context)                      |
| type          | varchar(50)  | NO       |                   | Type (status_updated, document_request, etc.) |
| priority      | varchar(20)  | NO       | 'medium'          | Enum: low, medium, high, urgent               |
| title         | varchar(255) | NO       |                   | Notification title                            |
| message       | text         | NO       |                   | Notification message                          |
| action_url    | varchar(500) | YES      |                   | Action link URL                               |
| action_label  | varchar(100) | YES      |                   | Action button text                            |
| dismissed_at  | timestamptz  | YES      |                   | Dismissal timestamp                           |
| expires_at    | timestamptz  | YES      |                   | Auto-expiry date                              |
| created_at    | timestamptz  | NO       | now()             |                                               |

**Indexes**:

- PK: notifications_pkey (id)
- idx_notifications_utilizator (utilizator_id) WHERE dismissed_at IS NULL
- idx_notifications_priority (priority, dismissed_at) WHERE dismissed_at IS NULL
- idx_notifications_active (utilizator_id, created_at DESC) WHERE dismissed_at IS NULL
- idx_notifications_created (created_at DESC)

**Data Count**: 8 rows

**RLS Policies**:

- `Service role can insert notifications`: System internal
- `Service role can delete notifications`: System internal
- `Users can view own notifications`: User-scoped
- `Users can update own notifications`: User-scoped (dismiss)

---

### notificari (Notifications - Legacy)

**Purpose**: Legacy notification table (being phased out in favor of notifications)

| Column        | Type         | Nullable | Default           | Notes             |
| ------------- | ------------ | -------- | ----------------- | ----------------- |
| id            | uuid         | NO       | gen_random_uuid() | Primary key       |
| utilizator_id | uuid         | NO       |                   | FK to utilizatori |
| tip           | varchar(50)  | YES      |                   | Notification type |
| titlu         | varchar(255) | YES      |                   | Title             |
| mesaj         | text         | YES      |                   | Message           |
| citita        | boolean      | NO       | false             | Read status       |
| created_at    | timestamptz  | NO       | now()             |                   |

**Indexes**:

- PK: notificari_pkey (id)
- idx_notificari_utilizator (utilizator_id)
- idx_notificari_citita (utilizator_id, citita)
- idx_notificari_unread (utilizator_id, created_at DESC) WHERE citita = false
- idx_notificari_created (created_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `notificari_own`: Users can see/manage their own notifications

---

### mesaje (Messages / Comments on Requests)

**Purpose**: Discussion/comment threads between citizens and staff on specific requests

| Column        | Type        | Nullable | Default           | Notes                         |
| ------------- | ----------- | -------- | ----------------- | ----------------------------- |
| id            | uuid        | NO       | gen_random_uuid() | Primary key                   |
| cerere_id     | uuid        | NO       |                   | FK to cereri                  |
| expeditor_id  | uuid        | NO       |                   | FK to utilizatori (sender)    |
| destinatar_id | uuid        | NO       |                   | FK to utilizatori (recipient) |
| continut      | text        | NO       |                   | Message body                  |
| citit         | boolean     | NO       | false             | Read status                   |
| created_at    | timestamptz | NO       | now()             |                               |
| updated_at    | timestamptz | NO       | now()             |                               |
| deleted_at    | timestamptz | YES      |                   | Soft delete                   |

**Indexes**:

- PK: mesaje_pkey (id)
- idx_mesaje_cerere (cerere_id) WHERE deleted_at IS NULL
- idx_mesaje_expeditor (expeditor_id)
- idx_mesaje_destinatar (destinatar_id)
- idx_mesaje_citit (destinatar_id, citit) WHERE deleted_at IS NULL
- idx_mesaje_unread (cerere_id, destinatar_id, citit) WHERE deleted_at IS NULL
- idx_mesaje_created (created_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `mesaje_participant`: Only sender/recipient can view
- `mesaje_send`: Users can only send from their own ID
- `mesaje_update_own`: Only sender can edit their messages

---

### sms_logs (SMS Notification Logs)

**Purpose**: Track SMS notifications sent to users

| Column        | Type         | Nullable | Default           | Notes                            |
| ------------- | ------------ | -------- | ----------------- | -------------------------------- |
| id            | uuid         | NO       | gen_random_uuid() | Primary key                      |
| user_id       | uuid         | NO       |                   | FK to utilizatori                |
| phone_number  | varchar(20)  | YES      |                   | Recipient phone                  |
| message       | text         | NO       |                   | SMS body                         |
| provider      | varchar(50)  | YES      |                   | SMS provider (Twilio, etc.)      |
| external_id   | varchar(255) | YES      |                   | Provider message ID              |
| status        | varchar(50)  | YES      |                   | Status (sent, delivered, failed) |
| error_code    | varchar(100) | YES      |                   | Error code if failed             |
| error_message | text         | YES      |                   | Error details                    |
| created_at    | timestamptz  | NO       | now()             |                                  |

**Indexes**:

- PK: sms_logs_pkey (id)
- idx_sms_logs_user_id (user_id)
- idx_sms_logs_user_created (user_id, created_at DESC)
- idx_sms_logs_created_at (created_at DESC)

**Data Count**: 4 rows

**RLS Policies**:

- `Service role can insert SMS logs`: System internal
- `Users can view own SMS logs`: User-scoped

---

## Survey & Research

### survey_questions (Survey Questions)

**Purpose**: Configurable survey questions for citizen feedback

| Column          | Type        | Nullable | Default           | Notes                                                 |
| --------------- | ----------- | -------- | ----------------- | ----------------------------------------------------- |
| id              | uuid        | NO       | gen_random_uuid() | Primary key                                           |
| survey_type     | varchar(50) | NO       |                   | Survey category (satisfaction, feature_request, etc.) |
| question_number | integer     | NO       |                   | Sequential number (UNIQUE with survey_type)           |
| order_index     | integer     | NO       |                   | Display order                                         |
| question_text   | text        | NO       |                   | The question                                          |
| question_type   | varchar(50) | NO       |                   | Enum: rating, multiselect, text, boolean              |
| options         | jsonb       | YES      |                   | Valid options for choice-based questions              |
| is_required     | boolean     | NO       | true              | Required field flag                                   |
| created_at      | timestamptz | NO       | now()             |                                                       |

**Indexes**:

- PK: survey_questions_pkey (id)
- UNIQUE: unique_survey_order (survey_type, order_index)
- UNIQUE: unique_survey_question_number (survey_type, question_number)
- idx_question_survey_type_order (survey_type, order_index)
- idx_question_type (question_type)

**Data Count**: 0 rows

**RLS Policies**:

- `Admins can manage survey_questions`: Admin/super_admin only
- `Allow public read on survey_questions`: Everyone can see active surveys

---

### survey_respondents (Survey Sessions)

**Purpose**: Individual survey completion sessions

| Column          | Type         | Nullable | Default           | Notes                            |
| --------------- | ------------ | -------- | ----------------- | -------------------------------- |
| id              | uuid         | NO       | gen_random_uuid() | Primary key                      |
| survey_type     | varchar(50)  | NO       |                   | Survey category                  |
| respondent_type | varchar(50)  | YES      |                   | Citizen, staff, admin, etc.      |
| county          | varchar(100) | YES      |                   | Respondent county                |
| locality        | varchar(100) | YES      |                   | Respondent locality              |
| age_group       | varchar(20)  | YES      |                   | Age bracket (18-25, 26-35, etc.) |
| is_completed    | boolean      | NO       | false             | Completion status                |
| created_at      | timestamptz  | NO       | now()             |                                  |
| completed_at    | timestamptz  | YES      |                   | Completion timestamp             |
| updated_at      | timestamptz  | NO       | now()             |                                  |

**Indexes**:

- PK: survey_respondents_pkey (id)
- idx_survey_respondent_type (respondent_type)
- idx_survey_county_locality (county, locality)
- idx_survey_created_at (created_at DESC)
- idx_survey_is_completed (is_completed)
- idx_survey_completed_at (completed_at DESC) WHERE completed_at IS NOT NULL

**Data Count**: 0 rows

**RLS Policies**:

- `Allow public inserts on survey_respondents`: Anyone can start survey
- `Allow users to read own draft`: Via app.current_respondent_id setting
- `Allow users to update own draft`: Via app.current_respondent_id setting
- `Admins can read all survey_respondents`: Admin/super_admin access

---

### survey_responses (Individual Survey Answers)

**Purpose**: Answers to survey questions

| Column         | Type        | Nullable | Default           | Notes                     |
| -------------- | ----------- | -------- | ----------------- | ------------------------- |
| id             | uuid        | NO       | gen_random_uuid() | Primary key               |
| respondent_id  | uuid        | NO       |                   | FK to survey_respondents  |
| question_id    | uuid        | NO       |                   | FK to survey_questions    |
| question_type  | varchar(50) | YES      |                   | Cached question type      |
| answer_text    | text        | YES      |                   | Text answer               |
| answer_rating  | integer     | YES      |                   | Rating answer (1-5, etc.) |
| answer_choices | jsonb       | YES      |                   | Array of selected choices |
| created_at     | timestamptz | NO       | now()             |                           |
| updated_at     | timestamptz | NO       | now()             |                           |

**Indexes**:

- PK: survey_responses_pkey (id)
- UNIQUE: unique_respondent_question (respondent_id, question_id)
- idx_response_respondent (respondent_id)
- idx_response_question_id (question_id)
- idx_response_question_type (question_type)
- idx_response_choices (answer_choices)
- idx_response_created_at (created_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Allow public inserts on survey_responses`: Anyone can answer
- `Allow users to read own responses`: Via app.current_respondent_id
- `Allow users to update own responses`: Via app.current_respondent_id
- `Admins can read all survey_responses`: Admin/super_admin access

---

### survey_analysis_cache (Analysis Cache)

**Purpose**: Caching mechanism for expensive survey analysis queries

| Column           | Type         | Nullable | Default           | Notes                                              |
| ---------------- | ------------ | -------- | ----------------- | -------------------------------------------------- |
| id               | uuid         | NO       | gen_random_uuid() | Primary key                                        |
| cache_key        | varchar(255) | NO       |                   | UNIQUE cache identifier                            |
| analysis_type    | varchar(100) | NO       |                   | Analysis type (cohort_analysis, correlation, etc.) |
| cached_result    | jsonb        | NO       |                   | Analysis result data                               |
| access_count     | integer      | NO       | 0                 | Number of times accessed                           |
| last_accessed_at | timestamptz  | YES      |                   | Last access time                                   |
| expires_at       | timestamptz  | NO       |                   | Cache expiration                                   |
| created_at       | timestamptz  | NO       | now()             |                                                    |

**Indexes**:

- PK: survey_analysis_cache_pkey (id)
- UNIQUE: survey_analysis_cache_cache_key_key (cache_key)
- idx_analysis_cache_key (cache_key)
- idx_analysis_cache_type (analysis_type)
- idx_analysis_cache_expires (expires_at)

**Data Count**: 0 rows

**RLS Policies**:

- `Service role can manage analysis cache`: System internal
- `Admins can read analysis cache`: Admin/super_admin
- `Admins can insert analysis cache`: Admin/super_admin
- `Admins can update analysis cache`: Admin/super_admin

---

### survey_holistic_insights (Survey Insights)

**Purpose**: High-level insights/conclusions from survey analysis

| Column           | Type         | Nullable | Default           | Notes               |
| ---------------- | ------------ | -------- | ----------------- | ------------------- |
| id               | uuid         | NO       | gen_random_uuid() | Primary key         |
| survey_type      | varchar(50)  | NO       |                   | UNIQUE survey type  |
| insight_category | varchar(100) | YES      |                   | Category of insight |
| findings         | jsonb        | NO       | {}                | Key findings data   |
| recommendations  | jsonb        | YES      | []                | Recommended actions |
| data_summary     | jsonb        | YES      | {}                | Summary statistics  |
| generated_at     | timestamptz  | NO       | now()             |                     |
| updated_at       | timestamptz  | NO       | now()             |                     |

**Indexes**:

- PK: survey_holistic_insights_pkey (id)
- UNIQUE: survey_holistic_insights_survey_type_key (survey_type)
- idx_survey_holistic_insights_survey_type (survey_type)
- idx_survey_holistic_insights_generated_at (generated_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Admins can read holistic insights`: Admin/super_admin
- `Admins can insert holistic insights`: Admin/super_admin
- `Admins can update holistic insights`: Admin/super_admin
- `Admins can delete holistic insights`: Admin/super_admin

---

### survey_cohort_analysis (Cohort Analysis Results)

**Purpose**: Grouped analysis by demographic cohorts

| Column           | Type         | Nullable | Default           | Notes                                   |
| ---------------- | ------------ | -------- | ----------------- | --------------------------------------- |
| id               | uuid         | NO       | gen_random_uuid() | Primary key                             |
| cohort_type      | varchar(50)  | NO       |                   | Grouping type (age_group, county, etc.) |
| cohort_value     | varchar(100) | YES      |                   | Cohort identifier                       |
| analysis_data    | jsonb        | NO       | {}                | Analysis results                        |
| sample_size      | integer      | YES      |                   | Number of respondents in cohort         |
| confidence_level | decimal(3,2) | YES      |                   | Statistical confidence (0.95, etc.)     |
| created_at       | timestamptz  | NO       | now()             |                                         |
| updated_at       | timestamptz  | NO       | now()             |                                         |

**Indexes**:

- PK: survey_cohort_analysis_pkey (id)
- idx_cohort_analysis_cohort_type (cohort_type)
- idx_cohort_analysis_created_at (created_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Super admins can manage cohort analysis`: super_admin only

---

### survey_correlation_analysis (Correlation Analysis)

**Purpose**: Relationships between survey responses

| Column                  | Type         | Nullable | Default           | Notes                         |
| ----------------------- | ------------ | -------- | ----------------- | ----------------------------- |
| id                      | uuid         | NO       | gen_random_uuid() | Primary key                   |
| survey_type             | varchar(50)  | NO       |                   | Survey category               |
| variable1               | varchar(255) | NO       |                   | First variable                |
| variable2               | varchar(255) | NO       |                   | Second variable               |
| correlation_coefficient | decimal(4,3) | YES      |                   | Pearson correlation (-1 to 1) |
| p_value                 | decimal(5,4) | YES      |                   | Statistical significance      |
| is_significant          | boolean      | YES      |                   | Significance flag             |
| analysis_data           | jsonb        | YES      | {}                | Additional analysis           |
| created_at              | timestamptz  | NO       | now()             |                               |
| updated_at              | timestamptz  | NO       | now()             |                               |

**Indexes**:

- PK: survey_correlation_analysis_pkey (id)
- idx_correlation_analysis_survey_type (survey_type)
- idx_correlation_analysis_created_at (created_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Super admins can manage correlation analysis`: super_admin only

---

### survey_research_metadata (Research Metadata)

**Purpose**: Metadata about survey analysis operations and provenance

| Column           | Type         | Nullable | Default           | Notes                                              |
| ---------------- | ------------ | -------- | ----------------- | -------------------------------------------------- |
| id               | uuid         | NO       | gen_random_uuid() | Primary key                                        |
| analysis_id      | uuid         | NO       |                   | UNIQUE analysis identifier (cohort/correlation id) |
| analysis_type    | varchar(100) | NO       |                   | Type of analysis                                   |
| methodology      | varchar(500) | YES      |                   | Description of methodology                         |
| sample_size      | integer      | YES      |                   | Number of respondents analyzed                     |
| confidence_level | decimal(3,2) | YES      |                   | Confidence percentage                              |
| assumptions      | jsonb        | YES      | {}                | Statistical assumptions                            |
| limitations      | text         | YES      |                   | Known limitations                                  |
| data_sources     | jsonb        | YES      | []                | Data source identifiers                            |
| generated_at     | timestamptz  | NO       | now()             |                                                    |
| updated_at       | timestamptz  | NO       | now()             |                                                    |

**Indexes**:

- PK: survey_research_metadata_pkey (id)
- UNIQUE: survey_research_metadata_analysis_id_key (analysis_id)
- idx_research_metadata_analysis_id (analysis_id)
- idx_research_metadata_generated (generated_at DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Admins can read research metadata`: Admin/super_admin
- `Admins can insert research metadata`: Admin/super_admin
- `Admins can update research metadata`: Admin/super_admin

---

## Audit & Analytics

### audit_log (Audit Trail)

**Purpose**: Complete audit trail of all data modifications

| Column          | Type         | Nullable | Default           | Notes                                   |
| --------------- | ------------ | -------- | ----------------- | --------------------------------------- |
| id              | uuid         | NO       | gen_random_uuid() | Primary key                             |
| primarie_id     | uuid         | YES      |                   | FK to primarii (which organization)     |
| utilizator_id   | uuid         | YES      |                   | FK to utilizatori (who made the change) |
| utilizator_nume | varchar(255) | YES      |                   | Cached user name                        |
| utilizator_rol  | varchar(50)  | YES      |                   | Cached user role                        |
| actiune         | varchar(10)  | NO       |                   | Operation type (INSERT, UPDATE, DELETE) |
| entitate_tip    | varchar(100) | NO       |                   | Table name                              |
| entitate_id     | uuid         | YES      |                   | Record ID                               |
| detalii         | jsonb        | YES      |                   | Complete before/after data              |
| created_at      | timestamptz  | NO       | now()             |                                         |

**Indexes**:

- PK: audit_log_pkey (id)
- idx_audit_primarie (primarie_id)
- idx_audit_utilizator (utilizator_id)
- idx_audit_actiune (actiune)
- idx_audit_entitate (entitate_tip, entitate_id)
- idx_audit_entity_history (entitate_tip, entitate_id, created_at DESC)
- idx_audit_created (created_at DESC)

**Data Count**: 275 rows (comprehensive audit trail)

**RLS Policies**:

- `audit_functionar`: Staff can view their primarie's audit logs
- `audit_super_admin`: Super admins can view all audit logs

**Trigger**: All tables (cereri, utilizatori, documente, etc.) have `audit_*` triggers that log changes

---

### statistici_publice (Public Statistics)

**Purpose**: Aggregate statistics published to the public

| Column         | Type         | Nullable | Default           | Notes                                                                 |
| -------------- | ------------ | -------- | ----------------- | --------------------------------------------------------------------- |
| id             | uuid         | NO       | gen_random_uuid() | Primary key                                                           |
| tip_statistica | varchar(100) | NO       |                   | UNIQUE statistic type (cereri_processed_month, primarii_active, etc.) |
| valoare        | jsonb        | NO       | {}                | Statistic data (count, average_time, etc.)                            |
| calculat_la    | timestamptz  | NO       | now()             | Last calculation timestamp                                            |

**Indexes**:

- PK: statistici_publice_pkey (id)
- UNIQUE: statistici_publice_tip_statistica_key (tip_statistica)
- idx_statistici_publice_tip (tip_statistica)

**Data Count**: 0 rows

**RLS Policies**:

- `statistici_publice_public_read`: Everyone can view
- `statistici_publice_admin_write`: Only super_admin can write

**Function**: `refresh_public_stats()` - Called periodically to update counts

---

### user_achievements (Gamification Achievements)

**Purpose**: Track user milestones/achievements for gamification

| Column                  | Type         | Nullable | Default           | Notes                                                     |
| ----------------------- | ------------ | -------- | ----------------- | --------------------------------------------------------- |
| id                      | uuid         | NO       | gen_random_uuid() | Primary key                                               |
| utilizator_id           | uuid         | NO       |                   | FK to utilizatori                                         |
| achievement_key         | varchar(100) | NO       |                   | Achievement identifier (first_request, 10_requests, etc.) |
| achievement_name        | varchar(255) | NO       |                   | Display name                                              |
| achievement_description | text         | YES      |                   | Description                                               |
| points                  | integer      | NO       | 0                 | Points awarded                                            |
| unlocked_at             | timestamptz  | NO       | now()             |                                                           |

**Indexes**:

- PK: user_achievements_pkey (id)
- UNIQUE: user_achievements_utilizator_id_achievement_key_key (utilizator_id, achievement_key)
- idx_user_achievements_utilizator (utilizator_id)
- idx_user_achievements_unlocked (unlocked_at DESC)
- idx_user_achievements_points (points DESC)

**Data Count**: 0 rows

**RLS Policies**:

- `Service role can manage achievements`: System internal
- `Users can view own achievements`: User-scoped

---

### trigger_debug_log (Debugging)

**Purpose**: Temporary debugging table for trigger/function testing

| Column       | Type        | Nullable | Default           | Notes               |
| ------------ | ----------- | -------- | ----------------- | ------------------- |
| id           | uuid        | NO       | gen_random_uuid() | Primary key         |
| message      | text        | YES      |                   | Debug message       |
| context_data | jsonb       | YES      |                   | Context information |
| created_at   | timestamptz | NO       | now()             |                     |

**Data Count**: 1 row

**RLS Status**: ⚠️ **RLS DISABLED** - Internal debugging table

---

## Row Level Security (RLS)

### Core RLS Functions

All RLS policies rely on these custom SQL functions:

```sql
-- Get current user's primarie (for staff filtering)
current_user_primarie() -> UUID
  Returns the primarie_id of the authenticated user

-- Get current user's role
current_user_role() -> TEXT
  Returns 'cetatean', 'functionar', 'admin', or 'super_admin'

-- Get current authenticated user ID
get_current_user_id() -> UUID
  Extracts user ID from JWT claims
```

### Multi-Tenancy Model

The database implements **strict multi-tenancy isolation** through RLS:

**For Staff (Functionar/Admin)**:

- Can only access records where `primarie_id = current_user_primarie()`
- Exception: Super admins can access all records

**For Citizens (Cetatean)**:

- Can only access their own records (`id = auth.uid()`)
- Can view public data (active request types, primarii listings)

**Storage Isolation**:

- Documents stored in paths like: `{primarie_id}/{cerere_id}/{document_id}`
- RLS on storage.objects ensures proper bucket-level isolation

### RLS Policy Summary by Table

| Table           | Citizen Access             | Staff Access      | Admin Access              | Notes                |
| --------------- | -------------------------- | ----------------- | ------------------------- | -------------------- |
| cereri          | Own requests only          | Primarie requests | All + override finalized  | Multi-policy         |
| utilizatori     | Self only                  | Same primarie     | All + create/manage       | Multi-policy         |
| documente       | Own cereri uploads         | Primarie uploads  | All + delete              | Multi-policy         |
| plati           | Own payments               | Primarie payments | All (read-only for users) | No user UPDATE       |
| primarii        | Own primarie (public list) | Own primarie      | All primarii              | Multi-policy         |
| storage.objects | Own files                  | Primarie files    | All + delete              | Path-based isolation |

---

## Database Functions

### User Management Functions

**`handle_new_user()`** [Trigger: auth.users INSERT]

- Creates utilizatori record on signup
- Handles invitation system integration
- Assigns role, primarie_id, departament, permisiuni from invitation if present
- Fallback: creates cetatean account for non-invited registrations
- TYPE: TRIGGER FUNCTION (plpgsql, SECURITY DEFINER)

**`expire_old_invitations()`**

- Marks expired invitations as 'expired' status
- Runs periodically or on-demand
- Returns count of expired invitations
- TYPE: Regular Function (plpgsql, SECURITY DEFINER)

**`current_user_primarie()`**

- Returns the primarie_id of current authenticated user
- Used in all staff RLS policies
- TYPE: SQL Function (STABLE, SECURITY DEFINER)

**`current_user_role()`**

- Returns the role of current authenticated user
- Used in RLS policies for role-based filtering
- TYPE: SQL Function (STABLE, SECURITY DEFINER)

**`get_current_user_id()`**

- Safely extracts user ID from JWT claims
- Handles multiple JWT claim formats
- TYPE: SQL Function (STABLE)

---

### Request Management Functions

**`generate_numar_inregistrare()`** [Trigger: cereri INSERT]

- Auto-generates sequential registration numbers
- Format: `DRAFT-YYYY-#####` for drafts (no primarie_id)
- Format: `JD-LL-YYYY-#####` for submitted (JD=judet code, LL=localitate slug)
- TYPE: TRIGGER FUNCTION (plpgsql, SECURITY DEFINER)

**`calculate_cerere_progress(status)`**

- Maps request status to progress percentage
- Returns: draft=0%, depusa=25%, in_verificare=40%, in_asteptare=50%, in_aprobare=75%, aprobata/respinsa/anulata=100%
- TYPE: SQL Function (IMMUTABLE)

**`validate_cerere_status_transition()`** [Trigger: cereri UPDATE]

- Validates status changes
- Prevents modification of finalized/cancelled requests (except by admin)
- Auto-sets data_finalizare when status → 'finalizata'
- TYPE: TRIGGER FUNCTION (plpgsql)

**`notify_cerere_status_change()`** [Trigger: cereri UPDATE]

- Creates in-app notification when status changes
- Generates title/message based on new status
- Updates progress_data JSON
- TYPE: TRIGGER FUNCTION (plpgsql, SECURITY DEFINER)

**`send_cerere_email_notification()`** [Trigger: cereri INSERT/UPDATE]

- Sends email notifications via Edge Function
- Calls `/functions/v1/send-email` endpoint with JWT auth
- Email types: cerere_submitted, cerere_finalizata, cerere_respinsa, status_changed
- TYPE: TRIGGER FUNCTION (plpgsql, SECURITY DEFINER)

---

### Payment Functions

**`generate_numar_chitanta()`** [Trigger: chitante INSERT]

- Auto-generates sequential receipt numbers
- Format: `CH-YYYY-#####`
- TYPE: TRIGGER FUNCTION (plpgsql)

**`validate_plata_cerere()`** [Trigger: plati INSERT]

- Validates payment amount against cerere requirement
- Ensures cerere necessita_plata = true
- TYPE: TRIGGER FUNCTION (plpgsql)

**`log_plata_status_change()`** [Trigger: plati UPDATE]

- Logs payment status changes to audit_log
- Records old_status, new_status, suma, transaction_id
- TYPE: TRIGGER FUNCTION (plpgsql)

---

### Audit Functions

**`log_audit()`** [Trigger: Most tables INSERT/UPDATE/DELETE]

- Universal audit logging function
- Records: primarie_id, utilizator_id, actiune, entitate_tip, entitate_id, detalii (old/new)
- Attached to cereri, utilizatori, documente, templates, tipuri_cereri, user_invitations
- TYPE: TRIGGER FUNCTION (plpgsql, SECURITY DEFINER)

---

### Survey/Cache Functions

**`cleanup_expired_analysis_cache()`**

- Removes expired cache entries
- Can be run periodically via cron or on-demand
- TYPE: Regular Function (plpgsql)

**`is_cache_valid(cache_key)`**

- Checks if cache entry exists and hasn't expired
- TYPE: SQL Function (STABLE)

**`update_cache_access(cache_key)`**

- Increments access_count and updates last_accessed_at
- TYPE: Regular Function (plpgsql)

**`refresh_public_stats()`**

- Recalculates public statistics
- Updates localitati_count, primarii_active, cereri_processed_month
- TYPE: Regular Function (plpgsql, SECURITY DEFINER)

---

### Generic Utility Functions

**`update_updated_at_column()`** [Trigger: Most tables UPDATE]

- Generic function to auto-update updated_at timestamp
- Attached to 15+ tables (cereri, primarii, tipuri_cereri, templates, documente, etc.)
- TYPE: TRIGGER FUNCTION (plpgsql)

**`update_survey_cohort_analysis_updated_at()`** [Trigger: survey_cohort_analysis UPDATE]

- Specialized updated_at updater for cohort analysis
- TYPE: TRIGGER FUNCTION (plpgsql)

**`update_survey_correlation_analysis_updated_at()`** [Trigger: survey_correlation_analysis UPDATE]

- Specialized updated_at updater for correlation analysis
- TYPE: TRIGGER FUNCTION (plpgsql)

---

## Triggers

**Total Triggers**: 29

### Audit Triggers (3)

- `audit_cereri`: INSERT/UPDATE/DELETE on cereri → log_audit()
- `audit_documente`: INSERT/UPDATE/DELETE on documente → log_audit()
- `audit_utilizatori`: INSERT/UPDATE/DELETE on utilizatori → log_audit()

### Request Triggers (6)

- `set_numar_inregistrare`: INSERT on cereri → generate_numar_inregistrare()
- `validate_cerere_status`: UPDATE on cereri → validate_cerere_status_transition()
- `trg_cerere_status_notification`: UPDATE on cereri → notify_cerere_status_change()
- `trigger_send_email_on_cerere_insert`: INSERT on cereri → send_cerere_email_notification()
- `trigger_send_email_on_cerere_update`: UPDATE on cereri → send_cerere_email_notification()
- `update_cereri_updated_at`: UPDATE on cereri → update_updated_at_column()

### Payment Triggers (3)

- `set_numar_chitanta`: INSERT on chitante → generate_numar_chitanta()
- `validate_plata_cerere_trigger`: INSERT on plati → validate_plata_cerere()
- `audit_plata_status`: UPDATE on plati → log_plata_status_change()
- `update_plati_updated_at`: UPDATE on plati → update_updated_at_column()

### Updated_at Triggers (8)

- `update_primarii_updated_at`: primarii
- `update_mock_certificates_updated_at`: mock_certificates
- `update_tipuri_cereri_updated_at`: tipuri_cereri
- `update_templates_updated_at`: templates
- `update_survey_respondents_updated_at`: survey_respondents
- `update_survey_responses_updated_at`: survey_responses
- `update_user_invitations_updated_at`: user_invitations
- `update_utilizatori_updated_at`: utilizatori

### Survey Triggers (2)

- `trigger_update_survey_cohort_analysis_updated_at`: survey_cohort_analysis
- `trigger_update_survey_correlation_analysis_updated_at`: survey_correlation_analysis

---

## Indexes

**Total Indexes**: 150+ comprehensive indexes across all tables

### High-Performance Indexes

| Name                     | Table       | Purpose                           |
| ------------------------ | ----------- | --------------------------------- |
| idx_cereri_dashboard     | cereri      | Dashboard query optimization      |
| idx_cereri_search        | cereri      | Full-text search on requests      |
| idx_utilizatori_search   | utilizatori | Full-text search on user names    |
| idx_localitati_search    | localitati  | Full-text search on localities    |
| idx_localitati_nume_trgm | localitati  | Trigram search for typo tolerance |

### Multi-Column Composite Indexes

- idx_cereri_stats: (primarie_id, tip_cerere_id, status)
- idx_utilizatori_primarie_rol: (primarie_id, rol, created_at DESC)
- idx_tipuri_cereri_active: (primarie_id, ordine_afisare) WHERE activ = true
- idx_survey_county_locality: (county, locality)

### Partial/Filtered Indexes (WHERE clauses)

- Most soft-delete tables have conditional indexes: `WHERE deleted_at IS NULL`
- Status-based indexes: `WHERE status IN (...)`
- Soft delete awareness ensures fast queries on active data only

---

## Storage Buckets

### 1. cereri-documente (Private)

**Purpose**: Citizen-uploaded documents for their requests

| Property           | Value                                             |
| ------------------ | ------------------------------------------------- |
| Access             | Private (authenticated only)                      |
| Max File Size      | 5 MB                                              |
| Allowed MIME Types | application/pdf, image/jpeg, image/jpg, image/png |
| Path Structure     | `{primarie_id}/{cerere_id}/{document_id}`         |
| Usage              | User-submitted attachments for requests           |

**RLS Policies**:

- Citizens can upload/view/delete to their own cereri
- Staff can view documents for their primarie's cereri
- Staff admins can delete

### 2. documents (Private)

**Purpose**: Staff-managed documents (templates, responses, notices)

| Property           | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Access             | Private (authenticated + RLS)                        |
| Max File Size      | 10 MB                                                |
| Allowed MIME Types | application/pdf, image/\*, application/msword, .docx |
| Path Structure     | `{primarie_id}/{cerere_id}/...`                      |
| Usage              | Staff documents, officially generated responses      |

**RLS Policies**:

- Staff can upload/view documents for their primarie
- Staff admins can delete
- Citizens can view attached documents

### 3. user-avatars (Public)

**Purpose**: User profile pictures

| Property           | Value                                        |
| ------------------ | -------------------------------------------- |
| Access             | Public (read) / Authenticated (write)        |
| Max File Size      | 2 MB                                         |
| Allowed MIME Types | image/jpeg, image/jpg, image/png, image/webp |
| Path Structure     | `{user_id}/avatar.{ext}`                     |
| Usage              | Profile photos                               |

**RLS Policies**:

- Anyone can view (public)
- Authenticated users can upload/update/delete own
- File naming restricted to single avatar per user

---

## Migrations & Version History

**Total Migrations**: 31 (from Jan 18, 2025 to Jan 24, 2026)

### Migration Timeline

| Version        | Date         | Name                                         | Purpose                                                             |
| -------------- | ------------ | -------------------------------------------- | ------------------------------------------------------------------- |
| 20250118000001 | Jan 18, 2025 | create_extensions_and_core_tables            | Initial schema: judete, localitati, primarii, utilizatori, etc.     |
| 20250118000002 | Jan 18, 2025 | create_rls_policies                          | Initial RLS policy setup                                            |
| 20250118000003 | Jan 18, 2025 | create_indexes                               | Performance indexes                                                 |
| 20250118000004 | Jan 18, 2025 | create_triggers                              | Audit/timestamp triggers                                            |
| 20251025002915 | Oct 25, 2025 | correct_localitati_classification            | Classification data fixes                                           |
| 20251025003621 | Oct 25, 2025 | add_bucuresti_sectors_and_fix_classification | Bucharest sectors setup                                             |
| 20251028114708 | Oct 28, 2025 | survey_platform.sql                          | Survey system (questions, respondents, responses)                   |
| 20251101101231 | Nov 1, 2025  | survey_ai_insights.sql                       | AI-based analysis tables (cohort, correlation, holistic)            |
| 20251101154419 | Nov 1, 2025  | fix_survey_respondents_rls_policy            | RLS policy corrections                                              |
| 20251101154733 | Nov 1, 2025  | fix_remaining_rls_policies                   | Additional RLS fixes                                                |
| 20251101154924 | Nov 1, 2025  | fix_survey_analysis_cache_rls                | Cache RLS policies                                                  |
| 20251101155408 | Nov 1, 2025  | populate_survey_questions                    | Seed survey questions                                               |
| 20251101163947 | Nov 1, 2025  | create_survey_holistic_insights              | Holistic insights table                                             |
| 20251101170615 | Nov 1, 2025  | drop_old_survey_ai_insights_table            | Cleanup old schema                                                  |
| 20251101171716 | Nov 1, 2025  | add_feature_requests_to_holistic_insights    | Schema expansion                                                    |
| 20251102105226 | Nov 2, 2025  | survey_correlation_cohort_cache              | Cache optimization                                                  |
| 20251228060556 | Dec 28, 2025 | seed_tipuri_cereri                           | Seed 5 demo request types                                           |
| 20260101200015 | Jan 1, 2026  | email_notifications_trigger                  | Email notification system                                           |
| 20260101202935 | Jan 1, 2026  | fix_email_trigger_pg_net_schema              | pg_net schema fixes                                                 |
| 20260102215534 | Jan 2, 2026  | create_plati_chitante_tables                 | Payment and receipt tables                                          |
| 20260102215552 | Jan 2, 2026  | create_plati_chitante_rls                    | Payment RLS policies                                                |
| 20260102215620 | Jan 2, 2026  | create_plati_chitante_functions              | Payment functions (generate_numar_chitanta, validate_plata_cerere)  |
| 20260102225358 | Jan 2, 2026  | create_certsign_tables                       | Digital signature tables (batch_signature_log, signature_audit_log) |
| 20260104162245 | Jan 4, 2026  | add_sms_notifications                        | SMS logging table (sms_logs)                                        |
| 20260112190729 | Jan 12, 2026 | dashboard_revamp_tables                      | Dashboard feature tables (notifications, user_achievements)         |
| 20260118214048 | Jan 18, 2026 | create_utilizatori_auto_creation_trigger     | Automatic user creation on auth signup                              |
| 20260118214826 | Jan 18, 2026 | fix_generate_numar_inregistrare_for_drafts   | Support for draft registration numbers                              |
| 20260119215838 | Jan 19, 2026 | create_user_invitations_table                | Staff invitation system                                             |
| 20260119220131 | Jan 19, 2026 | modify_handle_new_user_function_only         | Invitation handling in user creation                                |
| 20260124221004 | Jan 24, 2026 | fix_handle_new_user_localitate_id_type       | Type fix for localitate_id (INTEGER not UUID)                       |

**Key Migration Clusters**:

1. **Initial Setup** (Jan 18): Core schema and RLS
2. **Survey System** (Oct 28 - Nov 2): Complete survey platform with AI analysis
3. **Payments & Signatures** (Jan 2-4): Payment processing and digital signatures
4. **User Management** (Jan 12-24): User creation automation and staff invitations

---

## Edge Functions

### send-email (Version 11, Active)

**Purpose**: Email notification service for system events

**Status**: ACTIVE
**JWT Verification**: Disabled (service_role authentication via Authorization header)
**Deployment**: Deno Runtime

**Invoked By**:

- `send_cerere_email_notification()` trigger on cereri INSERT/UPDATE
- Edge Function URL: `https://ihwfqsongyaahdtypgnh.supabase.co/functions/v1/send-email`

**Request Format** (from trigger):

```json
{
  "type": "cerere_submitted|cerere_finalizata|cerere_respinsa|status_changed",
  "cerereId": "uuid",
  "toEmail": "user@example.com",
  "toName": "User Name"
}
```

**Implementation Details**:

- HTTP POST with 5-second timeout
- Service role JWT authentication in Authorization header
- Uses pg_net for async HTTP calls from database
- Handles email provider integration (presumably SendGrid, Resend, etc.)

**Related Migrations**:

- 20260101200015: Initial email notification system
- 20260101202935: pg_net schema fixes

---

## Current Data State

### Data Summary by Table

| Table                       | Row Count | Status    | Notes                                       |
| --------------------------- | --------- | --------- | ------------------------------------------- |
| **Core**                    |
| utilizatori                 | 13        | Active    | 13 test users created                       |
| primarii                    | 5         | Active    | 5 test primării                             |
| **Requests**                |
| cereri                      | 39        | Active    | Mix of draft and submitted requests         |
| tipuri_cereri               | 5         | Seeded    | 5 demo request types                        |
| templates                   | 0         | Empty     | No templates created yet                    |
| **Documents**               |
| documente                   | 20        | Active    | Documents uploaded to requests              |
| **Payments**                |
| plati                       | 5         | Active    | Payment test records                        |
| chitante                    | 3         | Active    | Generated receipts                          |
| **Signatures**              |
| signature_audit_log         | 0         | Empty     | No signatures yet                           |
| batch_signature_log         | 0         | Empty     | No batch signatures yet                     |
| mock_certificates           | 5         | Test Data | Test certificates for development           |
| **Communication**           |
| mesaje                      | 0         | Empty     | No messages exchanged                       |
| notificari (legacy)         | 0         | Empty     | Not in use                                  |
| notifications (new)         | 8         | Active    | Recent notifications created                |
| sms_logs                    | 4         | Active    | SMS logs present                            |
| **Survey**                  |
| survey_questions            | 0         | Empty     | Not populated                               |
| survey_respondents          | 0         | Empty     | No survey responses                         |
| survey_responses            | 0         | Empty     | No survey data                              |
| survey_analysis_cache       | 0         | Empty     | No cache entries                            |
| survey_holistic_insights    | 0         | Empty     | No insights generated                       |
| survey_cohort_analysis      | 0         | Empty     | No cohort analysis                          |
| survey_correlation_analysis | 0         | Empty     | No correlation analysis                     |
| survey_research_metadata    | 0         | Empty     | No metadata                                 |
| **Audit**                   |
| audit_log                   | 275       | Active    | Comprehensive audit trail of all operations |
| statistici_publice          | 0         | Empty     | Stats not yet calculated                    |
| user_achievements           | 0         | Empty     | No achievements unlocked                    |
| **Reference**               |
| judete                      | 0         | Empty     | County reference data not loaded            |
| localitati                  | 0         | Empty     | Locality reference data not loaded          |
| user_invitations            | 4         | Active    | 4 pending/accepted invitations              |

### Key Observations

1. **Development Stage**: Database contains mostly test/development data
2. **Comprehensive Audit Trail**: 275 audit log entries show active development testing
3. **Survey System Deployed but Unused**: Full infrastructure ready, no actual responses yet
4. **Reference Data Gap**: judete and localitati tables empty (SIRUL data needs to be imported)
5. **Payment System Active**: Real transaction testing in progress (5 test payments)
6. **Digital Signature Infrastructure Ready**: Tables created, no actual signatures yet

---

## Security Advisors & Issues

### HIGH PRIORITY Issues

#### 1. ⚠️ RLS DISABLED on 3 Tables (SECURITY ERROR)

**Affected Tables**:

- `public.judete` - County reference data
- `public.localitati` - Locality reference data
- `public.trigger_debug_log` - Debug table

**Risk Assessment**: **ACCEPTABLE** for judete/localitati (public reference data intended for all users), but **CRITICAL** for trigger_debug_log

**Remediation**:

- judete/localitati: RLS intentionally disabled (public read data) - **ACCEPTABLE**
- trigger_debug_log: Should be deleted or moved to separate schema - **RECOMMENDED**

---

#### 2. ⚠️ Function Search Path Mutable (SECURITY WARN - 21 instances)

**Affected Functions** (22 total):

- `calculate_cerere_progress`
- `cleanup_expired_analysis_cache`
- `current_user_primarie`
- `current_user_role`
- `expire_old_invitations`
- `expire_old_notifications`
- `generate_numar_chitanta`
- `generate_numar_inregistrare`
- `get_current_user_id`
- `handle_new_user`
- `is_cache_valid`
- `log_audit`
- `log_plata_status_change`
- `notify_cerere_status_change`
- `send_cerere_email_notification`
- `update_cache_access`
- `update_survey_cohort_analysis_updated_at`
- `update_survey_correlation_analysis_updated_at`
- `update_updated_at_column`
- `validate_cerere_status_transition`
- `validate_plata_cerere`

**Issue**: Functions without explicit `SET search_path TO 'public'` can be exploited via search path manipulation

**Risk**: Medium (requires SECURITY DEFINER context)

**Remediation**: Add `SET search_path TO 'public'` to all function definitions

```sql
CREATE OR REPLACE FUNCTION public.function_name()
...
SET search_path TO 'public'
AS $function$ ... $function$;
```

**Status**: 18 functions have SECURITY DEFINER but need search_path set

---

### MEDIUM PRIORITY Issues

#### 3. ⚠️ Overly Permissive RLS Policies (SECURITY WARN - 6 instances)

**Affected Policies**:

1. **notifications** table (2 policies):
   - `Service role can delete notifications`: DELETE with USING(true)
   - `Service role can insert notifications`: INSERT with WITH CHECK(true)
   - **Justification**: ACCEPTABLE - system/service role only for automated notifications
   - **Action**: ACCEPTABLE as-is (intentional for system processes)

2. **survey_respondents** table (1 policy):
   - `Allow public inserts on survey_respondents`: INSERT with WITH CHECK(true)
   - **Justification**: REQUIRED - anonymous survey participation
   - **Action**: ACCEPTABLE (intended for open surveys)

3. **survey_responses** table (1 policy):
   - `Allow public inserts on survey_responses`: INSERT with WITH CHECK(true)
   - **Justification**: REQUIRED - anonymous survey responses
   - **Action**: ACCEPTABLE (intended for open surveys)

4. **user_achievements** table (1 policy):
   - `Service role can manage achievements`: ALL with USING(true) and WITH CHECK(true)
   - **Justification**: ACCEPTABLE - system-only table
   - **Action**: ACCEPTABLE (service role only, isolated table)

**Assessment**: These are intentional for specific use cases (anonymous surveys, system processes)

---

#### 4. ⚠️ Email Notifications Hardcoded Service Role Key (SECURITY WARN)

**Location**: `send_cerere_email_notification()` function

**Issue**: Service role JWT key is embedded in function code (v_service_role_key variable)

**Risk**: If function code is compromised, JWT is exposed

**Remediation Options**:

1. Store key in Supabase Secrets (best practice)
2. Use Supabase RLS to prevent direct function access
3. Implement API key rotation policy

**Current Status**: Service role key hardcoded but function is SECURITY DEFINER (restricted)

---

### INFORMATIONAL Notices

#### 5. 📋 Leaked Password Protection Disabled (SECURITY WARN)

**Issue**: Supabase Auth not checking compromised passwords against HaveIBeenPwned database

**Impact**: Users with weak/leaked passwords not prevented from using them

**Recommendation**: Enable in Supabase Auth settings
**Link**: https://supabase.com/docs/guides/auth/password-security

---

## Summary

### Database Health

✅ **Strengths**:

- Comprehensive RLS implementation with proper multi-tenancy isolation
- Extensive audit logging (275 entries) for compliance
- Well-indexed for performance (150+ indexes)
- Soft delete pattern throughout for data preservation
- Complete schema for payments, signatures, surveys, notifications
- Proper function-based RLS policies for dynamic filtering

⚠️ **Areas Needing Attention**:

- Search path mutable warnings (fix 22 functions)
- Reference data not loaded (judete/localitati empty)
- Service role key hardcoded (move to secrets)
- Survey system deployed but unused
- Debug table should be removed from production

✅ **Completeness**:

- 31 migrations fully applied
- 30+ database functions active
- 29 triggers for automation
- 3 storage buckets configured
- Edge function integrated for emails

### Current Configuration

- **Active Connections**: 18 auth.users (13 utilizatori records)
- **Test Data**: 39 requests, 20 documents, 5 payments
- **Audit Trail**: 275 comprehensive log entries
- **Reference Data**: Pending SIRUL import

### Recommendations

**High Priority**:

1. Set search_path to 'public' on 22 functions (lint: 0011)
2. Enable RLS on trigger_debug_log or delete table
3. Move service role key to Supabase Secrets
4. Import judete/localitati reference data from SIRUL

**Medium Priority**: 5. Enable leaked password protection in Auth settings 6. Create database backup strategy 7. Document permission matrix in code comments 8. Set up monitoring for RLS policy failures

**Low Priority**: 9. Populate survey_questions if survey features launching 10. Implement user_achievements gamification if feature active 11. Add more specific role-based function access controls

---

**End of Database Documentation**

_Last Generated: March 2, 2026_
_Data Snapshot: Live database state_
_Source: Supabase Management API + Direct SQL queries_
