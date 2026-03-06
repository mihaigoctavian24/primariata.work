"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Database, Check, Server, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  primarieConfigSchema,
  type PrimarieConfigFormValues,
} from "@/lib/validations/admin-settings";
import { updatePrimarieConfig } from "@/actions/admin-settings";
import {
  InputWithIcon,
  GradientSaveButton,
  AnimatedToggle,
} from "@/components/admin/settings/settings-ui";
import { ClickableAvatar } from "@/components/shared/ClickableAvatar";
import { updatePrimarieLogo } from "@/actions/admin-settings";

// ============================================================================
// Types
// ============================================================================

interface PrimarieTabProps {
  primarieId: string;
  initialData: {
    email: string;
    telefon: string;
    adresa: string;
    program_lucru: string;
    nume_oficial: string;
    logo_url: string | null;
    config: {
      maintenance_mode: boolean;
      auto_approve: boolean;
      accent_preset: string;
      cui: string;
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    };
  };
}

// ============================================================================
// Component
// ============================================================================

export function PrimarieTab({ primarieId, initialData }: PrimarieTabProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false);
  const [contactExpanded, setContactExpanded] = useState(false);
  const router = useRouter();

  async function handleLogoUpload(url: string): Promise<void> {
    const result = await updatePrimarieLogo(primarieId, url);
    if (!result.success) {
      toast.error(result.error ?? "Eroare la salvarea logo-ului");
    }
    router.refresh();
  }

  const primarieInitials = initialData.nume_oficial.slice(0, 2).toUpperCase();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrimarieConfigFormValues>({
    resolver: zodResolver(primarieConfigSchema),
    defaultValues: {
      email: initialData.email,
      telefon: initialData.telefon,
      adresa: initialData.adresa,
      program_lucru: initialData.program_lucru,
      cui: initialData.config.cui,
      maintenance_mode: initialData.config.maintenance_mode,
      auto_approve: initialData.config.auto_approve,
      notificari_registrari: initialData.config.notificari_registrari,
      notificari_cereri: initialData.config.notificari_cereri,
    },
  });

  const maintenanceMode = watch("maintenance_mode");
  const autoApprove = watch("auto_approve");
  const notifRegistrari = watch("notificari_registrari");
  const notifCereri = watch("notificari_cereri");

  async function onSubmit(values: PrimarieConfigFormValues): Promise<void> {
    setIsSaving(true);
    try {
      const result = await updatePrimarieConfig(primarieId, values);
      if (result.success) {
        toast.success(result.message ?? "Setarile au fost actualizate");
        if (values.maintenance_mode) {
          document.cookie = "x-maintenance-mode=true; max-age=60; path=/";
        } else {
          document.cookie = "x-maintenance-mode=; max-age=0; path=/";
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

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <ClickableAvatar
            currentUrl={initialData.logo_url}
            initials={primarieInitials}
            size="lg"
            bucketPath="logos"
            onUploadSuccess={handleLogoUpload}
          />
          <h3 className="text-foreground" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Configurare Primarie
          </h3>
        </div>

        {/* Figma 2x2 grid: Nume, Judet, Localitate, CUI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputWithIcon
            icon={Building2}
            label="Nume Primarie"
            value={initialData.nume_oficial}
            readOnly
          />
          <InputWithIcon icon={MapPin} label="Judet" value="--" readOnly />
          <InputWithIcon icon={MapPin} label="Localitate" value="--" readOnly />
          <InputWithIcon
            icon={Database}
            label="CUI"
            placeholder="RO12345678"
            {...register("cui")}
            error={errors.cui?.message}
          />
        </div>

        {/* Toggle rows in 2x2 grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.8rem" }}>
              Aprobare Automata
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Check className="h-4 w-4 text-gray-600" />
              <span className="text-muted-foreground flex-1" style={{ fontSize: "0.88rem" }}>
                Aprobare Automata
              </span>
              <AnimatedToggle
                checked={autoApprove}
                onCheckedChange={(checked) => setValue("auto_approve", checked)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.8rem" }}>
              Mod de Mentenanta
            </label>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Server className="h-4 w-4 text-gray-600" />
              <span className="text-muted-foreground flex-1" style={{ fontSize: "0.88rem" }}>
                Mod de Mentenanta
              </span>
              <AnimatedToggle
                checked={maintenanceMode}
                onCheckedChange={(checked) => setValue("maintenance_mode", checked)}
              />
            </div>
          </div>
        </div>

        {/* Collapsible: Informatii de Contact */}
        <div className="border-t border-white/[0.04] pt-4">
          <button
            type="button"
            onClick={() => setContactExpanded(!contactExpanded)}
            className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-sm font-medium transition-colors"
          >
            <motion.div
              animate={{ rotate: contactExpanded ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
            Informatii de Contact
          </button>

          <AnimatePresence>
            {contactExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primarie-email">Email</Label>
                      <Input id="primarie-email" type="email" {...register("email")} />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primarie-telefon">Telefon</Label>
                      <Input id="primarie-telefon" {...register("telefon")} />
                      {errors.telefon && (
                        <p className="text-sm text-red-500">{errors.telefon.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primarie-adresa">Adresa</Label>
                    <Textarea id="primarie-adresa" rows={3} {...register("adresa")} />
                    {errors.adresa && (
                      <p className="text-sm text-red-500">{errors.adresa.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primarie-program">Program de Lucru</Label>
                    <Input
                      id="primarie-program"
                      {...register("program_lucru")}
                      placeholder="Luni-Vineri, 08:00-16:00"
                    />
                  </div>

                  {/* Notificari toggles */}
                  <div className="space-y-3 border-t border-white/[0.04] pt-4">
                    <h4 className="text-sm font-semibold">Notificari</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Notificari Inregistrari</Label>
                        <p className="text-muted-foreground text-xs">
                          Primeste notificari pentru inregistrari noi
                        </p>
                      </div>
                      <Switch
                        checked={notifRegistrari}
                        onCheckedChange={(checked) => setValue("notificari_registrari", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Notificari Cereri</Label>
                        <p className="text-muted-foreground text-xs">
                          Primeste notificari pentru cereri noi
                        </p>
                      </div>
                      <Switch
                        checked={notifCereri}
                        onCheckedChange={(checked) => setValue("notificari_cereri", checked)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <GradientSaveButton type="submit" loading={isSaving} label="Salveaza" />
      </form>
    </div>
  );
}
