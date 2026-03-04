-- =============================================================================
-- pgTAP RLS Isolation Tests for Multi-Tenant Data Isolation
-- =============================================================================
-- Run: psql $DATABASE_URL -f supabase/tests/rls-isolation.test.sql
-- Or: Execute in Supabase SQL Editor
-- All tests run inside a transaction and ROLLBACK -- no persistent changes
--
-- These tests verify the core multi-tenant security invariant:
--   "A user associated with Primarie X CANNOT access data from Primarie Y"
--
-- Tables covered: cereri, plati, documente, notificari, user_primarii
-- Roles tested: cetatean, functionar
-- =============================================================================

BEGIN;

-- Enable pgTAP
CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(14);

-- =============================================================================
-- SETUP: Test data within transaction scope
-- =============================================================================

-- 1. Create two judete
INSERT INTO public.judete (id, cod, nume) VALUES
  (9901, 'TX', 'Judet Test X'),
  (9902, 'TY', 'Judet Test Y')
ON CONFLICT DO NOTHING;

-- 2. Create two localitati
INSERT INTO public.localitati (id, judet_id, nume, slug, tip) VALUES
  (99001, 9901, 'Localitate Alpha', 'test-alpha', 'Oras'),
  (99002, 9902, 'Localitate Beta', 'test-beta', 'Oras')
ON CONFLICT DO NOTHING;

-- 3. Create two primarii
INSERT INTO public.primarii (id, localitate_id, slug, nume_oficial, activa) VALUES
  ('a0000000-0000-0000-0000-000000000001'::uuid, 99001, 'tx/test-alpha', 'Primaria Alpha', true),
  ('b0000000-0000-0000-0000-000000000002'::uuid, 99002, 'ty/test-beta', 'Primaria Beta', true)
ON CONFLICT DO NOTHING;

-- 4. Create test users in auth.users
-- User A: cetatean in Primarie Alpha
-- User B: cetatean in Primarie Beta
-- User C: functionar in Primarie Alpha
INSERT INTO auth.users (id, email, encrypted_password, role, aud, instance_id, confirmed_at, email_confirmed_at, raw_user_meta_data)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'user_a_test@example.com',
   crypt('testpass123', gen_salt('bf')), 'authenticated', 'authenticated',
   '00000000-0000-0000-0000-000000000000'::uuid, now(), now(), '{"full_name": "User A"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'user_b_test@example.com',
   crypt('testpass123', gen_salt('bf')), 'authenticated', 'authenticated',
   '00000000-0000-0000-0000-000000000000'::uuid, now(), now(), '{"full_name": "User B"}'::jsonb),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'user_c_func@example.com',
   crypt('testpass123', gen_salt('bf')), 'authenticated', 'authenticated',
   '00000000-0000-0000-0000-000000000000'::uuid, now(), now(), '{"full_name": "User C Functionar"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 5. Create utilizatori records (needed for FK references)
INSERT INTO public.utilizatori (id, email, nume, prenume, rol, primarie_id, activ, email_verificat, notificari_email, notificari_sms, limba, timezone)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'user_a_test@example.com', 'A', 'User', 'cetatean', 'a0000000-0000-0000-0000-000000000001'::uuid, true, true, true, false, 'ro', 'Europe/Bucharest'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'user_b_test@example.com', 'B', 'User', 'cetatean', 'b0000000-0000-0000-0000-000000000002'::uuid, true, true, true, false, 'ro', 'Europe/Bucharest'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'user_c_func@example.com', 'C', 'Functionar', 'functionar', 'a0000000-0000-0000-0000-000000000001'::uuid, true, true, true, false, 'ro', 'Europe/Bucharest')
ON CONFLICT DO NOTHING;

-- 6. Create user_primarii associations
INSERT INTO public.user_primarii (user_id, primarie_id, rol, status) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'cetatean', 'approved'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 'cetatean', 'approved'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'functionar', 'approved')
ON CONFLICT DO NOTHING;

