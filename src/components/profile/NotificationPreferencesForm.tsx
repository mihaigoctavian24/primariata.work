"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormData,
} from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, MessageSquare, Bell } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationPreferencesFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function NotificationPreferencesForm({
  onSuccess,
  onError,
}: NotificationPreferencesFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      sms_notifications_enabled: false,
      telefon: "",
    },
  });

  const watchSmsEnabled = watch("sms_notifications_enabled");

  // Fetch current notification preferences from utilizatori table
  useEffect(() => {
    async function fetchPreferences() {
      try {
        setFetchingData(true);
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch from utilizatori table
          const { data: utilizator, error: fetchError } = await supabase
            .from("utilizatori")
            .select("telefon, sms_notifications_enabled")
            .eq("id", user.id)
            .single();

          if (fetchError) {
            console.error("Failed to fetch notification preferences:", fetchError);
            onError?.("Eroare la încărcarea preferințelor de notificare");
            return;
          }

          if (utilizator) {
            setValue("sms_notifications_enabled", utilizator.sms_notifications_enabled || false);
            setValue("telefon", utilizator.telefon || "");
            setSmsEnabled(utilizator.sms_notifications_enabled || false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch preferences:", err);
        onError?.("Eroare la încărcarea preferințelor de notificare");
      } finally {
        setFetchingData(false);
      }
    }

    fetchPreferences();
  }, [setValue, onError]);

  // Update local state when form value changes
  useEffect(() => {
    setSmsEnabled(watchSmsEnabled);
  }, [watchSmsEnabled]);

  const onSubmit = async (data: NotificationPreferencesFormData) => {
    try {
      setLoading(true);
      setSuccess(false);

      // Validate phone number is provided if SMS is enabled
      if (data.sms_notifications_enabled && !data.telefon) {
        onError?.("Trebuie să introduci numărul de telefon pentru a activa notificările SMS");
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not found");
      }

      // Update utilizatori table
      const { error: updateError } = await supabase
        .from("utilizatori")
        .update({
          sms_notifications_enabled: data.sms_notifications_enabled,
          telefon: data.telefon || null,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Success
      setSuccess(true);
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la salvarea preferințelor";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Primește notificări instant prin SMS când cererea ta este procesată, plata este confirmată
          sau statusul se schimbă.
        </AlertDescription>
      </Alert>

      {/* SMS Notifications Toggle */}
      <div className="flex items-start justify-between space-x-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-muted-foreground h-4 w-4" />
            <Label htmlFor="sms_notifications_enabled" className="text-base font-medium">
              Notificări SMS
            </Label>
          </div>
          <p className="text-muted-foreground text-sm">
            Activează pentru a primi SMS când cererea ta este procesată sau plata este confirmată
          </p>
        </div>
        <Switch
          id="sms_notifications_enabled"
          checked={smsEnabled}
          onCheckedChange={(checked) => {
            setValue("sms_notifications_enabled", checked);
            setSmsEnabled(checked);
          }}
          disabled={loading}
        />
      </div>

      {/* Phone Number (E.164 Format) */}
      {smsEnabled && (
        <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
          <Label htmlFor="telefon">
            Număr de telefon <span className="text-destructive">*</span>
          </Label>
          <Input
            id="telefon"
            type="tel"
            placeholder="Ex: +40712345678"
            {...register("telefon")}
            disabled={loading}
          />
          {errors.telefon && <p className="text-destructive text-sm">{errors.telefon.message}</p>}
          <p className="text-muted-foreground text-xs">
            Numărul trebuie să fie în format internațional (E.164). Exemplu: +40712345678
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvează preferințele
        </Button>

        {success && (
          <div className="flex items-center gap-2 text-green-600" role="alert" aria-live="polite">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Preferințe salvate cu succes!</span>
          </div>
        )}
      </div>
    </form>
  );
}
