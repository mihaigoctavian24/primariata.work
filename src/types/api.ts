/**
 * Standard API Response Types
 * Used across all API endpoints for consistent response format
 */

/**
 * Generic API success response wrapper
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp?: string;
    version?: string;
    expiresAt?: string; // For signed URLs and temporary resources
  };
}

/**
 * API error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp?: string;
    request_id?: string;
  };
}

/**
 * Județ type for API responses
 * Matches the database schema but optimized for API consumption
 */
export interface Judet {
  id: number;
  cod: string;
  nume: string;
  slug: string;
  nume_complet: string | null;
}

/**
 * Localitate type for API responses
 * Represents a Romanian locality (comună, oraș, or municipiu)
 */
export interface Localitate {
  id: number;
  judet_id: number | null;
  nume: string;
  slug: string;
  tip: string | null; // "Comună" | "Oraș" | "Municipiu"
  populatie: number | null;
  cod_siruta: string | null;
}

/**
 * Helper type for pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

/**
 * Tip Cerere (Request Type) for API responses
 */
export interface TipCerere {
  id: string;
  cod: string;
  nume: string;
  descriere: string | null;
  campuri_formular: Record<string, unknown>;
  documente_necesare: string[] | null;
  termen_legal_zile: number | null;
  necesita_taxa: boolean;
  valoare_taxa: number | null;
  departament_responsabil: string | null;
  activ: boolean;
  ordine_afisare: number;
}

/**
 * Cerere (Request) for API responses
 */
export interface Cerere {
  id: string;
  primarie_id: string;
  tip_cerere_id: string;
  solicitant_id: string;
  preluat_de_id: string | null;
  numar_inregistrare: string;
  date_formular: Record<string, unknown>;
  observatii_solicitant: string | null;
  status: string;
  raspuns: string | null;
  motiv_respingere: string | null;
  necesita_plata: boolean;
  valoare_plata: number | null;
  plata_efectuata: boolean;
  plata_efectuata_la: string | null;
  data_termen: string | null;
  data_finalizare: string | null;
  created_at: string;
  updated_at: string;
  // Joined data (optional)
  tip_cerere?: TipCerere;
}

/**
 * Document for API responses
 */
export interface Document {
  id: string;
  cerere_id: string;
  nume_fisier: string;
  tip_fisier: string;
  marime_bytes: number;
  storage_path: string;
  tip_document: string;
  descriere: string | null;
  este_generat: boolean;
  este_semnat: boolean;
  created_at: string;
}
