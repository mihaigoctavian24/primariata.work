/**
 * Cereri status mappings — shared constants for admin cereri operations.
 * Kept separate from "use server" actions file so they can be imported
 * from both server and client components without restriction.
 */

export const DB_TO_UI_STATUS: Record<string, string> = {
  depusa: "depusa",
  in_verificare: "verificare",
  info_suplimentara: "info_supl",
  in_procesare: "procesare",
  aprobata: "aprobata",
  respinsa: "respinsa",
};

export const UI_TO_DB_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(DB_TO_UI_STATUS).map(([k, v]) => [v, k])
);
