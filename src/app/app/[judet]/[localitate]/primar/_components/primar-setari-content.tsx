"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { User, Crown, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { updatePrimarSetari } from "@/actions/primar-actions";
import type { PrimarSetariData } from "@/actions/primar-actions";

// ============================================================================
// Schema
// ============================================================================

const setariSchema = z.object({
  displayName: z.string().min(2, "Minim 2 caractere").max(100, "Maxim 100 caractere"),
  mandatStart: z.string().optional(),
  mandatSfarsit: z.string().optional(),
  emailNotifications: z.boolean(),
});

type SetariFormValues = z.infer<typeof setariSchema>;

// ============================================================================
// Props
// ============================================================================

interface PrimarSetariContentProps {
  initialData: {
    success: boolean;
    data?: PrimarSetariData;
    error?: string;
  };
}

// ============================================================================
// Component
// ============================================================================

export function PrimarSetariContent({ initialData }: PrimarSetariContentProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | undefined>();

  const defaultData = initialData.data;

  const form = useForm<SetariFormValues>({
    resolver: zodResolver(setariSchema),
    defaultValues: {
      displayName: defaultData?.displayName ?? "",
      mandatStart: defaultData?.mandatStart ?? "",
      mandatSfarsit: defaultData?.mandatSfarsit ?? "",
      emailNotifications: defaultData?.emailNotifications ?? false,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const mandatStart = watch("mandatStart");
  const mandatSfarsit = watch("mandatSfarsit");
  const emailNotifications = watch("emailNotifications");

  // Compute mandate year range preview
  const mandatPreview =
    mandatStart && mandatSfarsit
      ? `Mandat: ${mandatStart.substring(0, 4)}–${mandatSfarsit.substring(0, 4)}`
      : mandatStart
        ? `Din: ${mandatStart.substring(0, 4)}`
        : null;

  function onSubmit(values: SetariFormValues): void {
    setSaveStatus("idle");
    setSaveError(undefined);

    startTransition(async () => {
      const result = await updatePrimarSetari({
        displayName: values.displayName,
        mandatStart: values.mandatStart || undefined,
        mandatSfarsit: values.mandatSfarsit || undefined,
        emailNotifications: values.emailNotifications,
      });

      if (!result.error) {
        setSaveStatus("success");
        router.refresh();
      } else {
        setSaveStatus("error");
        setSaveError(result.error);
      }
    });
  }

  if (!initialData.success || !defaultData) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>{initialData.error ?? "Eroare la încărcarea datelor."}</span>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15">
          <Crown className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Setări Profil</h1>
          <p className="text-sm text-white/50">
            Gestionează informațiile profilului și mandatul tău
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Card 1: Profil */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          {/* Card header */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
            <User className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Profil</h2>
          </div>
          <div className="space-y-4 p-5">
            {/* Display name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Nume afișat</label>
              <input
                {...register("displayName")}
                type="text"
                placeholder="Prenume Nume"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white transition-colors placeholder:text-white/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-400">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email — read-only */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Email{" "}
                <span className="text-white/30">
                  (modificarea emailului se face prin Supabase Auth)
                </span>
              </label>
              <input
                type="email"
                value={defaultData.email}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-sm text-white/30"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Mandat */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
            <Crown className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Mandat</h2>
          </div>
          <div className="space-y-4 p-5">
            {/* Titlu oficial — read-only */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Titlu oficial
              </label>
              <input
                type="text"
                value={defaultData.titluOficial}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-sm text-white/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Mandat start */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Data început mandat
                </label>
                <input
                  {...register("mandatStart")}
                  type="date"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white [color-scheme:dark] transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>

              {/* Mandat sfarsit */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/60">
                  Data sfârșit mandat
                </label>
                <input
                  {...register("mandatSfarsit")}
                  type="date"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white [color-scheme:dark] transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Mandat preview */}
            {mandatPreview && <p className="text-xs text-amber-400/80">{mandatPreview}</p>}
          </div>
        </div>

        {/* Card 3: Notificări */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
            <Bell className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Notificări</h2>
          </div>
          <div className="p-5">
            <button
              type="button"
              onClick={() => setValue("emailNotifications", !emailNotifications)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                emailNotifications
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white">Notificări prin email</p>
                <p className="text-xs text-white/40">Primește actualizări despre cereri pe email</p>
              </div>
              {/* Toggle */}
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  emailNotifications ? "bg-amber-500" : "bg-white/[0.12]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    emailNotifications ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Save status messages */}
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Setările au fost salvate cu succes.</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{saveError ?? "Eroare la salvarea setărilor."}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
