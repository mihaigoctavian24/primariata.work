-- =============================================================
-- Seed Test Data for UAT
-- =============================================================
-- Purpose: Give test users approved user_primarii associations
-- and seed coordinates for sector-1-b locality.
--
-- Fixes:
--   GAP 5  - /plati (and all protectedModules) redirect to dashboard
--            because test users lack user_primarii entries
--   GAP 26 - Map widget shows "Coordonatele nu sunt disponibile"
--            because sector-1-b has no lat/lng coordinates
-- =============================================================

-- 1. Seed user_primarii entries for test users
-- This gives test users "approved" association with the active primarie,
-- which is required by middleware protectedModules check to access
-- /cereri, /plati, /documente, /setari, /notificari

INSERT INTO user_primarii (user_id, primarie_id, rol, status)
SELECT u.id, p.id, 'cetatean', 'approved'
FROM auth.users u
CROSS JOIN primarii p
WHERE u.email IN ('cetatean@test.com', 'functionar@test.com', 'admin@test.com')
  AND p.activa = true
ON CONFLICT DO NOTHING;

-- 2. Seed coordinates for Sector 1 Bucuresti (Primaria Sector 1)
-- Coordinates: lat 44.4467, lng 26.0864 (center of Sector 1)
-- Used by CetățeanDashboard map widget to display primarie location

UPDATE localitati
SET latitudine = 44.4467, longitudine = 26.0864
WHERE slug = 'sector-1-b';
