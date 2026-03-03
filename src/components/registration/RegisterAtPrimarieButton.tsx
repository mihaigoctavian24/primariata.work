"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerAtPrimarie } from "@/actions/registration";

interface RegisterAtPrimarieButtonProps {
  primarieId: string;
  primarieName: string;
}

/**
 * Button component for existing users visiting a new primarie where they have no association.
 * Calls registerAtPrimarie Server Action to create a pending user_primarii row.
 */
export function RegisterAtPrimarieButton({
  primarieId,
  primarieName,
}: RegisterAtPrimarieButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(): Promise<void> {
    setIsSubmitting(true);
    try {
      const result = await registerAtPrimarie(primarieId);
      if (result.success) {
        toast.success("Cererea de inregistrare a fost trimisa!", {
          description: "Vei fi notificat cand va fi procesata.",
        });
        router.refresh();
      } else {
        toast.error("Eroare la inregistrare", {
          description: result.error ?? "Incearca din nou mai tarziu.",
        });
      }
    } catch {
      toast.error("Eroare neasteptata", {
        description: "Incearca din nou mai tarziu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button onClick={handleRegister} disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Se trimite cererea...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Inregistreaza-te la {primarieName}
        </>
      )}
    </Button>
  );
}
