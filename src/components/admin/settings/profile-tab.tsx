"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/admin-settings";
import { updateAdminProfile } from "@/actions/admin-settings";
import { InputWithIcon, GradientSaveButton } from "@/components/admin/settings/settings-ui";
import { ClickableAvatar } from "@/components/shared/ClickableAvatar";
import { createClient } from "@/lib/supabase/client";

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
    avatar_url: string | null;
  };
}

// ============================================================================
// Component
// ============================================================================

export function ProfileTab({ initialData }: ProfileTabProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

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

  async function handleAvatarUpload(url: string): Promise<void> {
    // Update user metadata with new avatar URL
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    router.refresh();
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
          <ClickableAvatar
            currentUrl={initialData.avatar_url}
            initials={initials}
            size="lg"
            bucketPath="avatars"
            onUploadSuccess={handleAvatarUpload}
          />
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
              {...register("prenume")}
              defaultValue={fullName}
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
