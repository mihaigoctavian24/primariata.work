"use client";

interface AppearanceTabProps {
  primarieId: string;
  currentPreset: string;
}

export function AppearanceTab({
  primarieId,
  currentPreset,
}: AppearanceTabProps): React.JSX.Element {
  void primarieId;
  void currentPreset;
  return (
    <div className="border-border/40 bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Aspect</h2>
    </div>
  );
}
