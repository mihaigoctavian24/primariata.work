/**
 * Check User Location in Database
 *
 * Verifies that the user's location was correctly updated in the database
 * after changing location via LocationWheelPickerForm.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserLocation() {
  console.log("🔍 Checking user location in database...\n");

  // Get user data
  const { data: user, error } = await supabase
    .from("utilizatori")
    .select("id, email, localitate_id, primarie_id")
    .eq("email", "octmihai@gmail.com")
    .single();

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log("👤 User:", user.email);
  console.log("📍 localitate_id:", user.localitate_id);
  console.log("🏛️  primarie_id:", user.primarie_id);

  // Get localitate details
  const { data: localitate } = await supabase
    .from("localitati")
    .select("id, nume, slug, judet_id")
    .eq("id", user.localitate_id)
    .single();

  if (localitate) {
    console.log("\n📋 Localitate details:");
    console.log("   ID:", localitate.id);
    console.log("   Nume:", localitate.nume);
    console.log("   Slug:", localitate.slug);

    // Get județ details
    const { data: judet } = await supabase
      .from("judete")
      .select("id, nume, slug")
      .eq("id", localitate.judet_id)
      .single();

    if (judet) {
      console.log("\n🗺️  Județ details:");
      console.log("   ID:", judet.id);
      console.log("   Nume:", judet.nume);
      console.log("   Slug:", judet.slug);
    }
  }

  // Expected values for Cluj-Napoca
  console.log("\n✅ Expected values:");
  console.log("   localitate_id: 13816 (Cluj-Napoca)");
  console.log("   Județ: Cluj (ID: 12)");

  if (user.localitate_id === 13816) {
    console.log("\n✅ SUCCESS! Database updated correctly to Cluj-Napoca!");
  } else {
    console.log("\n❌ FAILURE! Database NOT updated. Still showing old location.");
  }
}

checkUserLocation().catch(console.error);
