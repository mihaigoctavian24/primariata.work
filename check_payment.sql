SELECT 
  p.id,
  p.transaction_id,
  p.status,
  p.suma,
  j.slug as judet_slug,
  l.slug as localitate_slug
FROM plati p
JOIN primarii pr ON p.primarie_id = pr.id
JOIN localitati l ON pr.localitate_id = l.id
JOIN judete j ON pr.judet_id = j.id
WHERE p.id = 'f5ec8016-c528-4d09-b528-49ef39695966';
