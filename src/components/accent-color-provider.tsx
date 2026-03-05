"use client";

import { useEffect } from "react";
import { useAccentColorStore } from "@/store/accent-color-store";

interface AccentColorProviderProps {
  initialPreset?: string;
  children: React.ReactNode;
}

export function AccentColorProvider({
  initialPreset,
  children,
}: AccentColorProviderProps): React.JSX.Element {
  const setPreset = useAccentColorStore((s) => s.setPreset);

  useEffect(() => {
    if (initialPreset) {
      setPreset(initialPreset);
    }
  }, [initialPreset, setPreset]);

  return <>{children}</>;
}
