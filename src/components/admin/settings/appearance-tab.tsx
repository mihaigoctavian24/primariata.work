"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
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
  const [selectedLanguage, setSelectedLanguage] = useState("ro");
  const { setPreset } = useAccentColorStore();

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

        {/* Language */}
        <div>
          <label className="mb-2 block text-gray-400" style={{ fontSize: "0.8rem" }}>
            Limba
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-foreground w-full cursor-pointer appearance-none rounded-xl bg-transparent px-3 py-2.5 outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.88rem",
            }}
          >
            <option value="ro">Română</option>
            <option value="en">English</option>
          </select>
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
