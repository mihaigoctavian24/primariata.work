"use server";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Document with cerere context for display in /documente page.
 */
export interface DocumentWithCerere {
  id: string;
  nume_fisier: string;
  tip_document: string;
  tip_fisier: string;
  marime_bytes: number;
  storage_path: string;
  created_at: string | null;
  este_generat: boolean | null;
  cerere_id: string | null;
  cerere_numar: string | undefined;
}

/**
 * Categorized user documents for display.
 */
export interface CategorizedDocuments {
  incarcate: DocumentWithCerere[];
  chitante: DocumentWithCerere[];
  confirmari: DocumentWithCerere[];
  totalCount: number;
}

/**
 * Public form template from tipuri_cereri.
 */
export interface PublicForm {
  id: string;
  nume: string;
  descriere: string | null;
  cod: string;
  departament_responsabil: string | null;
  template_document_id: string | null;
}

/**
 * Grouped public forms by department/category.
 */
export interface GroupedPublicForms {
  [category: string]: PublicForm[];
}

/**
 * Result types for Server Actions.
 */
type DocumentsResult =
  | { success: true; data: CategorizedDocuments }
  | { success: false; error: string };

type PublicFormsResult =
  | { success: true; data: GroupedPublicForms }
  | { success: false; error: string };

type SignedUrlResult = { success: true; url: string } | { success: false; error: string };

/**
 * Fetch all documents for the current user, categorized into:
 * - "Incarcate de mine": user-uploaded documents (este_generat = false)
 * - "Chitante": tip_document = 'chitanta'
 * - "Confirmari": system-generated docs that are not chitante
 *
 * RLS handles primarie filtering automatically.
 */
export async function fetchUserDocuments(): Promise<DocumentsResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("documente")
      .select(
        `
        id, nume_fisier, tip_document, tip_fisier, marime_bytes,
        storage_path, created_at, este_generat, cerere_id,
        cereri(numar_inregistrare)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user documents:", error);
      return { success: false, error: "Nu s-au putut incarca documentele" };
    }

    const documents: DocumentWithCerere[] = (data ?? []).map((d) => ({
      id: d.id,
      nume_fisier: d.nume_fisier,
      tip_document: d.tip_document,
      tip_fisier: d.tip_fisier,
      marime_bytes: d.marime_bytes,
      storage_path: d.storage_path,
      created_at: d.created_at,
      este_generat: d.este_generat,
      cerere_id: d.cerere_id,
      cerere_numar:
        (d.cereri as unknown as { numar_inregistrare: string } | null)?.numar_inregistrare ??
        undefined,
    }));

    // Categorize documents
    const incarcate: DocumentWithCerere[] = [];
    const chitante: DocumentWithCerere[] = [];
    const confirmari: DocumentWithCerere[] = [];

    for (const doc of documents) {
      if (doc.tip_document === "chitanta") {
        chitante.push(doc);
      } else if (doc.este_generat === true && doc.tip_document !== "chitanta") {
        confirmari.push(doc);
      } else {
        incarcate.push(doc);
      }
    }

    return {
      success: true,
      data: {
        incarcate,
        chitante,
        confirmari,
        totalCount: documents.length,
      },
    };
  } catch (err) {
    logger.error("Unexpected error in fetchUserDocuments:", err);
    return { success: false, error: "Eroare neasteptata" };
  }
}

/**
 * Map department code to a Romanian category label.
 */
function getCategoryLabel(departament: string | null, cod: string): string {
  if (departament) {
    const labels: Record<string, string> = {
      urbanism: "Urbanism",
      stare_civila: "Stare Civila",
      fiscal: "Fiscal",
      social: "Asistenta Sociala",
      mediu: "Mediu",
      transport: "Transport",
      administrativ: "Administrativ",
    };
    return labels[departament.toLowerCase()] || departament;
  }

  // Fallback: derive from cod prefix
  const prefix = cod.split("-")[0]?.toUpperCase() ?? "";
  const prefixLabels: Record<string, string> = {
    URB: "Urbanism",
    SC: "Stare Civila",
    FIS: "Fiscal",
    SOC: "Asistenta Sociala",
  };
  return prefixLabels[prefix] || "Altele";
}

/**
 * Fetch public form templates from tipuri_cereri.
 * Groups by departament_responsabil or cod prefix.
 * Only returns active form types.
 */
export async function fetchPublicForms(): Promise<PublicFormsResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tipuri_cereri")
      .select("id, nume, descriere, cod, departament_responsabil, template_document_id")
      .eq("activ", true)
      .order("ordine_afisare", { ascending: true });

    if (error) {
      logger.error("Error fetching public forms:", error);
      return { success: false, error: "Nu s-au putut incarca formularele" };
    }

    // Group by category
    const grouped: GroupedPublicForms = {};

    for (const item of data ?? []) {
      const category = getCategoryLabel(item.departament_responsabil, item.cod);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: item.id,
        nume: item.nume,
        descriere: item.descriere,
        cod: item.cod,
        departament_responsabil: item.departament_responsabil,
        template_document_id: item.template_document_id,
      });
    }

    return { success: true, data: grouped };
  } catch (err) {
    logger.error("Unexpected error in fetchPublicForms:", err);
    return { success: false, error: "Eroare neasteptata" };
  }
}

/**
 * Generate a 1-hour signed URL for a document in Supabase Storage.
 * Uses 'cereri-documente' bucket for regular documents.
 * Uses 'chitante' bucket for chitanta-type documents.
 */
export async function getDocumentSignedUrl(documentId: string): Promise<SignedUrlResult> {
  try {
    const supabase = await createClient();

    const { data: doc, error: docError } = await supabase
      .from("documente")
      .select("storage_path, tip_document")
      .eq("id", documentId)
      .is("deleted_at", null)
      .single();

    if (docError || !doc) {
      logger.error("Document not found:", { documentId, error: docError });
      return { success: false, error: "Documentul nu a fost gasit" };
    }

    const bucket = doc.tip_document === "chitanta" ? "chitante" : "cereri-documente";

    const { data: signedUrl, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(doc.storage_path, 3600); // 1 hour

    if (urlError || !signedUrl) {
      logger.error("Failed to generate signed URL:", { documentId, error: urlError });
      return { success: false, error: "Nu s-a putut genera link-ul de acces" };
    }

    return { success: true, url: signedUrl.signedUrl };
  } catch (err) {
    logger.error("Unexpected error in getDocumentSignedUrl:", err);
    return { success: false, error: "Eroare neasteptata" };
  }
}
