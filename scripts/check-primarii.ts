/**
 * Check Primării Table
 *
 * Verifies if primării exist in database, especially for Cluj-Napoca
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPrimarii() {
  console.log("🔍 Checking primarii table...\n");

  // Check total count
  const { count } = await supabase.from("primarii").select("*", { count: "exact", head: true });

  console.log(`📊 Total primării in database: ${count}\n`);

  // Check if Cluj-Napoca exists
  const { data: clujPrimarie, error } = await supabase
    .from("primarii")
    .select("id, nume_oficial, localitate_id")
    .eq("localitate_id", 13816)
    .maybeSingle();

  if (error) {
    console.error("❌ Error:", error);
  } else if (clujPrimarie) {
    console.log("✅ Cluj-Napoca primărie EXISTS:");
    console.log("   ID:", clujPrimarie.id);
    console.log("   Nume:", clujPrimarie.nume_oficial);
  } else {
    console.log("❌ Cluj-Napoca primărie NOT FOUND!");
    console.log("   localitate_id 13816 has NO primărie in database\n");

    // Show a few examples of what does exist
    const { data: examples } = await supabase
      .from("primarii")
      .select("id, nume_oficial, localitate_id")
      .limit(5);

    if (examples && examples.length > 0) {
      console.log("📋 Example primării that DO exist:");
      examples.forEach((p: { id: string; nume_oficial: string; localitate_id: number | null }) => {
        console.log(`   - ${p.nume_oficial} (localitate_id: ${p.localitate_id})`);
      });
    }
  }
}

checkPrimarii().catch(console.error);
