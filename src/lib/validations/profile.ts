import { z } from "zod";
import {
  createSafeStringSchema,
  emailSchema,
  optionalPhoneSchema,
  optionalCnpSchema,
  dateStringSchema,
  passwordSchema,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
} from "./common";

/**
 * User Profile Validation Schemas
 *
 * SECURITY ENHANCEMENTS (Issue #93):
 * - Using Romanian-specific validators (CNP, phone)
 * - Enhanced email validation (RFC compliant)
 * - CNP checksum validation
 * - Phone number normalization
 * - XSS sanitization for names
 * - Password complexity requirements
 */

/**
 * Personal Information Form Validation
 *
 * SECURITY: Enhanced with proper Romanian validators
 */
export const personalInfoSchema = z.object({
  // ENHANCED: Length limits and XSS sanitization
  full_name: createSafeStringSchema({
    minLength: 3,
    maxLength: 100,
    sanitize: true,
  }).refine(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (name: any) => {
      // Ensure name contains at least 2 words (first + last name)
      if (!name) return false;
      return name.trim().split(/\s+/).length >= 2;
    },
    { message: "Introduceți numele complet (prenume și nume)" }
  ),

  // ENHANCED: Strict RFC-compliant email validation
  email: emailSchema,

  // ENHANCED: Romanian phone validation with normalization
  phone: optionalPhoneSchema,

  // ENHANCED: ISO date validation with bounds
  birth_date: dateStringSchema
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 150; // Must be adult, reasonable age
      },
      { message: "Vârsta trebuie să fie între 18 și 150 ani" }
    )
    .optional()
    .or(z.literal("")),

  // ENHANCED: CNP validation with checksum algorithm
  cnp: optionalCnpSchema,
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

/**
 * Password Change Form Validation
 *
 * SECURITY: Enhanced with complexity requirements
 */
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Parola curentă este obligatorie"),

    // ENHANCED: Strong password requirements
    new_password: passwordSchema,

    confirm_password: z.string().min(1, "Confirmarea parolei este obligatorie"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Parolele nu coincid",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "Parola nouă trebuie să fie diferită de cea curentă",
    path: ["new_password"],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Avatar Upload Validation
 *
 * SECURITY: Enhanced with MIME validation and size limits
 */
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Fișierul este gol")
    .refine((file) => file.size <= 2 * 1024 * 1024, "Imaginea nu trebuie să depășească 2MB")
    .refine((file) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type), {
      message: "Doar imagini JPEG, PNG sau WebP sunt permise",
    })
    .refine(
      (file) => {
        // Validate file extension matches MIME type
        const ext = file.name.split(".").pop()?.toLowerCase();
        const mimeToExt: Record<string, string[]> = {
          "image/jpeg": ["jpg", "jpeg"],
          "image/png": ["png"],
          "image/webp": ["webp"],
        };
        return mimeToExt[file.type]?.includes(ext || "") ?? false;
      },
      { message: "Extensia fișierului nu corespunde tipului" }
    ),
});

export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;

/**
 * Password Strength Calculator
 * Returns score 0-4: weak (0-1), medium (2), strong (3), very strong (4)
 *
 * Re-exported from common.ts for backward compatibility
 */
export { calculatePasswordStrength, getPasswordStrengthLabel };

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-yellow-500";
    case 3:
      return "bg-green-500";
    case 4:
      return "bg-emerald-600";
    default:
      return "bg-gray-300";
  }
}

/**
 * Notification Preferences Form Validation
 *
 * SECURITY: Enhanced phone validation
 */
export const notificationPreferencesSchema = z
  .object({
    sms_notifications_enabled: z.boolean(),

    // ENHANCED: Romanian phone validation with +40 format
    telefon: optionalPhoneSchema,
  })
  .refine(
    (data) => {
      // If SMS notifications are enabled, phone must be provided
      if (data.sms_notifications_enabled && !data.telefon) {
        return false;
      }
      return true;
    },
    {
      message: "Numărul de telefon este obligatoriu pentru notificări SMS",
      path: ["telefon"],
    }
  );

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

