"use client";

import { useState, useEffect, useCallback } from "react";
import { WizardStep, WizardState, UploadedFile } from "@/types/wizard";
import { TipCerere } from "@/types/api";

const STORAGE_KEY = "cerere_wizard_state";

/**
 * Custom hook for managing wizard state with localStorage persistence
 */
export function useWizardState() {
  const [state, setState] = useState<WizardState>({
    currentStep: WizardStep.SELECT_TYPE,
    formData: {},
    uploadedFiles: [],
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (error) {
        console.error("Failed to parse wizard state:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (!isHydrated) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state, isHydrated]);

  const setCurrentStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setSelectedTipCerere = useCallback((tipCerere: TipCerere) => {
    setState((prev) => ({ ...prev, selectedTipCerere: tipCerere }));
  }, []);

  const setFormData = useCallback((data: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      formData: data,
      lastSaved: new Date().toISOString(),
    }));
  }, []);

  const setObservatii = useCallback((observatii: string) => {
    setState((prev) => ({ ...prev, observatii }));
  }, []);

  const setUploadedFiles = useCallback((files: UploadedFile[]) => {
    setState((prev) => ({ ...prev, uploadedFiles: files }));
  }, []);

  const setDraftId = useCallback((draftId: string) => {
    setState((prev) => ({ ...prev, draftId }));
  }, []);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      currentStep: WizardStep.SELECT_TYPE,
      formData: {},
      uploadedFiles: [],
    });
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, WizardStep.REVIEW_SUBMIT),
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, WizardStep.SELECT_TYPE),
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  return {
    state,
    isHydrated,
    setCurrentStep,
    setSelectedTipCerere,
    setFormData,
    setObservatii,
    setUploadedFiles,
    setDraftId,
    clearState,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
