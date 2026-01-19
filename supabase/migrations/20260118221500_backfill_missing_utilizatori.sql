-- Migration: 20260118221500_backfill_missing_utilizatori.sql
-- Description: Backfill utilizatori records for existing auth.users created before trigger
-- Database: PostgreSQL 15.6+ (Supabase)
-- Dependencies: 20260117224406_create_utilizatori_auto_creation_trigger.sql
--
-- Purpose: Handle users created before on_auth_user_created trigger was deployed
--
-- Context: Trigger only fires for NEW inserts after deployment.
--          Users created before trigger (including OAuth users) need manual backfill.
--
-- Solution: One-time INSERT to create utilizatori records for all auth.users
--           without corresponding utilizatori records.

BEGIN;

-- =====================================================
-- BACKFILL: Create Missing Utilizatori Records
-- =====================================================

-- Insert utilizatori records for all auth.users that don't have them
-- Uses same logic as handle_new_user() trigger function
INSERT INTO utilizatori (
  id,
  email,
  nume,
  prenume,
  rol,
  activ,
  email_verificat,
  notificari_email,
  notificari_sms,
  limba,
  timezone
)
SELECT
  au.id,
  au.email,
  -- Parse nume (last name after first space, or empty if no space)
  CASE
    WHEN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') != ''
         AND position(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')) > 0
    THEN substring(
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')
      FROM position(' ' IN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '')) + 1
    )
    ELSE ''
  END as nume,
  -- Parse prenume (first name, or email prefix if no full_name)
  CASE
    WHEN COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') != ''
    THEN split_part(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''), ' ', 1)
    ELSE COALESCE(split_part(au.email, '@', 1), 'Utilizator')
  END as prenume,
  'cetatean' as rol,
  true as activ,
  (au.email_confirmed_at IS NOT NULL) as email_verificat,
  true as notificari_email,
  false as notificari_sms,
  'ro' as limba,
  'Europe/Bucharest' as timezone
FROM auth.users au
LEFT JOIN utilizatori u ON au.id = u.id
WHERE u.id IS NULL  -- Only users without utilizatori records
ON CONFLICT (id) DO NOTHING;  -- Skip if record already exists (safety)

-- Log results
DO $$
DECLARE
  backfilled_count INTEGER;
BEGIN
  -- Count how many users were backfilled
  SELECT COUNT(*) INTO backfilled_count
  FROM auth.users au
  LEFT JOIN utilizatori u ON au.id = u.id
  WHERE u.id IS NULL;

  RAISE NOTICE 'Backfilled % utilizatori records for existing users', backfilled_count;
END $$;

COMMIT;

-- =====================================================
-- Verification Query (commented for reference)
-- =====================================================

-- To verify backfill success:
-- SELECT
--   COUNT(*) as total_auth_users,
--   (SELECT COUNT(*) FROM utilizatori) as total_utilizatori,
--   COUNT(*) - (SELECT COUNT(*) FROM utilizatori) as missing_records
-- FROM auth.users;
-- Expected: missing_records = 0

-- Check for users with different names between auth and utilizatori:
-- SELECT
--   au.email,
--   au.raw_user_meta_data->>'full_name' as oauth_name,
--   u.prenume || ' ' || u.nume as utilizatori_name
-- FROM auth.users au
-- JOIN utilizatori u ON au.id = u.id
-- WHERE COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') IS NOT NULL
--   AND COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') != u.prenume || ' ' || u.nume;
