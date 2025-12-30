-- =====================================================
-- Seed Data: Tipuri Cereri (Request Types)
-- =====================================================
-- This migration adds standard request types for development
-- Each primărie can customize these or add their own types
-- =====================================================

-- Note: This seed data uses a development primarie
-- In production, each primărie will have their own tipuri_cereri
-- For development, we'll use Sector 1 Bucharest (localitate_id = 13852)

DO $$
DECLARE
  first_primarie_id UUID;
  dev_localitate_id INT := 13852; -- Sector 1 Bucharest (confirmed exists)
  existing_count INT;
BEGIN
  -- Get first primarie_id (or create development primarie if none exists)
  SELECT id INTO first_primarie_id FROM primarii LIMIT 1;

  -- If no primarie exists, create a development one
  IF first_primarie_id IS NULL THEN
    -- Create development primarie using existing Sector 1 Bucharest
    INSERT INTO primarii (
      localitate_id,
      slug,
      nume_oficial,
      email,
      telefon,
      adresa,
      activa
    )
    VALUES (
      dev_localitate_id,               -- Use existing localitate (INTEGER)
      'primaria-sector-1-dev',
      'Primăria Sector 1 (Development)',
      'dev@primariata.work',
      '0212345678',
      'Str. Development Nr. 1, Sector 1',
      TRUE
    )
    RETURNING id INTO first_primarie_id;
  END IF;

  -- Check if tipuri_cereri already exist for this primarie
  SELECT COUNT(*) INTO existing_count
  FROM tipuri_cereri
  WHERE primarie_id = first_primarie_id;

  -- Only insert if no tipuri_cereri exist yet
  IF existing_count = 0 THEN
    -- Insert 5 standard tipuri_cereri for development
    INSERT INTO tipuri_cereri (
      primarie_id,
      cod,
      nume,
      descriere,
      campuri_formular,
      documente_necesare,
      termen_legal_zile,
      necesita_taxa,
      valoare_taxa,
      departament_responsabil,
      activ,
      ordine_afisare
    ) VALUES

    -- 1. Certificat de Naștere
    (
      first_primarie_id,
      'CERT_NASTERE',
      'Certificat de Naștere',
      'Eliberare certificat de naștere pentru nou-născuți sau duplicat',
      '{
        "fields": [
          {
            "id": "nume_copil",
            "label": "Numele copilului",
            "type": "text",
            "required": true,
            "validation": "^[A-ZĂÂÎȘȚ][a-zăâîșț]+( [A-ZĂÂÎȘȚ][a-zăâîșț]+)*$"
          },
          {
            "id": "prenume_copil",
            "label": "Prenumele copilului",
            "type": "text",
            "required": true
          },
          {
            "id": "data_nastere",
            "label": "Data nașterii",
            "type": "date",
            "required": true
          },
          {
            "id": "nume_mama",
            "label": "Numele mamei",
            "type": "text",
            "required": true
          },
          {
            "id": "nume_tata",
            "label": "Numele tatălui",
            "type": "text",
            "required": true
          },
          {
            "id": "spital",
            "label": "Spitalul unde s-a născut",
            "type": "text",
            "required": false
          }
        ]
      }'::jsonb,
      ARRAY[
        'Certificat medical de naștere (original)',
        'Buletinele părinților (copii)',
        'Certificatul de căsătorie al părinților (copie)'
      ],
      10,
      true,
      15.00,
      'Stare Civilă',
      true,
      1
    ),

    -- 2. Certificat de Căsătorie
    (
      first_primarie_id,
      'CERT_CASATORIE',
      'Certificat de Căsătorie',
      'Eliberare certificat de căsătorie (original sau duplicat)',
      '{
        "fields": [
          {
            "id": "nume_mire",
            "label": "Numele mirelui",
            "type": "text",
            "required": true
          },
          {
            "id": "nume_mireasa",
            "label": "Numele miresei",
            "type": "text",
            "required": true
          },
          {
            "id": "data_casatorie",
            "label": "Data căsătoriei",
            "type": "date",
            "required": true
          },
          {
            "id": "motiv_cerere",
            "label": "Motivul cererii",
            "type": "select",
            "required": true,
            "options": ["Pierdere", "Deteriorare", "Prima eliberare"]
          }
        ]
      }'::jsonb,
      ARRAY[
        'Buletinele soților (copii)',
        'Certificatul de căsătorie anterior (dacă există)'
      ],
      10,
      true,
      15.00,
      'Stare Civilă',
      true,
      2
    ),

    -- 3. Autorizație de Construcție
    (
      first_primarie_id,
      'AUTORIZATIE_CONSTRUCTIE',
      'Autorizație de Construcție',
      'Cerere pentru obținere autorizație de construire/desființare',
      '{
        "fields": [
          {
            "id": "tip_lucrare",
            "label": "Tipul lucrării",
            "type": "select",
            "required": true,
            "options": [
              "Construcție nouă",
              "Extindere",
              "Modificare",
              "Consolidare",
              "Desființare"
            ]
          },
          {
            "id": "adresa_lucrare",
            "label": "Adresa lucrării",
            "type": "text",
            "required": true
          },
          {
            "id": "suprafata_construita",
            "label": "Suprafața construită (mp)",
            "type": "number",
            "required": true
          },
          {
            "id": "numar_cadastral",
            "label": "Număr cadastral",
            "type": "text",
            "required": true
          },
          {
            "id": "descriere_lucrare",
            "label": "Descrierea lucrării",
            "type": "textarea",
            "required": true
          }
        ]
      }'::jsonb,
      ARRAY[
        'Plan de situație și delimitare proprietate',
        'Proiect tehnic (autorizat)',
        'Dovada proprietății (extras CF)',
        'Aviz/acord vecinătate',
        'Certificat de urbanism'
      ],
      30,
      true,
      100.00,
      'Urbanism',
      true,
      3
    ),

    -- 4. Certificat Fiscal
    (
      first_primarie_id,
      'CERTIFICAT_FISCAL',
      'Certificat Fiscal',
      'Eliberare certificat fiscal (atestă lipsa sau existența datoriilor)',
      '{
        "fields": [
          {
            "id": "scop_cerere",
            "label": "Scopul cererii",
            "type": "select",
            "required": true,
            "options": [
              "Vânzare/Cumpărare proprietate",
              "Cerere bancă/credit",
              "Alte scopuri"
            ]
          },
          {
            "id": "tip_persoana",
            "label": "Tip persoană",
            "type": "select",
            "required": true,
            "options": ["Persoană fizică", "Persoană juridică"]
          },
          {
            "id": "cnp_cui",
            "label": "CNP/CUI",
            "type": "text",
            "required": true
          }
        ]
      }'::jsonb,
      ARRAY[
        'Buletin/CI (copie)',
        'Dovada plății taxei de timbru'
      ],
      5,
      false,
      0.00,
      'Taxe și Impozite',
      true,
      4
    ),

    -- 5. Permis de Parcare
    (
      first_primarie_id,
      'PERMIS_PARCARE',
      'Permis de Parcare Rezidențială',
      'Eliberare permis de parcare pentru reședinta în zona',
      '{
        "fields": [
          {
            "id": "numar_inmatriculare",
            "label": "Număr înmatriculare",
            "type": "text",
            "required": true,
            "validation": "^[A-Z]{1,2}-[0-9]{2,3}-[A-Z]{3}$"
          },
          {
            "id": "marca_auto",
            "label": "Marca auto",
            "type": "text",
            "required": true
          },
          {
            "id": "model_auto",
            "label": "Model auto",
            "type": "text",
            "required": true
          },
          {
            "id": "adresa_domiciliu",
            "label": "Adresa de domiciliu",
            "type": "text",
            "required": true
          },
          {
            "id": "zona_parcare",
            "label": "Zona de parcare solicitată",
            "type": "select",
            "required": true,
            "options": ["Zona 1 - Centru", "Zona 2 - Rezidențial", "Zona 3 - Periferie"]
          }
        ]
      }'::jsonb,
      ARRAY[
        'Buletin/CI (copie)',
        'Certificat de înmatriculare (copie)',
        'Dovada domiciliului (contract utilități)'
      ],
      15,
      true,
      50.00,
      'Poliție Locală',
      true,
      5
    );
  END IF;

END $$;

-- Add comment
COMMENT ON TABLE tipuri_cereri IS 'Seeded with 5 standard request types for development';
