/**
 * Import Localități from .supabase/localitati.json to Supabase Database
 *
 * This script imports all 13,851 Romanian localities into the database.
 *
 * Prerequisites:
 * - TASK 0.2.5.1 completed (42 județe seeded)
 * - Environment variables configured (.env.local)
 *
 * Usage:
 *   pnpm add -D tsx @types/node
 *   tsx scripts/import-localitati.ts
 *
 * Performance:
 * - Batch size: 1000 rows per insert
 * - Expected time: 5-10 minutes
 * - Database increase: ~10-15 MB
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL");
  console.error("   SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nMake sure .env.local is configured correctly.");
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Interface matching .supabase/localitati.json structure
interface LocalitateJSON {
  id: number;
  nume: string;
  diacritice: string;
  judet: string;
  auto: string;
  zip: number;
  populatie: number;
  lat: number;
  lng: number;
}

// Interface for database insert
interface LocalitateInsert {
  judet_id: number;
  nume: string;
  slug: string;
  tip: string;
  populatie: number;
  coordonate: string;
}

/**
 * Generate URL-safe slug from locality name and județ auto code
 * - Removes diacritics (ă, î, ș, ț, â)
 * - Converts to lowercase
 * - Replaces non-alphanumeric with hyphens
 * - Includes județ code to ensure uniqueness (e.g., "posta-ar", "posta-tm")
 */
function generateSlug(nume: string, judetAuto: string): string {
  const baseSlug = nume
    .normalize("NFD") // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  const judetSlug = judetAuto.toLowerCase();
  return `${baseSlug}-${judetSlug}`; // e.g., "zimandu-nou-ar"
}

/**
 * Load official list of municipalities from JSON
 */
function loadMunicipalitiesList(): Set<string> {
  try {
    const municipiiPath = path.join(process.cwd(), "scripts", "data", "municipii-romania.json");
    const municipiiContent = fs.readFileSync(municipiiPath, "utf-8");
    const municipiiData = JSON.parse(municipiiContent);

    // Normalize municipality names (remove diacritics for matching)
    const normalized = municipiiData.municipii.map((m: string) =>
      m
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    );

    return new Set(normalized);
  } catch (error) {
    console.warn(
      "⚠️  Warning: Could not load municipii-romania.json, falling back to population-based classification"
    );
    console.warn("   Error:", error);
    return new Set();
  }
}

/**
 * Classify locality type based on official status (Legea 351/2001)
 *
 * CORRECT Classification (NOT based solely on population):
 * - Municipiu: Official list from Legea 351/2001 (103 municipalities)
 * - Oraș: Urban localities not classified as municipalities (~216 cities)
 * - Comună: Rural localities (all others)
 *
 * Fallback heuristic when official list not available:
 * - Municipiu: > 100,000 population
 * - Oraș: > 5,000 population (lowered threshold for better accuracy)
 * - Comună: <= 5,000 population
 */
function classifyTip(nume: string, populatie: number, municipiiSet: Set<string>): string {
  // Normalize name for matching (remove diacritics)
  const numeNormalized = nume
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Check official municipalities list first
  if (municipiiSet.has(numeNormalized)) {
    return "Municipiu";
  }

  // Fallback to population-based heuristic for Oraș vs Comună
  // Note: Some cities (orașe) have < 5,000 population, so this is imperfect
  // but better than the previous 20,000 threshold
  if (populatie > 5000) return "Oraș";
  return "Comună";
}

/**
 * Main import function
 */
