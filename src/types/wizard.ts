import { TipCerere } from "./api";

/**
 * Wizard Steps Enum
 */
export enum WizardStep {
  SELECT_TYPE = 0,
  FILL_DETAILS = 1,
  UPLOAD_DOCUMENTS = 2,
  REVIEW_SUBMIT = 3,
}

/**
 * Wizard step metadata
 */
export interface WizardStepInfo {
  step: WizardStep;
  title: string;
  description: string;
}

/**
 * File upload with preview
 */
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploadProgress: number;
  uploaded: boolean;
  storageUrl?: string;
  error?: string;
}

/**
 * Wizard state for localStorage persistence
 */
export interface WizardState {
  currentStep: WizardStep;
  selectedTipCerere?: TipCerere;
  formData: Record<string, unknown>;
  observatii?: string;
  uploadedFiles: UploadedFile[];
  draftId?: string;
  lastSaved?: string;
}

/**
 * Dynamic form field types based on tip_cerere.campuri_formular
 */
export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "radio";

export interface DynamicFormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select, radio
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

/**
 * Step navigation result
 */
export interface NavigationResult {
  success: boolean;
  error?: string;
}
