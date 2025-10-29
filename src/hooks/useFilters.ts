"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Hook for managing filter state with URL sync
 * Skeleton implementation - to be completed in Phase 2
 */

export interface UseFiltersOptions<T extends Record<string, unknown>> {
  defaultFilters?: T;
  syncWithUrl?: boolean;
  onFilterChange?: (filters: T) => void;
}

export interface FilterPreset<T> {
  id: string;
  name: string;
  filters: T;
}

export function useFilters<T extends Record<string, unknown>>(options: UseFiltersOptions<T> = {}) {
  const { defaultFilters = {} as T, syncWithUrl = true, onFilterChange } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL params if syncWithUrl is true
  const initialFilters = useMemo(() => {
    if (!syncWithUrl || !searchParams) {
      return defaultFilters;
    }

    const urlFilters = {} as T;
    searchParams.forEach((value, key) => {
      try {
        // Try to parse as JSON for complex values
        urlFilters[key as keyof T] = JSON.parse(value) as T[keyof T];
      } catch {
        // Fallback to string value
        urlFilters[key as keyof T] = value as T[keyof T];
      }
    });

    return { ...defaultFilters, ...urlFilters };
  }, [defaultFilters, searchParams, syncWithUrl]);

  const [filters, setFilters] = useState<T>(initialFilters);
  const [presets, setPresets] = useState<FilterPreset<T>[]>([]);

  // Load presets from localStorage on mount
  useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("filter-presets");
        if (saved) {
          setPresets(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load filter presets:", error);
      }
    }
  }, []);

  // Update filters and optionally sync with URL
  const updateFilters = useCallback(
    (updates: Partial<T> | ((prev: T) => Partial<T>)) => {
      setFilters((prev) => {
        const updatesToApply = typeof updates === "function" ? updates(prev) : updates;
        const newFilters = { ...prev, ...updatesToApply };

        // Sync with URL if enabled
        if (syncWithUrl && pathname) {
          const params = new URLSearchParams();

          Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              params.set(key, JSON.stringify(value));
            }
          });

          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }

        // Call onChange callback
        if (onFilterChange) {
          onFilterChange(newFilters);
        }

        return newFilters;
      });
    },
    [syncWithUrl, pathname, router, onFilterChange]
  );

  // Set a single filter
  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      updateFilters({ [key]: value } as unknown as Partial<T>);
    },
    [updateFilters]
  );

  // Remove a filter
  const removeFilter = useCallback(
    <K extends keyof T>(key: K) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[key];

        // Sync with URL if enabled
        if (syncWithUrl && pathname) {
          const params = new URLSearchParams();

          Object.entries(newFilters).forEach(([k, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              params.set(k, JSON.stringify(value));
            }
          });

          router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }

        if (onFilterChange) {
          onFilterChange(newFilters);
        }

        return newFilters;
      });
    },
    [syncWithUrl, pathname, router, onFilterChange]
  );

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);

    if (syncWithUrl && pathname) {
      router.push(pathname, { scroll: false });
    }

    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
  }, [defaultFilters, syncWithUrl, pathname, router, onFilterChange]);

  // Save preset to localStorage
  const savePreset = useCallback(
    (name: string) => {
      const preset: FilterPreset<T> = {
        id: Date.now().toString(),
        name,
        filters: { ...filters },
      };

      const newPresets = [...presets, preset];
      setPresets(newPresets);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("filter-presets", JSON.stringify(newPresets));
        } catch (error) {
          console.error("Failed to save filter preset:", error);
        }
      }

      return preset;
    },
    [filters, presets]
  );

  // Load preset
  const loadPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        updateFilters(preset.filters);
      }
    },
    [presets, updateFilters]
  );

  // Delete preset
  const deletePreset = useCallback(
    (presetId: string) => {
      const newPresets = presets.filter((p) => p.id !== presetId);
      setPresets(newPresets);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("filter-presets", JSON.stringify(newPresets));
        } catch (error) {
          console.error("Failed to delete filter preset:", error);
        }
      }
    },
    [presets]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      (key) =>
        filters[key as keyof T] !== defaultFilters[key as keyof T] &&
        filters[key as keyof T] !== null &&
        filters[key as keyof T] !== undefined &&
        filters[key as keyof T] !== ""
    );
  }, [filters, defaultFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(
      (key) =>
        filters[key as keyof T] !== defaultFilters[key as keyof T] &&
        filters[key as keyof T] !== null &&
        filters[key as keyof T] !== undefined &&
        filters[key as keyof T] !== ""
    ).length;
  }, [filters, defaultFilters]);

  return {
    filters,
    setFilter,
    updateFilters,
    removeFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
