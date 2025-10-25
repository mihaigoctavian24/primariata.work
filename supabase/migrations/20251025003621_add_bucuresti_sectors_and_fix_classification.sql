-- Add București Sectors (Sector 1-6) and fix classification
-- Delete old "București" locality entry and add 6 sectors

-- Step 1: Delete incorrect "București" locality entry
DELETE FROM localitati 
WHERE nume IN ('București', 'Bucuresti') 
  AND judet_id = (SELECT id FROM judete WHERE nume = 'București');

-- Step 2: Add București Sectors 1-6
INSERT INTO localitati (judet_id, nume, slug, tip, populatie, coordonate)
SELECT 
  (SELECT id FROM judete WHERE nume = 'București'),
  'Sector ' || sector_num,
  'sector-' || sector_num || '-b',
  'Sector',
  0,
  '(26.1025384,44.4267674)'
FROM generate_series(1, 6) AS sector_num
ON CONFLICT (slug) DO NOTHING;
