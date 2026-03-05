import { create } from "zustand";

interface AccentPreset {
  name: string;
  hue: number;
  label: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: "crimson", hue: 15, label: "Carmin" },
  { name: "blue", hue: 250, label: "Albastru" },
  { name: "emerald", hue: 160, label: "Smarald" },
  { name: "amber", hue: 85, label: "Chihlimbar" },
  { name: "violet", hue: 300, label: "Violet" },
  { name: "teal", hue: 195, label: "Turcoaz" },
  { name: "rose", hue: 350, label: "Roz" },
  { name: "slate", hue: 260, label: "Ardezie" },
  { name: "orange", hue: 45, label: "Portocaliu" },
  { name: "indigo", hue: 275, label: "Indigo" },
];

interface AccentColorState {
  preset: string;
  hue: number;
  setPreset: (name: string) => void;
}

export const useAccentColorStore = create<AccentColorState>((set) => ({
  preset: "crimson",
  hue: 15,
  setPreset: (name: string): void => {
    const found = ACCENT_PRESETS.find((p) => p.name === name);
    if (found) {
      document.documentElement.style.setProperty("--accent-hue", String(found.hue));
      set({ preset: name, hue: found.hue });
    }
  },
}));