-- 7. Create tipuri_cereri for both primarii (needed for FK in cereri)
INSERT INTO public.tipuri_cereri (id, primarie_id, cod, denumire, activ) VALUES
  ('cc000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, 'TEST-A', 'Cerere Test Alpha', true),
  ('cc000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid, 'TEST-B', 'Cerere Test Beta', true)
ON CONFLICT DO NOTHING;

-- 8. Create cereri in each primarie
INSERT INTO public.cereri (id, primarie_id, tip_cerere_id, solicitant_id, numar_inregistrare, date_formular, status)
VALUES
  ('dd000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid,
   'cc000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'TX-TE-2026-00001', '{"test": "alpha"}'::jsonb, 'depusa'),
  ('dd000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid,
   'cc000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
   'TY-TE-2026-00001', '{"test": "beta"}'::jsonb, 'depusa');

-- 9. Create plati in each primarie
INSERT INTO public.plati (id, primarie_id, cerere_id, utilizator_id, suma, status)
VALUES
  ('ee000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid,
   'dd000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   50.00, 'pending'),
  ('ee000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid,
   'dd000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
   75.00, 'pending');

-- 10. Create documente in each primarie
INSERT INTO public.documente (id, primarie_id, cerere_id, incarcat_de_id, nume_fisier, tip_fisier, marime_bytes, storage_path, tip_document)
VALUES
  ('ff000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid,
   'dd000000-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'doc_alpha.pdf', 'pdf', 1024, 'test/alpha/doc.pdf', 'cerere'),
  ('ff000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid,
   'dd000000-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
   'doc_beta.pdf', 'pdf', 2048, 'test/beta/doc.pdf', 'cerere');

-- 11. Create notificari in each primarie
INSERT INTO public.notificari (id, primarie_id, utilizator_id, titlu, mesaj, tip)
VALUES
  ('aa000000-0000-0000-0000-000000000001'::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid,
   '11111111-1111-1111-1111-111111111111'::uuid, 'Notificare Alpha', 'Test msg alpha', 'cerere'),
  ('aa000000-0000-0000-0000-000000000002'::uuid, 'b0000000-0000-0000-0000-000000000002'::uuid,
   '22222222-2222-2222-2222-222222222222'::uuid, 'Notificare Beta', 'Test msg beta', 'cerere');


-- =============================================================================
-- HELPER: Set request context for a specific user + primarie
-- Simulates what PostgREST db_pre_request (set_request_context) does.
-- Must be called before each test group since pgTAP does NOT invoke db_pre_request.
-- =============================================================================

CREATE OR REPLACE FUNCTION _test_set_context(p_user_id uuid, p_primarie_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Simulate JWT claims (sub = user_id)
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true  -- local to transaction
  );
  -- Simulate request headers (x-primarie-id)
  PERFORM set_config(
    'request.headers',
    json_build_object('x-primarie-id', p_primarie_id::text)::text,
    true
  );
  -- Call the actual context setter (same as db_pre_request)
  PERFORM public.set_request_context();
END;
$$;


-- =============================================================================
-- TEST GROUP 1: Cross-primarie SELECT isolation on cereri
-- =============================================================================

-- Switch to authenticated role to activate RLS
SET LOCAL role TO 'authenticated';

-- Set context: User A in Primarie Alpha
SELECT _test_set_context(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid
);

-- Test 1: User A sees own cereri from Primarie Alpha
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE id = 'dd000000-0000-0000-0000-000000000001'::uuid),
  1,
  'User A sees own cerere in Primarie Alpha'
);

-- Test 2: User A sees ZERO cereri from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE id = 'dd000000-0000-0000-0000-000000000002'::uuid),
  0,
  'User A cannot see cereri from Primarie Beta'
);

-- Set context: User B in Primarie Beta
SELECT _test_set_context(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid
);

-- Test 3: User B sees own cereri from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE id = 'dd000000-0000-0000-0000-000000000002'::uuid),
  1,
  'User B sees own cerere in Primarie Beta'
);

-- Test 4: User B sees ZERO cereri from Primarie Alpha
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE id = 'dd000000-0000-0000-0000-000000000001'::uuid),
  0,
  'User B cannot see cereri from Primarie Alpha'
);


