"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { ACCENT_PRESETS, useAccentColorStore } from "@/store/accent-color-store";
import { updateAppearance } from "@/actions/admin-settings";
import { cn } from "@/lib/utils";

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
    // Instant preview via Zustand store (updates CSS custom property)
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
    <div className="space-y-6">
      {/* Accent Color Section */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="text-base font-semibold">Culoare Accent</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Alege culoarea principala pentru interfata primariei tale
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ACCENT_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetClick(preset.name)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110",
                    isSelected
                      ? "ring-accent-500 shadow-lg ring-2 ring-offset-2"
                      : "hover:shadow-lg"
                  )}
                  style={{
                    backgroundColor: `oklch(0.65 0.2 ${preset.hue})`,
                  }}
                >
                  {isSelected && <Check className="h-5 w-5 text-white" />}
                </div>
                <span className="text-muted-foreground text-xs">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="from-accent-500 to-accent-600 bg-gradient-to-r text-white"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salveaza Culoare
          </Button>
        </div>
      </div>

      {/* Theme Toggle Section */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="text-base font-semibold">Tema</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Alege intre tema luminoasa si intunecata
        </p>

        <div className="flex items-center justify-between">
          <Label className="text-sm">{isDark ? "Mod Intunecat" : "Mod Luminos"}</Label>
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </div>

      {/* Language Section */}
      <div className="border-border/40 bg-card rounded-xl border p-6">
        <h3 className="text-base font-semibold">Limba</h3>
        <p className="text-muted-foreground mb-4 text-sm">Limba interfetei platformei</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Romana</span>
          </div>
          <span className="bg-accent-500/12 text-accent-700 dark:text-accent-300 rounded-full px-2 py-0.5 text-xs font-medium">
            Coming soon
          </span>
        </div>
      </div>
    </div>
  );
}
