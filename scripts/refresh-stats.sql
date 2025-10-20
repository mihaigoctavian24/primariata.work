-- Refresh Public Statistics Cache
-- This function updates the statistici_publice table with current counts
-- Run this after seeding data or periodically via cron job

-- Function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_public_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update localitati count
  INSERT INTO statistici_publice (tip_statistica, valoare, calculat_la)
  VALUES (
    'localitati_count',
    jsonb_build_object(
      'count', (SELECT COUNT(*) FROM localitati),
      'updated_at', NOW()
    ),
    NOW()
  )
  ON CONFLICT (tip_statistica)
  DO UPDATE SET
    valoare = EXCLUDED.valoare,
    calculat_la = EXCLUDED.calculat_la;

  -- Update primarii active count
  INSERT INTO statistici_publice (tip_statistica, valoare, calculat_la)
  VALUES (
    'primarii_active',
    jsonb_build_object(
      'count', (SELECT COUNT(*) FROM primarii WHERE activa = true),
      'updated_at', NOW()
    ),
    NOW()
  )
  ON CONFLICT (tip_statistica)
  DO UPDATE SET
    valoare = EXCLUDED.valoare,
    calculat_la = EXCLUDED.calculat_la;

  -- Update cereri processed in last month
  INSERT INTO statistici_publice (tip_statistica, valoare, calculat_la)
  VALUES (
    'cereri_processed_month',
    jsonb_build_object(
      'count', (
        SELECT COUNT(*)
        FROM cereri
        WHERE status IN ('finalizata', 'aprobata')
          AND data_finalizare >= NOW() - INTERVAL '30 days'
      ),
      'avg_time_days', (
        SELECT COALESCE(
          AVG(EXTRACT(EPOCH FROM (data_finalizare - created_at)) / 86400)::int,
          0
        )
        FROM cereri
        WHERE status IN ('finalizata', 'aprobata')
          AND data_finalizare >= NOW() - INTERVAL '30 days'
      ),
      'updated_at', NOW()
    ),
    NOW()
  )
  ON CONFLICT (tip_statistica)
  DO UPDATE SET
    valoare = EXCLUDED.valoare,
    calculat_la = EXCLUDED.calculat_la;

  RAISE NOTICE 'Statistics refreshed successfully at %', NOW();
END;
$$;

-- Execute the refresh function
SELECT refresh_public_stats();

-- Verify results
SELECT
  tip_statistica,
  valoare,
  calculat_la
FROM statistici_publice
ORDER BY tip_statistica;
