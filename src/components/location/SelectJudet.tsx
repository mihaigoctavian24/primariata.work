"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Judet, ApiResponse, ApiErrorResponse } from "@/types/api";

interface SelectJudetProps {
  onSelect: (judetId: number) => void;
  defaultValue?: string;
  disabled?: boolean;
}

export function SelectJudet({ onSelect, defaultValue, disabled = false }: SelectJudetProps) {
  const [judete, setJudete] = useState<Judet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJudete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/localitati/judete");
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.error.message || "Eroare la încărcarea județelor");
      }

      const successData = data as ApiResponse<Judet[]>;
      setJudete(successData.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la încărcarea județelor";
      setError(errorMessage);
      console.error("Error fetching județe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudete();
  }, []);

  const handleRetry = () => {
    fetchJudete();
  };

  const handleValueChange = (value: string) => {
    const judetId = parseInt(value, 10);
    if (!isNaN(judetId)) {
      onSelect(judetId);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full" aria-label="Se încarcă județele" aria-busy="true">
          <SelectValue placeholder="Se încarcă județele..." />
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
            aria-label="Eroare la încărcarea județelor"
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
            aria-label="Reîncearcă încărcarea județelor"
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
        aria-label="Selectează județul"
        aria-describedby={judete.length > 0 ? "judet-count" : undefined}
      >
        <SelectValue placeholder="Selectează județul" />
      </SelectTrigger>
      <SelectContent>
        {judete.map((judet) => (
          <SelectItem
            key={judet.id}
            value={judet.id.toString()}
            aria-label={`Selectează ${judet.nume}`}
          >
            {judet.nume}
          </SelectItem>
        ))}
      </SelectContent>
      <span id="judet-count" className="sr-only">
        {judete.length} județe disponibile
      </span>
    </Select>
  );
}
