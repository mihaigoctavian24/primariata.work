// Re-export database types from the generated file
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from "./database.types";

// Table-specific type helpers for easy imports
import type { Tables } from "./database.types";

// Core location types
export type Judet = Tables<"judete">;
export type Localitate = Tables<"localitati">;

// Organization types
export type Primarie = Tables<"primarii">;
export type Utilizator = Tables<"utilizatori">;

// Request management types
export type Cerere = Tables<"cereri">;
export type TipCerere = Tables<"tipuri_cereri">;

// Document types
export type Document = Tables<"documente">;
export type Template = Tables<"templates">;

// Communication types
export type Mesaj = Tables<"mesaje">;
export type Notificare = Tables<"notificari">;

// Payment types
export type Plata = Tables<"plati">;

// Audit types
export type AuditLog = Tables<"audit_log">;
export type StatisticaPublica = Tables<"statistici_publice">;
