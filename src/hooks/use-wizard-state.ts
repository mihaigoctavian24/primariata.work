"use client";

import { useState, useEffect, useCallback } from "react";
import { WizardStep, WizardState, UploadedFile } from "@/types/wizard";
import { TipCerere } from "@/types/api";
import { createClient } from "@/lib/supabase/client";

/**
 * Custom hook for managing wizard state with user-scoped localStorage persistence
 * SECURITY: Each user's wizard data is isolated to prevent cross-user data leakage
 */
export function useWizardState() {
  const [state, setState] = useState<WizardState>({
    currentStep: WizardStep.SELECT_TYPE,
    formData: {},
    uploadedFiles: [],
  });

  const [isHydrated, setIsHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  // Get authenticated user and set storage key
  useEffect(() => {
    const initializeUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        setUserId(user.id);
        setStorageKey(`cerere_wizard_state_${user.id}`);
      } else {
        setUserId(null);
        setStorageKey(null);
      }
    };

    initializeUser();

    // Listen for auth state changes
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setStorageKey(`cerere_wizard_state_${session.user.id}`);
      } else {
        // User logged out, clear state
        setUserId(null);
        setStorageKey(null);
        setState({
          currentStep: WizardStep.SELECT_TYPE,
          formData: {},
          uploadedFiles: [],
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load state from localStorage on mount with ownership validation
  useEffect(() => {
    if (!storageKey || !userId) {
      setIsHydrated(true);
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WizardState;

        // CRITICAL: Validate ownership
        if (parsed.userId && parsed.userId !== userId) {
          console.warn("[SECURITY] Mismatched user data detected, clearing wizard state");
          localStorage.removeItem(storageKey);
          setIsHydrated(true);
          return;
        }

        // Optional: Check expiration (e.g., 7 days)
        const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (parsed.savedAt && Date.now() - parsed.savedAt > EXPIRATION_MS) {
          console.info("[INFO] Wizard state expired, clearing");
          localStorage.removeItem(storageKey);
          setIsHydrated(true);
          return;
        }

        setState(parsed);
      } catch (error) {
        console.error("Failed to parse wizard state:", error);
        localStorage.removeItem(storageKey);
      }
    }
    setIsHydrated(true);
  }, [storageKey, userId]);

  // Save state to localStorage whenever it changes (debounced) with userId
  useEffect(() => {
    if (!isHydrated || !storageKey || !userId) return;

    const timeoutId = setTimeout(() => {
      const stateToSave: WizardState = {
        ...state,
        userId: userId,
        savedAt: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state, isHydrated, storageKey, userId]);

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
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setState({
      currentStep: WizardStep.SELECT_TYPE,
      formData: {},
      uploadedFiles: [],
    });
  }, [storageKey]);

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
