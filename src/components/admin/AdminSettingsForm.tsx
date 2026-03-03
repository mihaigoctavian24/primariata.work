"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePrimarieSettings } from "@/actions/dashboard-stats";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";

const primarieSettingsSchema = z.object({
  email: z.string().email("Email invalid").optional().or(z.literal("")),
  telefon: z.string().max(50, "Maxim 50 caractere").optional().or(z.literal("")),
  adresa: z.string().max(500, "Maxim 500 caractere").optional().or(z.literal("")),
  program_lucru: z.string().max(200, "Maxim 200 caractere").optional().or(z.literal("")),
  notificari_registrari: z.boolean(),
  notificari_cereri: z.boolean(),
});

type PrimarieSettingsFormValues = z.infer<typeof primarieSettingsSchema>;

interface AdminSettingsFormProps {
  primarieId: string;
  initialData: {
    email: string | null;
    telefon: string | null;
    adresa: string | null;
    program_lucru: string | null;
    nume_oficial: string;
    config: {
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    } | null;
  };
}

/**
 * AdminSettingsForm component
 * React Hook Form + Zod for primarie info editing with notification preference toggles.
 */
export function AdminSettingsForm({
  primarieId,
  initialData,
}: AdminSettingsFormProps): React.ReactNode {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrimarieSettingsFormValues>({
    resolver: zodResolver(primarieSettingsSchema),
    defaultValues: {
      email: initialData.email ?? "",
      telefon: initialData.telefon ?? "",
      adresa: initialData.adresa ?? "",
      program_lucru: initialData.program_lucru ?? "",
      notificari_registrari: initialData.config?.notificari_registrari ?? true,
      notificari_cereri: initialData.config?.notificari_cereri ?? true,
    },
  });

  const notificariRegistrari = watch("notificari_registrari");
  const notificariCereri = watch("notificari_cereri");

  async function onSubmit(values: PrimarieSettingsFormValues): Promise<void> {
    setIsSubmitting(true);
    try {
      const result = await updatePrimarieSettings(primarieId, {
        email: values.email || undefined,
        telefon: values.telefon || undefined,
        adresa: values.adresa || undefined,
        program_lucru: values.program_lucru || undefined,
        config: {
          notificari_registrari: values.notificari_registrari,
          notificari_cereri: values.notificari_cereri,
        },
      });

      if (result.success) {
        toast.success("Setarile au fost salvate");
      } else {
        toast.error(result.error ?? "Eroare la salvarea setarilor");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Primarie Name (read-only) */}
      <div className="bg-card border-border/40 rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-3">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">{initialData.nume_oficial}</h2>
        </div>

        {/* Info Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@primaria.ro"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="telefon">Telefon</Label>
            <Input id="telefon" type="tel" placeholder="0123 456 789" {...register("telefon")} />
            {errors.telefon && (
              <p className="mt-1 text-sm text-red-500">{errors.telefon.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="adresa">Adresa</Label>
            <Textarea
              id="adresa"
              placeholder="Str. Principala nr. 1, Localitate, Judet"
              rows={3}
              {...register("adresa")}
            />
            {errors.adresa && <p className="mt-1 text-sm text-red-500">{errors.adresa.message}</p>}
          </div>

          <div>
            <Label htmlFor="program_lucru">Program de lucru</Label>
            <Input
              id="program_lucru"
              placeholder="Luni-Vineri: 08:00-16:00"
              {...register("program_lucru")}
            />
            {errors.program_lucru && (
              <p className="mt-1 text-sm text-red-500">{errors.program_lucru.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-card border-border/40 rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Notificari</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="notificari_registrari" className="text-sm font-medium">
                Notificari inregistrari noi
              </Label>
              <p className="text-muted-foreground text-xs">
                Primeste notificari cand un cetatean nou se inregistreaza
              </p>
            </div>
            <Switch
              id="notificari_registrari"
              checked={notificariRegistrari}
              onCheckedChange={(checked) => setValue("notificari_registrari", checked)}
            />
          </div>

          <div className="border-border/40 border-t" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="notificari_cereri" className="text-sm font-medium">
                Notificari schimbari status cereri
              </Label>
              <p className="text-muted-foreground text-xs">
                Primeste notificari cand statusul unei cereri se schimba
              </p>
            </div>
            <Switch
              id="notificari_cereri"
              checked={notificariCereri}
              onCheckedChange={(checked) => setValue("notificari_cereri", checked)}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Se salveaza..." : "Salveaza Setarile"}
      </Button>
    </form>
  );
}
