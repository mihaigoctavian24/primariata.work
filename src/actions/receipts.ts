"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { generateReceiptPdf } from "@/lib/pdf/receipt-generator";

interface ReceiptResult {
  success: boolean;
  chitantaId?: string;
  error?: string;
}

/**
 * Generate a PDF receipt for a completed payment, upload to Supabase Storage,
 * and insert records in chitante + documente tables.
 *
 * If a chitanta already exists for this plata, returns the existing one.
 *
 * @param plataId - The payment ID to generate receipt for
 * @returns Result with chitanta ID or error
 */
export async function generateAndStoreReceipt(plataId: string): Promise<ReceiptResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Check if chitanta already exists for this plata
    const { data: existingChitanta } = await supabase
      .from("chitante")
      .select("id")
      .eq("plata_id", plataId)
      .maybeSingle();

    if (existingChitanta) {
      return { success: true, chitantaId: existingChitanta.id };
    }

    // Fetch plata with joined cerere, primarie, and user data
    const { data: plata, error: plataError } = await supabase
      .from("plati")
      .select(
        `id, suma, metoda_plata, cerere_id, utilizator_id, primarie_id,
         cerere:cereri(
           id, numar_inregistrare, observatii_solicitant,
           tip_cerere:tipuri_cereri(nume, descriere),
           solicitant:utilizatori!cereri_solicitant_id_fkey(prenume, nume, email)
         )`
      )
      .eq("id", plataId)
      .single();

    if (plataError || !plata) {
      logger.error("Failed to fetch plata for receipt:", plataError);
      return { success: false, error: "Plata nu a fost gasita" };
    }

    // Fetch primarie details
    const { data: primarie, error: primarieError } = await supabase
      .from("primarii")
      .select("id, nume_oficial, adresa, email, telefon, config")
      .eq("id", plata.primarie_id)
      .single();

    if (primarieError || !primarie) {
      logger.error("Failed to fetch primarie for receipt:", primarieError);
      return { success: false, error: "Primaria nu a fost gasita" };
    }

    // Extract CUI from config JSONB
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = primarie.config as Record<string, any> | null;
    const cui = config?.cui ?? "N/A";

    // Generate sequential receipt number: CHT-{YYYY}-{sequential}
    const serviceClient = createServiceRoleClient();
    const year = new Date().getFullYear();
    const { count: existingCount } = await serviceClient
      .from("chitante")
      .select("id", { count: "exact", head: true })
      .eq("primarie_id", primarie.id);

    const sequentialNumber = String((existingCount ?? 0) + 1).padStart(5, "0");
    const numarChitanta = `CHT-${year}-${sequentialNumber}`;

    // Extract cerere data safely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cerere = plata.cerere as any;
    const cerereNumar = cerere?.numar_inregistrare ?? "N/A";
    const cerereType = cerere?.tip_cerere?.nume ?? "Necunoscut";
    const cerereDescriere = cerere?.tip_cerere?.descriere ?? "";
    const cetateanNume = cerere?.solicitant
      ? `${cerere.solicitant.prenume} ${cerere.solicitant.nume}`
      : "Necunoscut";

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://primariata.work"}/verificare/chitanta/${numarChitanta}`;

    // Generate PDF
    const pdfBytes = await generateReceiptPdf({
      numarChitanta,
      suma: plata.suma,
      dataEmitere: new Date(),
      primarieName: primarie.nume_oficial,
      primarieAdresa: primarie.adresa ?? "",
      primarieCui: cui,
      primarieEmail: primarie.email ?? "",
      primarieTelefon: primarie.telefon ?? "",
      cetateanNume,
      cerereNumar,
      cerereType,
      cerereDescriere,
      metodaPlata: plata.metoda_plata ?? "Card",
      verificationUrl,
    });

    // Upload PDF to Supabase Storage bucket 'chitante'
    const storagePath = `${primarie.id}/${numarChitanta}.pdf`;
    const { error: uploadError } = await serviceClient.storage
      .from("chitante")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      logger.error("Failed to upload receipt PDF:", uploadError);
      return { success: false, error: "Eroare la incarcarea chitantei" };
    }

    // Insert chitanta record
    const { data: chitanta, error: chitantaError } = await serviceClient
      .from("chitante")
      .insert({
        plata_id: plataId,
        numar_chitanta: numarChitanta,
        pdf_url: storagePath,
        suma: plata.suma,
        data_emitere: new Date().toISOString(),
        primarie_id: primarie.id,
        utilizator_id: plata.utilizator_id,
        cerere_id: plata.cerere_id,
      })
      .select("id")
      .single();

    if (chitantaError) {
      logger.error("Failed to insert chitanta record:", chitantaError);
      return { success: false, error: "Eroare la salvarea chitantei" };
    }

    // Insert documente record for the receipt
    const cerereId = plata.cerere_id;
    if (cerereId) {
      const { error: docError } = await serviceClient.from("documente").insert({
        cerere_id: cerereId,
        nume_fisier: `Chitanta-${numarChitanta}.pdf`,
        tip_document: "chitanta",
        tip_fisier: "application/pdf",
        storage_path: storagePath,
        marime_bytes: pdfBytes.byteLength,
        este_generat: true,
        incarcat_de_id: user.id,
      });

      if (docError) {
        // Non-critical -- receipt was already created, just log
        logger.error("Failed to insert document record for receipt:", docError);
      }
    }

    logger.info(`Receipt generated: ${numarChitanta} for plata ${plataId}`);
    return { success: true, chitantaId: chitanta.id };
  } catch (error) {
    logger.error("Unexpected error in generateAndStoreReceipt:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}
