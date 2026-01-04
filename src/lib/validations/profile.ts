import { z } from "zod";

/**
 * Personal Information Form Validation
 */
export const personalInfoSchema = z.object({
  full_name: z
    .string()
    .min(3, "Numele trebuie să conțină cel puțin 3 caractere")
    .max(100, "Numele este prea lung"),

  email: z.string().email("Email invalid"),

  phone: z
    .string()
    .regex(/^(\+4|0)[0-9]{9}$/, "Număr de telefon invalid (ex: 0712345678 sau +40712345678)")
    .optional()
    .or(z.literal("")),

  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalidă")
    .optional()
    .or(z.literal("")),

  cnp: z
    .string()
    .regex(/^[1-9]\d{12}$/, "CNP invalid (13 cifre)")
    .optional()
    .or(z.literal("")),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

/**
 * Password Change Form Validation
 */
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Parola curentă este obligatorie"),

    new_password: z
      .string()
      .min(8, "Parola trebuie să conțină cel puțin 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
      .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),

    confirm_password: z.string().min(1, "Confirmarea parolei este obligatorie"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Parolele nu coincid",
    path: ["confirm_password"],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Avatar Upload Validation
 */
export const avatarUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "Imaginea nu trebuie să depășească 2MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
      "Doar imagini JPEG, PNG sau WebP sunt permise"
    ),
});

export type AvatarUploadFormData = z.infer<typeof avatarUploadSchema>;

/**
 * Password Strength Calculator
 * Returns score 0-4: weak (0-1), medium (2), strong (3), very strong (4)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Get password strength label in Romanian
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Slabă";
    case 2:
      return "Medie";
    case 3:
      return "Puternică";
    case 4:
      return "Foarte puternică";
    default:
      return "Slabă";
  }
}

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
 */
export const notificationPreferencesSchema = z.object({
  sms_notifications_enabled: z.boolean(),

  telefon: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Număr de telefon invalid (format E.164: +40712345678)")
    .optional()
    .or(z.literal("")),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
