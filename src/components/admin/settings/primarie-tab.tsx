"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  primarieConfigSchema,
  type PrimarieConfigFormValues,
} from "@/lib/validations/admin-settings";
import { updatePrimarieConfig } from "@/actions/admin-settings";

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
        // Set/delete maintenance mode cookie
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
    <div className="space-y-6">
      {/* Read-only header */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="text-base font-semibold">{initialData.nume_oficial}</h3>
        <p className="text-muted-foreground text-sm">Configurare generala a primariei</p>
      </div>

      {/* Config Form */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="mb-4 text-base font-semibold">Informatii de Contact</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primarie-email">Email</Label>
              <Input id="primarie-email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="primarie-telefon">Telefon</Label>
              <Input id="primarie-telefon" {...register("telefon")} />
              {errors.telefon && <p className="text-sm text-red-500">{errors.telefon.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primarie-adresa">Adresa</Label>
            <Textarea id="primarie-adresa" rows={3} {...register("adresa")} />
            {errors.adresa && <p className="text-sm text-red-500">{errors.adresa.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primarie-program">Program de Lucru</Label>
              <Input
                id="primarie-program"
                {...register("program_lucru")}
                placeholder="Luni-Vineri, 08:00-16:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primarie-cui">CUI</Label>
              <Input id="primarie-cui" {...register("cui")} placeholder="RO12345678" />
            </div>
          </div>

          {/* Toggle section */}
          <div className="border-border/40 mt-6 space-y-4 border-t pt-6">
            <h4 className="text-sm font-semibold">Configurare Avansata</h4>

            {/* Maintenance Mode */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="maintenance-mode" className="text-sm font-medium">
                    Mod Mentenanta
                  </Label>
                  {maintenanceMode && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Cetatenii nu vor putea accesa platforma
                </p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={maintenanceMode}
                onCheckedChange={(checked) => setValue("maintenance_mode", checked)}
              />
            </div>

            {/* Auto Approve */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="auto-approve" className="text-sm font-medium">
                  Aprobare Automata
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Inregistrarile noi vor fi aprobate automat
                </p>
              </div>
              <Switch
                id="auto-approve"
                checked={autoApprove}
                onCheckedChange={(checked) => setValue("auto_approve", checked)}
              />
            </div>

            {/* Notificari Inregistrari */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="notif-registrari" className="text-sm font-medium">
                  Notificari Inregistrari
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Primeste notificari pentru inregistrari noi
                </p>
              </div>
              <Switch
                id="notif-registrari"
                checked={notifRegistrari}
                onCheckedChange={(checked) => setValue("notificari_registrari", checked)}
              />
            </div>

            {/* Notificari Cereri */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="notif-cereri" className="text-sm font-medium">
                  Notificari Cereri
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Primeste notificari pentru cereri noi
                </p>
              </div>
              <Switch
                id="notif-cereri"
                checked={notifCereri}
                onCheckedChange={(checked) => setValue("notificari_cereri", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="from-accent-500 to-accent-600 bg-gradient-to-r text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salveaza Setari
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
