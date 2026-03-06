"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Building2, Camera } from "lucide-react";
import { toast } from "sonner";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/admin-settings";
import { updateAdminProfile } from "@/actions/admin-settings";
import { InputWithIcon, GradientSaveButton } from "@/components/admin/settings/settings-ui";

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

  const initials = `${initialData.prenume.charAt(0)}${initialData.nume.charAt(0)}`.toUpperCase();
  const fullName = `${initialData.prenume} ${initialData.nume}`;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Avatar + Info */}
        <div className="flex items-center gap-5">
          <div className="group relative cursor-pointer">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                fontSize: "1.8rem",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-foreground" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {fullName}
            </div>
            <div className="text-muted-foreground" style={{ fontSize: "0.85rem" }}>
              Administrator &middot; {initialData.primarie_name}
            </div>
          </div>
        </div>

        {/* Form - 2x2 grid */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputWithIcon
              icon={User}
              label="Nume complet"
              defaultValue={fullName}
              {...register("prenume")}
              error={errors.prenume?.message || errors.nume?.message}
            />
            <InputWithIcon
              icon={Mail}
              label="Email"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <InputWithIcon
              icon={Phone}
              label="Telefon"
              placeholder="+40..."
              {...register("telefon")}
              error={errors.telefon?.message}
            />
            <InputWithIcon
              icon={Building2}
              label="Institutie"
              value={initialData.primarie_name}
              readOnly
            />
          </div>

          <GradientSaveButton type="submit" loading={isSaving} label="Salveaza" />
        </form>
      </div>
    </div>
  );
}
