"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { ACCENT_PRESETS, useAccentColorStore } from "@/store/accent-color-store";
import { updateAppearance } from "@/actions/admin-settings";
import { GradientSaveButton } from "@/components/admin/settings/settings-ui";

// ============================================================================
// Types
// ============================================================================

interface AppearanceTabProps {
  primarieId: string;
  currentPreset: string;
}

// ============================================================================
// Component
// ============================================================================

export function AppearanceTab({
  primarieId,
  currentPreset,
}: AppearanceTabProps): React.JSX.Element {
  const [selectedPreset, setSelectedPreset] = useState(currentPreset);
  const [isSaving, setIsSaving] = useState(false);
  const { setPreset } = useAccentColorStore();
  const { resolvedTheme, setTheme } = useTheme();

  function handlePresetClick(presetName: string): void {
    setSelectedPreset(presetName);
    setPreset(presetName);
  }

  async function handleSave(): Promise<void> {
    setIsSaving(true);
    try {
      const result = await updateAppearance(primarieId, selectedPreset);
      if (result.success) {
        toast.success(result.message ?? "Aspectul a fost salvat");
      } else {
        toast.error(result.error ?? "Eroare la salvare");
      }
    } catch {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSaving(false);
    }
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex flex-col gap-5">
        <h3 className="text-foreground" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          Personalizare
        </h3>

        {/* Accent Color */}
        <div>
          <label className="mb-2 block text-gray-400" style={{ fontSize: "0.8rem" }}>
            Culoare accent
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.name;
              const color = `oklch(0.65 0.2 ${preset.hue})`;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetClick(preset.name)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all hover:scale-110"
                  style={{
                    background: color,
                    boxShadow: isSelected ? `0 0 20px ${color}` : "none",
                    border: isSelected ? "2px solid white" : "2px solid transparent",
                  }}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Toggle */}
        <div>
          <h4 className="text-foreground mb-3 text-sm font-semibold">Tema</h4>
          <div className="flex items-center justify-between">
            <Label className="text-sm">{isDark ? "Mod Intunecat" : "Mod Luminos"}</Label>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>

        {/* Language */}
        <div>
          <h4 className="text-foreground mb-3 text-sm font-semibold">Limba</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Romana</span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                background: "rgba(236,72,153,0.12)",
                color: "rgba(236,72,153,0.8)",
              }}
            >
              Coming soon
            </span>
          </div>
        </div>

        <GradientSaveButton
          type="button"
          onClick={handleSave}
          loading={isSaving}
          label="Salveaza Culoare"
        />
      </div>
    </div>
  );
}
