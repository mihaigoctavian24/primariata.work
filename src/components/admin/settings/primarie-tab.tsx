"use client";

interface PrimarieTabProps {
  primarieId: string;
  initialData: {
    email: string;
    telefon: string;
    adresa: string;
    program_lucru: string;
    nume_oficial: string;
    config: {
      maintenance_mode: boolean;
      auto_approve: boolean;
      accent_preset: string;
      cui: string;
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    };
  };
}

export function PrimarieTab({ primarieId, initialData }: PrimarieTabProps): React.JSX.Element {
  void primarieId;
  return (
    <div className="border-border/40 bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Configurare Primarie</h2>
      <p className="text-muted-foreground text-sm">{initialData.nume_oficial}</p>
    </div>
  );
}
