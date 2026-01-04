/**
 * useSignature Hook
 *
 * React hook for signature operations with state management
 */

import { useState } from "react";
import {
  validateCertificate,
  getCertificate,
  signDocument,
  signDocumentsBatch,
  verifySignature,
  type CertificateValidation,
  type CertificateDetails,
  type SignatureRequest,
  type SignatureResult,
  type BatchSignatureRequest,
  type BatchSignatureResult,
  type SignatureVerification,
} from "@/lib/signature";

interface UseSignatureState {
  isLoading: boolean;
  error: string | null;
}

export function useSignature() {
  const [state, setState] = useState<UseSignatureState>({
    isLoading: false,
    error: null,
  });

  /**
   * Validate certificate with loading state
   */
  const validate = async (cnp: string): Promise<CertificateValidation | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await validateCertificate(cnp);
      setState({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la validare certificat";
      setState({ isLoading: false, error: message });
      return null;
    }
  };

  /**
   * Get certificate details with loading state
   */
  const getCertificateDetails = async (cnp: string): Promise<CertificateDetails | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await getCertificate(cnp);
      setState({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Eroare la obținere detalii certificat";
      setState({ isLoading: false, error: message });
      return null;
    }
  };

  /**
   * Sign single document with loading state
   */
  const sign = async (request: SignatureRequest): Promise<SignatureResult | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await signDocument(request);
      if (!result.success) {
        setState({ isLoading: false, error: result.error || "Semnare eșuată" });
        return null;
      }
      setState({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la semnare document";
      setState({ isLoading: false, error: message });
      return null;
    }
  };

  /**
   * Sign batch of documents with loading state
   */
  const signBatch = async (
    request: BatchSignatureRequest
  ): Promise<BatchSignatureResult | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await signDocumentsBatch(request);
      if (!result.success) {
        setState({ isLoading: false, error: result.error || "Semnare batch eșuată" });
        return null;
      }
      setState({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la semnare batch";
      setState({ isLoading: false, error: message });
      return null;
    }
  };

  /**
   * Verify signature with loading state
   */
  const verify = async (transactionId: string): Promise<SignatureVerification | null> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await verifySignature(transactionId);
      if (!result.success) {
        setState({ isLoading: false, error: result.error || "Verificare eșuată" });
        return null;
      }
      setState({ isLoading: false, error: null });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Eroare la verificare semnătură";
      setState({ isLoading: false, error: message });
      return null;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    validate,
    getCertificateDetails,
    sign,
    signBatch,
    verify,
    clearError,
  };
}