/**
 * Address Form Validation (for user profile)
 *
 * SECURITY: NEW - comprehensive address validation
 */
export const addressSchema = z.object({
  strada: createSafeStringSchema({
    minLength: 3,
    maxLength: 100,
    sanitize: true,
  }),

  numar: createSafeStringSchema({
    minLength: 1,
    maxLength: 20,
    sanitize: true,
  }),

  bloc: createSafeStringSchema({
    maxLength: 20,
    sanitize: true,
    allowEmpty: true,
  }),

  scara: createSafeStringSchema({
    maxLength: 10,
    sanitize: true,
    allowEmpty: true,
  }),

  etaj: createSafeStringSchema({
    maxLength: 10,
    sanitize: true,
    allowEmpty: true,
  }),

  apartament: createSafeStringSchema({
    maxLength: 10,
    sanitize: true,
    allowEmpty: true,
  }),

  cod_postal: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Cod poștal invalid (6 cifre)")
    .optional()
    .or(z.literal("")),

  localitate: createSafeStringSchema({
    minLength: 2,
    maxLength: 100,
    sanitize: true,
  }),

  judet: createSafeStringSchema({
    minLength: 2,
    maxLength: 50,
    sanitize: true,
  }),
});

export type AddressFormData = z.infer<typeof addressSchema>;

/**
 * Email Change Validation
 *
 * SECURITY: NEW - validates email change with confirmation
 */
export const emailChangeSchema = z
  .object({
    new_email: emailSchema,
    confirm_email: emailSchema,
    password: z.string().min(1, "Parola este obligatorie pentru schimbarea email-ului"),
  })
  .refine((data) => data.new_email === data.confirm_email, {
    message: "Email-urile nu coincid",
    path: ["confirm_email"],
  });

export type EmailChangeFormData = z.infer<typeof emailChangeSchema>;

/**
 * Profile Deletion Validation
 *
 * SECURITY: NEW - requires password confirmation
 */
export const profileDeletionSchema = z.object({
  password: z.string().min(1, "Parola este obligatorie"),
  confirmation: z.literal("STERGE").refine((val) => val === "STERGE", {
    message: "Introduceți 'STERGE' pentru confirmare",
  }),
});

export type ProfileDeletionFormData = z.infer<typeof profileDeletionSchema>;

/**
 * Two-Factor Authentication Setup
 *
 * SECURITY: NEW - validates 2FA setup
 */
export const twoFactorSetupSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Codul trebuie să aibă 6 cifre")
    .regex(/^\d{6}$/, "Codul trebuie să conțină doar cifre"),
});

export type TwoFactorSetupFormData = z.infer<typeof twoFactorSetupSchema>;

/**
 * Validate CNP date consistency
 *
 * Extracts birthdate from CNP and validates against provided birth_date
 */
export function validateCnpDateConsistency(cnp: string, birthDate: string): boolean {
  if (!cnp || !birthDate) return false;

  // Extract date from CNP (positions 1-6: YYMMDD)
  const yearCode = cnp.substring(1, 3);
  const monthCode = cnp.substring(3, 5);
  const dayCode = cnp.substring(5, 7);

  // Determine century from first digit
  const sexCentury = parseInt(cnp[0]!);
  let century: number;
  if (sexCentury === 1 || sexCentury === 2) century = 1900;
  else if (sexCentury === 3 || sexCentury === 4) century = 1800;
  else if (sexCentury === 5 || sexCentury === 6) century = 2000;
  else if (sexCentury === 7 || sexCentury === 8)
    century = 2000; // Foreign residents
  else return false;

  const cnpYear = century + parseInt(yearCode);
  const cnpMonth = parseInt(monthCode);
  const cnpDay = parseInt(dayCode);

  // Parse provided birth date
  const parts = birthDate.split("-");
  if (parts.length !== 3) return false;
  const [bdYear, bdMonth, bdDay] = parts.map(Number);

  // Compare
  return cnpYear === bdYear && cnpMonth === bdMonth && cnpDay === bdDay;
}