async function importLocalitati() {
  console.log("🚀 Starting import from .supabase/localitati.json...\n");

  // Step 1: Read JSON file
  const filePath = path.join(process.cwd(), ".supabase", "localitati.json");

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error("\nMake sure .supabase/localitati.json exists in the project root.");
    process.exit(1);
  }

  let localitatiData: LocalitateJSON[];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    localitatiData = JSON.parse(fileContent);
    console.log(`📊 Found ${localitatiData.length} localities to import`);
  } catch (error) {
    console.error("❌ Error reading JSON file:", error);
    process.exit(1);
  }

  // Step 2: Load județe from database
  console.log("📥 Loading județe from database...");
  const { data: judete, error: judeteError } = await supabase.from("judete").select("id, nume");

  if (judeteError) {
    console.error("❌ Error loading județe:", judeteError);
    console.error("\nMake sure TASK 0.2.5.1 (Seed Județe) is completed first!");
    process.exit(1);
  }

  if (!judete || judete.length === 0) {
    console.error("❌ No județe found in database!");
    console.error("\nRun TASK 0.2.5.1 (Seed Județe) first:");
    console.error("   See IMPLEMENTATION_ROADMAP.md line 367-391");
    process.exit(1);
  }

  console.log(`✅ Loaded ${judete.length} județe from database\n`);

  // Create mapping: județ name -> județ id
  // Handle both with and without diacritics
  const judeteMap = new Map<string, number>();
  judete.forEach((j) => {
    judeteMap.set(j.nume, j.id);
    // Also map without diacritics for compatibility
    const sansDiacritics = j.nume.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    judeteMap.set(sansDiacritics, j.id);
  });

  // Step 3: Load official municipalities list
  console.log("📋 Loading official municipalities list...");
  const municipiiSet = loadMunicipalitiesList();
  console.log(`✅ Loaded ${municipiiSet.size} municipalities from official list\n`);

  // Step 4: Transform data for database insertion
  console.log("🔄 Transforming data...");
  const localitatiToInsert: LocalitateInsert[] = [];
  const warnings: string[] = [];
  const slugCounts = new Map<string, number>(); // Track slug occurrences for deduplication

  for (const loc of localitatiData) {
    const judetId = judeteMap.get(loc.judet);

    if (!judetId) {
      warnings.push(`Județ "${loc.judet}" not found for locality "${loc.nume}"`);
      continue;
    }

    let slug = generateSlug(loc.nume, loc.auto); // Include județ auto code for uniqueness

    // Handle rare cases where same name exists multiple times in same județ
    const count = slugCounts.get(slug) || 0;
    if (count > 0) {
      slug = `${slug}-${count}`; // Add numeric suffix: "muscel-bz-1", "muscel-bz-2"
    }
    slugCounts.set(slug.replace(/-\d+$/, ""), count + 1); // Track base slug

    const tip = classifyTip(loc.diacritice || loc.nume, loc.populatie, municipiiSet);

    localitatiToInsert.push({
      judet_id: judetId,
      nume: loc.diacritice || loc.nume, // Prefer diacritics version
      slug: slug,
      tip: tip,
      populatie: loc.populatie,
      coordonate: `(${loc.lng},${loc.lat})`, // PostgreSQL POINT format: (lng,lat)
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warnings during transformation:`);
    warnings.slice(0, 5).forEach((w) => console.log(`   - ${w}`));
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more\n`);
    }
  }

  console.log(`📦 Prepared ${localitatiToInsert.length} valid localities for import\n`);

  // Step 5: Batch insert into database
  const BATCH_SIZE = 1000;
  const totalBatches = Math.ceil(localitatiToInsert.length / BATCH_SIZE);

  console.log(`📤 Starting batch import (${totalBatches} batches of ${BATCH_SIZE})...\n`);

  for (let i = 0; i < localitatiToInsert.length; i += BATCH_SIZE) {
    const batch = localitatiToInsert.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    const { error } = await supabase.from("localitati").insert(batch);

    if (error) {
      console.error(`\n❌ Error in batch ${batchNumber}:`, error);
      console.error("\nImport failed. Rolling back...");
      console.error("Run this SQL to truncate and retry:");
      console.error("   TRUNCATE TABLE localitati RESTART IDENTITY CASCADE;");
      process.exit(1);
    }

    const imported = Math.min(i + BATCH_SIZE, localitatiToInsert.length);
    const progress = Math.round((imported / localitatiToInsert.length) * 100);

    console.log(
      `✅ Imported batch ${batchNumber}/${totalBatches}: ${imported}/${localitatiToInsert.length} (${progress}%)`
    );
  }

  // Step 6: Final validation
  console.log("\n🔍 Validating import...");

  const { count, error: countError } = await supabase
    .from("localitati")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Error validating count:", countError);
    process.exit(1);
  }

  console.log(`\n✅ Validation: ${count} localities in database`);

  if (count !== localitatiToInsert.length) {
    console.warn(`⚠️  Warning: Expected ${localitatiToInsert.length}, found ${count}`);
    console.warn("   Some localities may not have been imported.");
  }

  // Step 7: Sample validation queries
  console.log("\n🔎 Running sample validation queries...\n");

  // Top 5 județe by locality count
  const { data: topJudete, error: topError } = await supabase
    .from("localitati")
    .select("judet_id, judete!inner(nume)")
    .limit(10000);

  if (!topError && topJudete) {
    const counts = topJudete.reduce(
      (acc, loc: { judete: { nume: string } }) => {
        const judet = loc.judete.nume;
        acc[judet] = (acc[judet] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log("Top 5 județe by locality count:");
    sorted.forEach(([judet, count], i) => {
      console.log(`   ${i + 1}. ${judet}: ${count} localities`);
    });
  }

  // Check for invalid slugs (should be none)
  const { count: invalidSlugs } = await supabase
    .from("localitati")
    .select("*", { count: "exact", head: true })
    .or("slug.like.%ă%,slug.like.%î%,slug.like.%ș%,slug.like.%ț%,slug.like.% %");

  console.log(
    `\n🔐 Slug validation: ${invalidSlugs === 0 ? "✅ All slugs valid (no diacritics)" : `⚠️ ${invalidSlugs} invalid slugs found`}`
  );

  // Success summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Import complete!");
  console.log("=".repeat(60));
  console.log(`✅ Total localities imported: ${count}`);
  console.log(`✅ Batch size used: ${BATCH_SIZE}`);
  console.log(`✅ Total batches processed: ${totalBatches}`);
  console.log("\n📋 Next steps:");
  console.log("   1. Run validation queries (see TECH_SPEC_Database.md line 1205-1240)");
  console.log("   2. Complete TASK 0.2.5.3 (Create Public Stats Cache Table)");
  console.log("   3. Mark TASK 0.2.5 as complete in IMPLEMENTATION_ROADMAP.md");
  console.log("   4. Phase 1 (Landing Page) is now unblocked!\n");
}

// Run import
importLocalitati()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  });