-- =============================================================================
-- TEST GROUP 2: Cross-primarie SELECT isolation on plati, documente, notificari
-- =============================================================================

-- Set context: User A in Primarie Alpha
SELECT _test_set_context(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid
);

-- Test 5: User A sees ZERO plati from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.plati WHERE id = 'ee000000-0000-0000-0000-000000000002'::uuid),
  0,
  'User A cannot see plati from Primarie Beta'
);

-- Test 6: User A sees ZERO documente from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.documente WHERE id = 'ff000000-0000-0000-0000-000000000002'::uuid),
  0,
  'User A cannot see documente from Primarie Beta'
);

-- Test 7: User A sees ZERO notificari from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.notificari WHERE id = 'aa000000-0000-0000-0000-000000000002'::uuid),
  0,
  'User A cannot see notificari from Primarie Beta'
);

-- Test 8: User A sees own plati in Primarie Alpha
SELECT is(
  (SELECT count(*)::int FROM public.plati WHERE id = 'ee000000-0000-0000-0000-000000000001'::uuid),
  1,
  'User A sees own plata in Primarie Alpha'
);


-- =============================================================================
-- TEST GROUP 3: user_primarii isolation
-- =============================================================================

-- Set context: User A in Primarie Alpha
SELECT _test_set_context(
  '11111111-1111-1111-1111-111111111111'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid
);

-- Test 9: User A can see own user_primarii entries
SELECT ok(
  (SELECT count(*) > 0 FROM public.user_primarii WHERE user_id = '11111111-1111-1111-1111-111111111111'::uuid),
  'User A can see own user_primarii entries'
);

-- Test 10: User A cannot see User B user_primarii entries
SELECT is(
  (SELECT count(*)::int FROM public.user_primarii WHERE user_id = '22222222-2222-2222-2222-222222222222'::uuid),
  0,
  'User A cannot see User B user_primarii entries'
);


-- =============================================================================
-- TEST GROUP 4: Role-based isolation (functionar cross-primarie)
-- =============================================================================

-- Set context: User C (functionar) in Primarie Alpha
SELECT _test_set_context(
  '33333333-3333-3333-3333-333333333333'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid
);

-- Test 11: Functionar in Primarie Alpha can see cereri in Primarie Alpha
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE primarie_id = 'a0000000-0000-0000-0000-000000000001'::uuid),
  1,
  'Functionar in Primarie Alpha can see Alpha cereri'
);

-- Test 12: Functionar in Primarie Alpha cannot see cereri from Primarie Beta
SELECT is(
  (SELECT count(*)::int FROM public.cereri WHERE primarie_id = 'b0000000-0000-0000-0000-000000000002'::uuid),
  0,
  'Functionar in Primarie Alpha cannot see Primarie Beta cereri'
);


-- =============================================================================
-- TEST GROUP 5: No primarie context = no access
-- =============================================================================

-- Set context: User A with NO primarie context (simulates missing x-primarie-id header)
SELECT set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111'::text, 'role', 'authenticated')::text, true);
SELECT set_config('request.headers', '{}'::text, true);
SELECT public.set_request_context();

-- Test 13: Without primarie context, User A sees no cereri via staff policy
-- (citizen policy still matches on solicitant_id + primarie_id, but primarie_id = NULL fails)
SELECT is(
  (SELECT count(*)::int FROM public.cereri),
  0,
  'Without primarie context header, user sees zero cereri'
);

-- Test 14: Without primarie context, User A still sees own notificari (notificari uses utilizator_id only)
SELECT is(
  (SELECT count(*)::int FROM public.notificari WHERE utilizator_id = '11111111-1111-1111-1111-111111111111'::uuid),
  1,
  'Without primarie context, user still sees own notificari (uses utilizator_id)'
);


-- =============================================================================
-- CLEANUP
-- =============================================================================

-- Reset role back to superuser for finish()
RESET role;

-- Drop test helper
DROP FUNCTION IF EXISTS _test_set_context(uuid, uuid);

SELECT * FROM finish();

ROLLBACK;
