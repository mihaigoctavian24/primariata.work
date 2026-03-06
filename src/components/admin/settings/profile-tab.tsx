"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/admin-settings";
import { updateAdminProfile } from "@/actions/admin-settings";

// ============================================================================
// Types
// ============================================================================

interface ProfileTabProps {
  initialData: {
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
    primarie_name: string;
    rol: string;
  };
}

// ============================================================================
// Component
// ============================================================================

export function ProfileTab({ initialData }: ProfileTabProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nume: initialData.nume,
      prenume: initialData.prenume,
      email: initialData.email,
      telefon: initialData.telefon,
    },
  });

  async function onSubmit(values: ProfileFormValues): Promise<void> {
    setIsSaving(true);
    try {
      const result = await updateAdminProfile(values);
      if (result.success) {
        // Check if email was changed (message will mention confirmation)
        if (result.message?.includes("confirmare")) {
          toast.info(result.message);
        } else {
          toast.success(result.message ?? "Profilul a fost actualizat");
        }
      } else {
        toast.error(result.error ?? "Eroare la salvare");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSaving(false);
    }
  }

  // Build initials for avatar
  const initials = `${initialData.prenume.charAt(0)}${initialData.nume.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar + Info Section */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <div className="flex items-center gap-4">
          <div className="from-accent-500 to-accent-600 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {initialData.prenume} {initialData.nume}
            </h2>
            <p className="text-muted-foreground text-sm">{initialData.primarie_name}</p>
            <span className="bg-accent-500/12 text-accent-700 dark:text-accent-300 mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
              {initialData.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-base font-semibold">Informatii Profil</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prenume">Prenume</Label>
              <Input id="prenume" {...register("prenume")} />
              {errors.prenume && <p className="text-sm text-red-500">{errors.prenume.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nume">Nume</Label>
              <Input id="nume" {...register("nume")} />
              {errors.nume && <p className="text-sm text-red-500">{errors.nume.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input id="telefon" {...register("telefon")} placeholder="+40..." />
            {errors.telefon && <p className="text-sm text-red-500">{errors.telefon.message}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="from-accent-500 to-accent-600 bg-gradient-to-r text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salveaza Profil
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
