import { z } from "zod";

// ============================================================================
// Schema 1: Profile (Tab Profil)
// ============================================================================

export const profileSchema = z.object({
  nume: z.string().min(2, "Minim 2 caractere").max(100, "Maxim 100 caractere"),
  prenume: z.string().min(2, "Minim 2 caractere").max(100, "Maxim 100 caractere"),
  email: z.string().email("Email invalid"),
  telefon: z.string().max(20, "Maxim 20 caractere").optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// ============================================================================
// Schema 2: Primarie Config (Tab Primarie)
// ============================================================================

export const primarieConfigSchema = z.object({
  email: z.string().email("Email invalid").optional().or(z.literal("")),
  telefon: z.string().max(50, "Maxim 50 caractere").optional().or(z.literal("")),
  adresa: z.string().max(500, "Maxim 500 caractere").optional().or(z.literal("")),
  program_lucru: z.string().max(200, "Maxim 200 caractere").optional().or(z.literal("")),
  cui: z.string().max(20, "Maxim 20 caractere").optional().or(z.literal("")),
  maintenance_mode: z.boolean(),
  auto_approve: z.boolean(),
  notificari_registrari: z.boolean(),
  notificari_cereri: z.boolean(),
});

export type PrimarieConfigFormValues = z.infer<typeof primarieConfigSchema>;

// ============================================================================
// Schema 3: Notification Preferences (Tab Notificari)
// ============================================================================

const notificationChannelSchema = z.object({
  enabled: z.boolean(),
  cereri: z.boolean(),
  plati: z.boolean(),
  sistem: z.boolean(),
});

export const notificationPrefsSchema = z.object({
  email: notificationChannelSchema,
  push: notificationChannelSchema,
  sms: notificationChannelSchema,
});

export type NotificationPrefsFormValues = z.infer<typeof notificationPrefsSchema>;

// ============================================================================
// Schema 4: Password Change (Tab Securitate)
// ============================================================================

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Parola actuala este obligatorie"),
    newPassword: z.string().min(8, "Minim 8 caractere"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parolele nu coincid",
    path: ["confirmPassword"],
  });

export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

// ============================================================================
// Schema 5: Appearance (Tab Aspect)
// ============================================================================

export const appearanceSchema = z.object({
  accent_preset: z.string(),
});

export type AppearanceFormValues = z.infer<typeof appearanceSchema>;
