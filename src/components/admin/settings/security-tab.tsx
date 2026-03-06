"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Lock, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/lib/validations/admin-settings";
import { changePassword } from "@/actions/admin-settings";
import { InputWithIcon, GradientSaveButton } from "@/components/admin/settings/settings-ui";

// ============================================================================
// Types
// ============================================================================

interface SecurityTabProps {
  has2FA?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function SecurityTab({ has2FA = false }: SecurityTabProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordChangeFormValues): Promise<void> {
    setIsSaving(true);
    try {
      const result = await changePassword(values);
      if (result.success) {
        toast.success(result.message ?? "Parola a fost schimbata");
        reset();
      } else {
        toast.error(result.error ?? "Eroare la schimbarea parolei");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex flex-col gap-5">
        <h3 className="text-foreground" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          Securitate Cont
        </h3>

        {/* 2FA Status */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            {has2FA ? (
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldX className="text-muted-foreground h-5 w-5" />
            )}
            <div>
              <div className="text-foreground" style={{ fontSize: "0.9rem" }}>
                Autentificare in doi pasi (2FA)
              </div>
              <div className="text-gray-600" style={{ fontSize: "0.78rem" }}>
                Configurarea 2FA se face din setarile contului Supabase
              </div>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              has2FA
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {has2FA ? "Activa" : "Inactiva"}
          </span>
        </div>

        {/* Password Change Form */}
        <div>
          <label className="mb-3 block text-gray-400" style={{ fontSize: "0.8rem" }}>
            Schimba parola
          </label>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <InputWithIcon
              icon={Lock}
              type="password"
              placeholder="Parola actuala"
              autoComplete="current-password"
              {...register("currentPassword")}
              error={errors.currentPassword?.message}
            />
            <InputWithIcon
              icon={Shield}
              type="password"
              placeholder="Parola noua"
              autoComplete="new-password"
              {...register("newPassword")}
              error={errors.newPassword?.message}
            />
            <InputWithIcon
              icon={Shield}
              type="password"
              placeholder="Confirma parola noua"
              autoComplete="new-password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <GradientSaveButton
              type="submit"
              loading={isSaving}
              label="Actualizeaza"
              icon={Shield}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
