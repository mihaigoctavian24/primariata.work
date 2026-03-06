"use client";

interface ProfileTabProps {
  initialData: {
    nume: string;
    prenume: string;
    email: string;
    telefon: string;
    primarie_name: string;
    rol: string;
  };
}

export function ProfileTab({ initialData }: ProfileTabProps): React.JSX.Element {
  return (
    <div className="border-border/40 bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Profil Admin</h2>
      <p className="text-muted-foreground text-sm">
        {initialData.prenume} {initialData.nume}
      </p>
    </div>
  );
}
