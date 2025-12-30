"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { WizardStep } from "@/types/wizard";
import { useWizardState } from "@/hooks/use-wizard-state";
import { WizardLayout } from "@/components/cereri/create-wizard/WizardLayout";
import { SelectTipCerere } from "@/components/cereri/create-wizard/SelectTipCerere";
import { FillDetails } from "@/components/cereri/create-wizard/FillDetails";
import { UploadDocuments } from "@/components/cereri/create-wizard/UploadDocuments";
import { ReviewSubmit } from "@/components/cereri/create-wizard/ReviewSubmit";
import { TipCerere } from "@/types/api";
import { toast } from "sonner";

export default function CreateCererePage() {
  const router = useRouter();
  const {
    state,
    isHydrated,
    setSelectedTipCerere,
    setFormData,
    setObservatii,
    setUploadedFiles,
    setDraftId,
    clearState,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  } = useWizardState();

  // Save draft to API (wrapped in useCallback to prevent recreating on every render)
  // MUST be before any conditional returns (Rules of Hooks)
  const saveDraft = useCallback(
    async (formData: Record<string, unknown>, observatii: string): Promise<void> => {
      try {
        if (!state.selectedTipCerere) {
          throw new Error("Nu s-a selectat tipul de cerere");
        }

        const payload = {
          tip_cerere_id: state.selectedTipCerere.id,
          date_formular: formData,
          observatii_solicitant: observatii || undefined,
        };

        let response;

        if (state.draftId) {
          // Update existing draft
          response = await fetch(`/api/cereri/${state.draftId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date_formular: formData,
              observatii_solicitant: observatii || undefined,
            }),
          });
        } else {
          // Create new draft
          response = await fetch("/api/cereri", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Eroare la salvarea draft-ului");
        }

        const data = await response.json();

        // Save draft ID if this was a new draft
        if (!state.draftId && data.data?.id) {
          setDraftId(data.data.id);
        }

        toast.success("Draft salvat cu succes");
      } catch (error) {
        console.error("Error saving draft:", error);
        toast.error(error instanceof Error ? error.message : "Eroare la salvarea draft-ului");
        throw error;
      }
    },
    [state.selectedTipCerere, state.draftId, setDraftId]
  );

  // Abandon draft - delete and clear state
  const abandonDraft = useCallback(async () => {
    try {
      if (!state.draftId) return;

      const response = await fetch(`/api/cereri/${state.draftId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Try to parse error response, but handle empty/invalid JSON
        let errorMessage = "Eroare la ștergerea draft-ului";
        try {
          const error = await response.json();
          errorMessage = error.error?.message || errorMessage;
        } catch {
          // Response doesn't have JSON body, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast.success("Draft abandonat");
      clearState();
      router.push("../cereri");
    } catch (error) {
      console.error("Error abandoning draft:", error);
      toast.error(error instanceof Error ? error.message : "Eroare la abandonarea draft-ului");
    }
  }, [state.draftId, clearState, router]);

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground text-sm">Se încarcă...</p>
        </div>
      </div>
    );
  }

  // Handle tip cerere selection
  function handleSelectTipCerere(tipCerere: TipCerere) {
    setSelectedTipCerere(tipCerere);
    goToNextStep();
  }

  // Handle form details submission
  async function handleDetailsSubmit(formData: Record<string, unknown>, observatii: string) {
    setFormData(formData);
    setObservatii(observatii);
    await saveDraft(formData, observatii);
    goToNextStep();
  }

  // Submit final cerere
  async function handleFinalSubmit() {
    try {
      if (!state.draftId) {
        throw new Error("Nu există un draft pentru această cerere");
      }

      const response = await fetch(`/api/cereri/${state.draftId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Eroare la trimiterea cererii");
      }

      const data = await response.json();

      toast.success(
        `Cerere trimisă cu succes! Număr înregistrare: ${data.data.numar_inregistrare}`,
        {
          duration: 5000,
        }
      );

      // Clear wizard state
      clearState();

      // Redirect to cereri list
      router.push("../cereri");
    } catch (error) {
      console.error("Error submitting cerere:", error);
      toast.error(error instanceof Error ? error.message : "Eroare la trimiterea cererii");
      throw error;
    }
  }

  return (
    <WizardLayout currentStep={state.currentStep}>
      {state.currentStep === WizardStep.SELECT_TYPE && (
        <SelectTipCerere
          onSelect={handleSelectTipCerere}
          selectedTipCerere={state.selectedTipCerere}
        />
      )}

      {state.currentStep === WizardStep.FILL_DETAILS && state.selectedTipCerere && (
        <FillDetails
          tipCerere={state.selectedTipCerere}
          initialData={state.formData}
          initialObservatii={state.observatii}
          onSave={saveDraft}
          onNext={handleDetailsSubmit}
          onBack={goToPreviousStep}
          onAbandon={abandonDraft}
          cerereId={state.draftId}
        />
      )}

      {state.currentStep === WizardStep.UPLOAD_DOCUMENTS && state.selectedTipCerere && (
        <UploadDocuments
          tipCerere={state.selectedTipCerere}
          uploadedFiles={state.uploadedFiles}
          onFilesChange={setUploadedFiles}
          onNext={goToNextStep}
          onBack={goToPreviousStep}
          cerereId={state.draftId}
        />
      )}

      {state.currentStep === WizardStep.REVIEW_SUBMIT && state.selectedTipCerere && (
        <ReviewSubmit
          tipCerere={state.selectedTipCerere}
          formData={state.formData}
          observatii={state.observatii}
          uploadedFiles={state.uploadedFiles}
          onEdit={goToStep}
          onSubmit={handleFinalSubmit}
          onBack={goToPreviousStep}
        />
      )}
    </WizardLayout>
  );
}
