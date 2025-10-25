import { useState, useEffect } from "react";
import type { WheelPickerOption } from "@/components/wheel-picker";
import type { ApiResponse, ApiErrorResponse, Judet } from "@/types/api";

interface UseJudeteWheelPickerReturn {
  options: WheelPickerOption[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// In-memory cache for județ data
let cachedJudete: WheelPickerOption[] | null = null;

export function useJudeteWheelPicker(): UseJudeteWheelPickerReturn {
  const [options, setOptions] = useState<WheelPickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJudete = async () => {
    // Return cached data if available
    if (cachedJudete) {
      setOptions(cachedJudete);
      setLoading(false);
      setError(null);
      return;
    }

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

      // Format județe as WheelPickerOption[]
      const formattedOptions: WheelPickerOption[] = successData.data.map((judet) => ({
        label: judet.nume,
        value: judet.id.toString(),
      }));

      // Cache the results
      cachedJudete = formattedOptions;

      setOptions(formattedOptions);
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

  const retry = () => {
    // Clear cache on retry
    cachedJudete = null;
    fetchJudete();
  };

  return {
    options,
    loading,
    error,
    retry,
  };
}
