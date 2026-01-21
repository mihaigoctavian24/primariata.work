/**
 * Seed Test Primării
 *
 * Creates test primării for development and testing purposes.
 * These primării will allow users to test the full authentication + location flow.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestPrimarie {
  localitate_id: number;
  slug: string;
  nume_oficial: string;
  email: string;
  telefon: string;
  adresa: string;
}

const testPrimarii: TestPrimarie[] = [
  {
    localitate_id: 13816, // Cluj-Napoca
    slug: "cluj/cluj-napoca",
    nume_oficial: "Primăria Municipiului Cluj-Napoca",
    email: "contact@primariaclujnapoca.ro",
    telefon: "0264-596.030",
    adresa: "Piața Unirii, nr. 1, Cluj-Napoca 400098",
  },
  {
    localitate_id: 13806, // Arad
    slug: "arad/arad",
    nume_oficial: "Primăria Municipiului Arad",
    email: "primaria@arad.ro",
    telefon: "0257-281.800",
    adresa: "Bulevardul Revoluției, nr. 75, Arad 310130",
  },
  {
    localitate_id: 8133, // Abrud (Alba)
    slug: "alba/abrud",
    nume_oficial: "Primăria Orașului Abrud",
    email: "primaria@abrud.ro",
    telefon: "0258-780.020",
    adresa: "Piața Eroilor, nr. 1, Abrud 515100",
  },
];

async function seedTestPrimarii() {
  console.log("🌱 Starting primării seeding...\n");

  for (const primarie of testPrimarii) {
    console.log(`📍 Processing: ${primarie.nume_oficial}`);

    // Check if primarie already exists
    const { data: existing } = await supabase
      .from("primarii")
      .select("id, nume_oficial")
      .eq("localitate_id", primarie.localitate_id)
      .maybeSingle();

    if (existing) {
      console.log(`   ⚠️  Already exists - skipping`);
      continue;
    }

    // Insert new primarie
    const { data, error } = await supabase
      .from("primarii")
      .insert({
        localitate_id: primarie.localitate_id,
        slug: primarie.slug,
        nume_oficial: primarie.nume_oficial,
        email: primarie.email,
        telefon: primarie.telefon,
        adresa: primarie.adresa,
        activa: true,
        setup_complet: true,
        culoare_primara: "#ef4444", // Red theme
        culoare_secundara: "#ffffff",
        active_modules: ["cereri", "dashboard", "plati"],
        config: {},
      })
      .select("id, nume_oficial")
      .single();

    if (error) {
      console.error(`   ❌ Error:`, error.message);
      continue;
    }

    console.log(`   ✅ Created successfully!`);
    console.log(`      ID: ${data.id}`);
  }

  console.log("\n🎉 Seeding completed!");
  console.log(`\n📊 Summary:`);

  const { count } = await supabase.from("primarii").select("*", { count: "exact", head: true });

  console.log(`   Total primării in database: ${count}`);
}

seedTestPrimarii().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
