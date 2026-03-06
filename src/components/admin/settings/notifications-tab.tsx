"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Smartphone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  notificationPrefsSchema,
  type NotificationPrefsFormValues,
} from "@/lib/validations/admin-settings";
import { updateNotificationPrefs } from "@/actions/admin-settings";
import type { ComponentType } from "react";

// ============================================================================
// Types
// ============================================================================

interface NotificationsTabProps {
  initialData: NotificationPrefsFormValues;
}

interface ChannelConfig {
  key: "email" | "push" | "sms";
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const CHANNELS: ChannelConfig[] = [
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Smartphone },
  { key: "sms", label: "SMS", icon: MessageSquare },
];

const CATEGORIES = ["cereri", "plati", "sistem"] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  cereri: "Cereri",
  plati: "Plati",
  sistem: "Sistem",
};

// ============================================================================
// Component
// ============================================================================

export function NotificationsTab({ initialData }: NotificationsTabProps): React.JSX.Element {
  const [isSaving, setIsSaving] = useState(false);

  // Store previous category values so we can restore on master toggle ON
  const previousValues = useRef<Record<string, Record<string, boolean>>>({});

  const { handleSubmit, setValue, watch } = useForm<NotificationPrefsFormValues>({
    resolver: zodResolver(notificationPrefsSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: NotificationPrefsFormValues): Promise<void> {
    setIsSaving(true);
    try {
      const result = await updateNotificationPrefs(values);
      if (result.success) {
        toast.success(result.message ?? "Preferintele au fost salvate");
      } else {
        toast.error(result.error ?? "Eroare la salvare");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSaving(false);
    }
  }

  function handleMasterToggle(channel: "email" | "push" | "sms", enabled: boolean): void {
    setValue(`${channel}.enabled`, enabled);

    if (!enabled) {
      // Save current category values before disabling
      const currentValues: Record<string, boolean> = {};
      for (const cat of CATEGORIES) {
        currentValues[cat] = watch(`${channel}.${cat}`);
        setValue(`${channel}.${cat}`, false);
      }
      previousValues.current[channel] = currentValues;
    } else {
      // Restore previous values or default to true
      const prev = previousValues.current[channel];
      for (const cat of CATEGORIES) {
        setValue(`${channel}.${cat}`, prev?.[cat] ?? true);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="text-base font-semibold">Preferinte Notificari</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Configureaza canalele si categoriile de notificari
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isEnabled = watch(`${channel.key}.enabled`);

            return (
              <div key={channel.key} className="border-border/40 rounded-lg border p-4">
                {/* Channel header with master toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="text-muted-foreground h-5 w-5" />
                    <Label className="text-sm font-semibold">{channel.label}</Label>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleMasterToggle(channel.key, checked)}
                  />
                </div>

                {/* Category toggles */}
                <div
                  className={`mt-4 space-y-3 transition-opacity ${
                    isEnabled ? "opacity-100" : "pointer-events-none opacity-50"
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center justify-between pl-8">
                      <Label className="text-muted-foreground text-sm">
                        {CATEGORY_LABELS[cat]}
                      </Label>
                      <Switch
                        checked={watch(`${channel.key}.${cat}`)}
                        onCheckedChange={(checked) => setValue(`${channel.key}.${cat}`, checked)}
                        disabled={!isEnabled}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="from-accent-500 to-accent-600 bg-gradient-to-r text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salveaza Preferinte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
