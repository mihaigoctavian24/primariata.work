"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Localitate, ApiResponse, ApiErrorResponse } from "@/types/api";

interface SelectLocalitateProps {
  judetId: number | null;
  onSelect: (localitateId: number, localitateNume: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export function SelectLocalitate({
  judetId,
  onSelect,
  defaultValue,
  disabled = false,
}: SelectLocalitateProps) {
  const [localitati, setLocalitati] = useState<Localitate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!judetId) {
      setLocalitati([]);
      return;
    }

    const fetchLocalitati = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/localitati?judet_id=${judetId}`);
        const data = await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          throw new Error(errorData.error.message || "Eroare la încărcarea localităților");
        }

        const successData = data as ApiResponse<Localitate[]>;
        setLocalitati(successData.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Eroare la încărcarea localităților";
        setError(errorMessage);
        console.error("Error fetching localități:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalitati();
  }, [judetId]);

  const handleRetry = async () => {
    if (!judetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/localitati?judet_id=${judetId}`);
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.error.message || "Eroare la încărcarea localităților");
      }

      const successData = data as ApiResponse<Localitate[]>;
      setLocalitati(successData.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Eroare la încărcarea localităților";
      setError(errorMessage);
      console.error("Error fetching localități:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    const localitateId = parseInt(value, 10);
    if (!isNaN(localitateId)) {
      const localitate = localitati.find((l) => l.id === localitateId);
      if (localitate) {
        onSelect(localitateId, localitate.nume);
      }
    }
  };

  if (!judetId) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full" aria-label="Selectează județul mai întâi">
          <SelectValue placeholder="Selectează județul mai întâi" />
        </SelectTrigger>
      </Select>
    );
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full" aria-label="Se încarcă localitățile" aria-busy="true">
          <SelectValue placeholder="Se încarcă localitățile..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Select disabled>
          <SelectTrigger
            className="border-destructive w-full"
            aria-label="Eroare la încărcarea localităților"
            aria-invalid="true"
          >
            <SelectValue placeholder="Eroare la încărcare" />
          </SelectTrigger>
        </Select>
        <div className="text-destructive flex items-center justify-between text-sm">
          <span>{error}</span>
          <button
            onClick={handleRetry}
            className="focus:ring-primary underline hover:no-underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
            aria-label="Reîncearcă încărcarea localităților"
          >
            Reîncearcă
          </button>
        </div>
      </div>
    );
  }

  return (
    <Select onValueChange={handleValueChange} defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger
        className="w-full"
        aria-label="Selectează localitatea"
        aria-describedby={localitati.length > 0 ? "localitate-count" : undefined}
      >
        <SelectValue placeholder="Selectează localitatea" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
        {localitati.map((localitate) => (
          <SelectItem
            key={localitate.id}
            value={localitate.id.toString()}
            aria-label={`Selectează ${localitate.nume}`}
          >
            {localitate.nume}
            {localitate.tip && ` (${localitate.tip})`}
          </SelectItem>
        ))}
      </SelectContent>
      <span id="localitate-count" className="sr-only">
        {localitati.length} localități disponibile
      </span>
    </Select>
  );
}
