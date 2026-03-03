import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Document requirement definition from tipuri_cereri.documente_necesare JSONB.
 */
export interface DocRequirement {
  tip: string;
  denumire: string;
  obligatoriu: boolean;
}

/**
 * Validate that all required documents have been uploaded for a cerere.
 *
 * Cross-references the tipuri_cereri.documente_necesare JSONB (required docs)
 * against the documente table (uploaded docs) for a given cerere.
 *
 * Returns valid: true if all obligatory documents are present,
 * or missing: string[] with the display names of missing documents.
 *
 * @param supabase - Supabase client (server or service role)
 * @param cerereId - The cerere UUID
 * @param tipCerereId - The tip_cerere UUID to look up required documents
 * @returns Object with valid boolean and array of missing document names
 */
export async function validateRequiredDocuments(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  cerereId: string,
  tipCerereId: string
): Promise<{ valid: boolean; missing: string[] }> {
  // 1. Fetch required documents from tipuri_cereri.documente_necesare (JSONB)
  const { data: tipCerere } = await supabase
    .from("tipuri_cereri")
    .select("documente_necesare")
    .eq("id", tipCerereId)
    .single();

  const required = (tipCerere?.documente_necesare as DocRequirement[] | null) ?? [];
  const obligatorii = required.filter((d) => d.obligatoriu);

  if (obligatorii.length === 0) return { valid: true, missing: [] };

  // 2. Fetch uploaded documents for this cerere
  const { data: uploaded } = await supabase
    .from("documente")
    .select("tip_document")
    .eq("cerere_id", cerereId)
    .is("deleted_at", null);

  const uploadedTypes = new Set(
    (uploaded ?? []).map((d: { tip_document: string }) => d.tip_document)
  );

  // 3. Cross-reference: find required docs that haven't been uploaded
  const missing = obligatorii
    .filter((req) => !uploadedTypes.has(req.tip))
    .map((req) => req.denumire);

  return { valid: missing.length === 0, missing };
}
