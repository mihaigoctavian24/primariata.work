"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Smartphone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  notificationPrefsSchema,
  type NotificationPrefsFormValues,
} from "@/lib/validations/admin-settings";
import { updateNotificationPrefs } from "@/actions/admin-settings";
import { AnimatedToggle, GradientSaveButton } from "@/components/admin/settings/settings-ui";
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
  desc: string;
  icon: ComponentType<{ className?: string }>;
}

const CHANNELS: ChannelConfig[] = [
  { key: "email", label: "Email", desc: "Primeste notificari pe email", icon: Mail },
  { key: "push", label: "Push", desc: "Notificari push in browser", icon: Smartphone },
  {
    key: "sms",
    label: "SMS",
    desc: "Notificari prin SMS (cost aditional)",
    icon: MessageSquare,
  },
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
      const currentValues: Record<string, boolean> = {};
      for (const cat of CATEGORIES) {
        currentValues[cat] = watch(`${channel}.${cat}`);
        setValue(`${channel}.${cat}`, false);
      }
      previousValues.current[channel] = currentValues;
    } else {
      const prev = previousValues.current[channel];
      for (const cat of CATEGORIES) {
        setValue(`${channel}.${cat}`, prev?.[cat] ?? true);
      }
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
        <div>
          <h3 className="text-foreground" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Canale de Notificare
          </h3>
          <p className="mt-1 text-gray-600" style={{ fontSize: "0.83rem" }}>
            Configureaza canalele si categoriile de notificari
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {CHANNELS.map((channel) => {
            const isEnabled = watch(`${channel.key}.enabled`);

            return (
              <div key={channel.key}>
                {/* Master toggle row - AnimatedToggle */}
                <div className="flex items-center justify-between border-b border-white/[0.04] py-3">
                  <div>
                    <div className="text-foreground" style={{ fontSize: "0.9rem" }}>
                      {channel.label}
                    </div>
                    <div className="text-gray-600" style={{ fontSize: "0.78rem" }}>
                      {channel.desc}
                    </div>
                  </div>
                  <AnimatedToggle
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleMasterToggle(channel.key, checked)}
                  />
                </div>

                {/* Sub-category toggles - smaller Switch */}
                <div
                  className={`mt-2 space-y-2 transition-opacity ${
                    isEnabled ? "opacity-100" : "pointer-events-none opacity-50"
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center justify-between pl-6">
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

          <GradientSaveButton type="submit" loading={isSaving} label="Salveaza Preferinte" />
        </form>
      </div>
    </div>
  );
}
