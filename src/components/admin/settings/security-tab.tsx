"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  passwordChangeSchema,
  type PasswordChangeFormValues,
} from "@/lib/validations/admin-settings";
import { changePassword } from "@/actions/admin-settings";

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
    <div className="space-y-6">
      {/* 2FA Status */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {has2FA ? (
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldX className="text-muted-foreground h-5 w-5" />
            )}
            <div>
              <h3 className="text-sm font-semibold">Autentificare in doi pasi</h3>
              <p className="text-muted-foreground text-xs">
                Configurarea 2FA se face din setarile contului Supabase
              </p>
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
      </div>

      {/* Password Change Form */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-base font-semibold">Schimba Parola</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Parola Actuala</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Parola Noua</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
            <p className="text-muted-foreground text-xs">Minim 8 caractere</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirma Parola</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="from-accent-500 to-accent-600 bg-gradient-to-r text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schimba Parola
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
