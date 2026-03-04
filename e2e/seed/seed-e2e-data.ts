/**
 * E2E Seed Data Script
 *
 * Idempotent seed script that creates all test data needed for E2E tests.
 * Uses Supabase service-role client to bypass RLS.
 *
 * Can be run standalone: npx tsx e2e/seed/seed-e2e-data.ts
 * Or called from global-setup.ts before tests run.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env vars -- needed when running standalone
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { TEST_USERS, PENDING_USER, TEST_CONFIG } from "./test-users";

// Cerere statuses matching CerereStatus enum
const CERERE_STATUSES = [
  "depusa",
  "in_verificare",
  "in_procesare",
  "in_aprobare",
  "aprobata",
  "respinsa",
  "finalizata",
  "anulata",
] as const;

interface SeedResult {
  users: Record<string, string>; // role -> userId
  primarieId: string;
  tipCerereId: string;
  cerereIds: Record<string, string>; // status -> cerereId
  plataIds: string[];
}

/**
 * Main seed function. Idempotent -- safe to re-run.
 */
export async function seedE2EData(): Promise<SeedResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Ensure .env.local is present."
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // ── Step 1: Resolve test primarie ──────────────────────────────────
  console.log("[seed] Resolving test primarie for Sector 1 Bucuresti...");

  // Find the localitate by slug, then find the primarie for that localitate
  const { data: localitateData } = await supabase
    .from("localitati")
    .select("id")
    .eq("slug", TEST_CONFIG.localitate)
    .maybeSingle();

  let primarieId: string;

  if (localitateData) {
    // Find primarie for this localitate
    const { data: primarieData } = await supabase
      .from("primarii")
      .select("id")
      .eq("localitate_id", localitateData.id)
      .limit(1)
      .maybeSingle();

    if (primarieData) {
      primarieId = primarieData.id;
      console.log(`[seed] Found primarie: ${primarieId} (localitate_id=${localitateData.id})`);
    } else {
      // Create a primarie for this localitate
      console.log(`[seed] No primarie found for localitate ${localitateData.id}, creating one...`);
      const { data: newPrimarie, error: createErr } = await supabase
        .from("primarii")
        .insert({
          localitate_id: localitateData.id,
          slug: `${TEST_CONFIG.judet}/${TEST_CONFIG.localitate}`,
          nume_oficial: "Primaria Sectorului 1 (E2E Test)",
          activa: true,
          setup_complet: true,
          active_modules: ["cereri", "dashboard", "plati", "documente"],
          config: {},
        })
        .select("id")
        .single();

      if (createErr) {
        throw new Error(`Failed to create primarie: ${createErr.message}`);
      }
      primarieId = newPrimarie.id;
      console.log(`[seed] Created primarie: ${primarieId}`);
    }
  } else {
    throw new Error(
      `No localitate found with slug "${TEST_CONFIG.localitate}". ` +
        "Check the localitati table for correct slug values."
    );
  }

  // ── Step 2: Create auth users idempotently ─────────────────────────
  console.log("[seed] Creating/verifying auth users...");

  const allUsers = [...Object.values(TEST_USERS), { ...PENDING_USER, role: "cetatean" as const }];

  const userIds: Record<string, string> = {};

  // List all existing users once
  const { data: existingUsersData } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  const existingUsers = existingUsersData?.users || [];

  for (const user of allUsers) {
    const existing = existingUsers.find((u) => u.email === user.email);
    let userId: string;

    if (existing) {
      userId = existing.id;
      console.log(`[seed] User exists: ${user.email} (${userId})`);

      // Ensure password is correct
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: user.password,
      });
      if (updateErr) {
        console.warn(
          `[seed] Warning: Could not update password for ${user.email}: ${updateErr.message}`
        );
      }
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          prenume: user.prenume,
          nume: user.nume,
        },
      });

      if (createErr) {
        throw new Error(`Failed to create user ${user.email}: ${createErr.message}`);
      }

      userId = newUser.user.id;
      console.log(`[seed] Created user: ${user.email} (${userId})`);
    }

    // Store by email key (use role for TEST_USERS, "pending" for pending user)
    const key =
      user.email === PENDING_USER.email ? "pending" : (user as (typeof TEST_USERS)[string]).role;
    userIds[key] = userId;
  }

  // ── Step 3: Upsert user_primarii ───────────────────────────────────
  console.log("[seed] Upserting user_primarii associations...");

  for (const [role, userId] of Object.entries(userIds)) {
    if (role === "pending") continue; // Handle separately below

    const userDef = TEST_USERS[role];
    const { error: upErr } = await supabase.from("user_primarii").upsert(
      {
        user_id: userId,
        primarie_id: primarieId,
        rol: userDef.role,
        status: "approved",
        permissions: {},
        departament: userDef.departament || null,
      },
      { onConflict: "user_id,primarie_id" }
    );

    if (upErr) {
      console.warn(`[seed] Warning: user_primarii upsert for ${role}: ${upErr.message}`);
    } else {
      console.log(`[seed] user_primarii: ${role} -> approved (${primarieId})`);
    }
  }

  // Pending user for admin approval test
  if (userIds.pending) {
    const { error: pendErr } = await supabase.from("user_primarii").upsert(
      {
        user_id: userIds.pending,
        primarie_id: primarieId,
        rol: "cetatean",
        status: "pending",
        permissions: {},
      },
      { onConflict: "user_id,primarie_id" }
    );

    if (pendErr) {
      console.warn(`[seed] Warning: pending user_primarii upsert: ${pendErr.message}`);
    } else {
      console.log(`[seed] user_primarii: pending -> pending (${primarieId})`);
    }
  }

  // ── Step 4: Ensure tipuri_cereri exists ─────────────────────────────
  console.log("[seed] Ensuring tipuri_cereri exists...");

  let tipCerereId: string;

  const { data: existingTip } = await supabase
    .from("tipuri_cereri")
    .select("id")
    .eq("primarie_id", primarieId)
    .limit(1)
    .maybeSingle();

  if (existingTip) {
    tipCerereId = existingTip.id;
    console.log(`[seed] Found existing tip_cerere: ${tipCerereId}`);
  } else {
    const { data: newTip, error: tipErr } = await supabase
      .from("tipuri_cereri")
      .insert({
        primarie_id: primarieId,
        nume: "Certificat de urbanism",
        cod: "CU-001",
        descriere: "Certificat de urbanism pentru constructii",
        departament_responsabil: "Urbanism",
        necesita_taxa: true,
        valoare_taxa: 50,
        termen_legal_zile: 30,
        campuri_formular: {
          fields: [
            { name: "adresa_teren", label: "Adresa terenului", type: "text", required: true },
            { name: "suprafata", label: "Suprafata (mp)", type: "number", required: true },
          ],
        },
        documente_necesare: ["Extras carte funciara", "Plan de situatie"],
        activ: true,
      })
      .select("id")
      .single();

    if (tipErr) {
      throw new Error(`Failed to create tip_cerere: ${tipErr.message}`);
    }
    tipCerereId = newTip.id;
    console.log(`[seed] Created tip_cerere: ${tipCerereId}`);
  }

  // ── Step 5: Seed 8 cereri (one per status) ─────────────────────────
  console.log("[seed] Seeding cereri in all 8 statuses...");

  const cetateanId = userIds.cetatean;
  const cerereIds: Record<string, string> = {};

  for (let i = 0; i < CERERE_STATUSES.length; i++) {
    const status = CERERE_STATUSES[i];
    const numarInregistrare = `E2E-2026-${String(i + 1).padStart(3, "0")}`;

    // Check if cerere already exists by numar_inregistrare
    const { data: existingCerere } = await supabase
      .from("cereri")
      .select("id")
      .eq("numar_inregistrare", numarInregistrare)
      .maybeSingle();

    if (existingCerere) {
      cerereIds[status] = existingCerere.id;
      console.log(`[seed] Cerere exists: ${numarInregistrare} (${status})`);
      continue;
    }

    const isDepusa = status === "depusa";

    const { data: newCerere, error: cerErr } = await supabase
      .from("cereri")
      .insert({
        numar_inregistrare: numarInregistrare,
        status,
        solicitant_id: cetateanId,
        primarie_id: primarieId,
        tip_cerere_id: tipCerereId,
        necesita_plata: isDepusa, // depusa cerere needs payment for payment tests
        valoare_plata: isDepusa ? 50 : null,
        date_formular: {
          adresa_teren: `Str. Test nr. ${i + 1}`,
          suprafata: (i + 1) * 100,
        },
        observatii_solicitant: status === "respinsa" ? null : `Cerere E2E test - status ${status}`,
        motiv_respingere: status === "respinsa" ? "Document incomplet" : null,
        data_finalizare: status === "finalizata" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (cerErr) {
      console.warn(`[seed] Warning: Failed to insert cerere ${status}: ${cerErr.message}`);
      continue;
    }

    cerereIds[status] = newCerere.id;
    console.log(`[seed] Created cerere: ${numarInregistrare} (${status}) -> ${newCerere.id}`);
  }

  // ── Step 6: Seed 2 plati linked to depusa cerere ───────────────────
  console.log("[seed] Seeding plati...");

  const depusaCerereId = cerereIds.depusa;
  const plataIds: string[] = [];

  if (depusaCerereId) {
    // Check existing plati for this cerere
    const { data: existingPlati } = await supabase
      .from("plati")
      .select("id, status")
      .eq("cerere_id", depusaCerereId);

    if (existingPlati && existingPlati.length >= 2) {
      console.log(`[seed] Plati already exist for cerere ${depusaCerereId}`);
      plataIds.push(...existingPlati.map((p) => p.id));
    } else {
      // Delete any partial plati to re-seed cleanly
      if (existingPlati && existingPlati.length > 0) {
        await supabase.from("plati").delete().eq("cerere_id", depusaCerereId);
      }

      // Pending payment
      const { data: pendingPlata, error: p1Err } = await supabase
        .from("plati")
        .insert({
          cerere_id: depusaCerereId,
          primarie_id: primarieId,
          utilizator_id: cetateanId,
          suma: 50,
          status: "pending",
          metoda_plata: "card",
        })
        .select("id")
        .single();

      if (p1Err) {
        console.warn(`[seed] Warning: pending plata insert: ${p1Err.message}`);
      } else {
        plataIds.push(pendingPlata.id);
        console.log(`[seed] Created pending plata: ${pendingPlata.id}`);
      }

      // Completed payment with chitanta
      const { data: successPlata, error: p2Err } = await supabase
        .from("plati")
        .insert({
          cerere_id: depusaCerereId,
          primarie_id: primarieId,
          utilizator_id: cetateanId,
          suma: 50,
          status: "success",
          metoda_plata: "card",
          transaction_id: "E2E-TXN-001",
        })
        .select("id")
        .single();

      if (p2Err) {
        console.warn(`[seed] Warning: success plata insert: ${p2Err.message}`);
      } else {
        plataIds.push(successPlata.id);
        console.log(`[seed] Created success plata: ${successPlata.id}`);

        // Create chitanta for the success plata
        const { error: chitErr } = await supabase.from("chitante").upsert(
          {
            plata_id: successPlata.id,
            primarie_id: primarieId,
            utilizator_id: cetateanId,
            numar_chitanta: "CHT-E2E-001",
            suma: 50,
            data_emitere: new Date().toISOString().split("T")[0],
            pdf_url: "https://storage.example.com/e2e-test-receipt.pdf",
          },
          { onConflict: "plata_id" }
        );

        if (chitErr) {
          console.warn(`[seed] Warning: chitanta upsert: ${chitErr.message}`);
        } else {
          console.log(`[seed] Created chitanta for plata ${successPlata.id}`);
        }
      }
    }
  } else {
    console.warn("[seed] Warning: No depusa cerere found, skipping plati seed");
  }

  // ── Step 7: Seed 1 document ────────────────────────────────────────
  console.log("[seed] Seeding test document...");

  const aprobataCerereId = cerereIds.aprobata;
  if (aprobataCerereId) {
    const { data: existingDoc } = await supabase
      .from("documente")
      .select("id")
      .eq("cerere_id", aprobataCerereId)
      .limit(1)
      .maybeSingle();

    if (existingDoc) {
      console.log(`[seed] Document already exists for cerere ${aprobataCerereId}`);
    } else {
      const { error: docErr } = await supabase.from("documente").insert({
        cerere_id: aprobataCerereId,
        primarie_id: primarieId,
        incarcat_de_id: cetateanId,
        nume_fisier: "extras-carte-funciara.pdf",
        tip_document: "extras_cf",
        tip_fisier: "application/pdf",
        marime_bytes: 1024,
        storage_path: `documente/${primarieId}/${aprobataCerereId}/extras-carte-funciara.pdf`,
        descriere: "Extras carte funciara - E2E test document",
      });

      if (docErr) {
        console.warn(`[seed] Warning: document insert: ${docErr.message}`);
      } else {
        console.log(`[seed] Created test document for cerere ${aprobataCerereId}`);
      }
    }
  }

  // ── Done ───────────────────────────────────────────────────────────
  console.log("[seed] E2E seed complete!");
  console.log(`[seed] Summary:`);
  console.log(`  - Users: ${Object.keys(userIds).length} (${Object.keys(userIds).join(", ")})`);
  console.log(`  - Primarie: ${primarieId}`);
  console.log(`  - Cereri: ${Object.keys(cerereIds).length} statuses`);
  console.log(`  - Plati: ${plataIds.length}`);

  return {
    users: userIds,
    primarieId,
    tipCerereId,
    cerereIds,
    plataIds,
  };
}

// Allow standalone execution
if (require.main === module) {
  seedE2EData()
    .then(() => {
      console.log("\n[seed] Standalone run completed successfully.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n[seed] Fatal error:", error);
      process.exit(1);
    });
}
