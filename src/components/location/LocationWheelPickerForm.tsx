"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { WheelPicker, WheelPickerWrapper } from "@/components/wheel-picker";
import { useJudeteWheelPicker } from "@/hooks/useJudeteWheelPicker";
import { useLocalitatiWheelPicker } from "@/hooks/useLocalitatiWheelPicker";
import { cn } from "@/lib/utils";

// Normalize Romanian diacritics for search (outside component to avoid re-renders)
const normalizeDiacritics = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ă/g, "a")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t");
};

const formSchema = z.object({
  judetId: z.string().min(1, "Selectează județul"),
  localitateId: z.string().min(1, "Selectează localitatea"),
});

type FormSchema = z.infer<typeof formSchema>;

interface LocationWheelPickerFormProps {
  onSubmit?: (values: FormSchema) => void;
  defaultJudetId?: string;
  defaultLocalitateId?: string;
}

export function LocationWheelPickerForm({
  onSubmit: onSubmitProp,
  defaultJudetId,
  defaultLocalitateId,
}: LocationWheelPickerFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judetId: defaultJudetId || "",
      localitateId: defaultLocalitateId || "",
    },
  });

  const selectedJudetId = form.watch("judetId");
  const [localitateSearch, setLocalitateSearch] = useState("");
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch județe
  const {
    options: judeteOptions,
    loading: judeteLoading,
    error: judeteError,
    retry: retryJudete,
  } = useJudeteWheelPicker();

  // Fetch localități based on selected județ
  const {
    options: localitatiOptions,
    loading: localitatiLoading,
    error: localitatiError,
    retry: retryLocalitati,
  } = useLocalitatiWheelPicker({
    judetId: selectedJudetId ? parseInt(selectedJudetId, 10) : null,
  });

  // Set default județ when options load
  useEffect(() => {
    if (judeteOptions.length > 0 && !selectedJudetId && judeteOptions[0]) {
      form.setValue("judetId", judeteOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [judeteOptions]);

  // Set default localitate when options load
  useEffect(() => {
    if (localitatiOptions.length > 0 && !form.watch("localitateId") && localitatiOptions[0]) {
      form.setValue("localitateId", localitatiOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localitatiOptions]);

  // Reset localitate when județ changes
  useEffect(() => {
    if (selectedJudetId) {
      form.setValue("localitateId", "");
      setLocalitateSearch(""); // Reset search too
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJudetId]);

  // Search with instant matching (no debounce) and smooth scroll animation
  useEffect(() => {
    // Cancel any ongoing animation when search changes
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Only search if we have 3+ characters and localități are loaded
    if (localitateSearch.length < 3 || localitatiOptions.length === 0) {
      return;
    }

    // INSTANT search - no debounce (triggers on every keystroke)
    // This ensures progressive refinement as user types each letter
    // Normalize search term (remove diacritics)
    const searchNormalized = normalizeDiacritics(localitateSearch);

    // Advanced scoring algorithm with progressive refinement
    const matches = localitatiOptions.map((option, index) => {
      const labelNormalized = normalizeDiacritics(option.label);

      // Extract the base name (before parentheses) for better matching
      const labelBase = labelNormalized.split("(")[0].trim();

      // EXACT MATCH (highest priority)
      if (labelBase === searchNormalized) {
        return { option, index, score: 100, matchType: "exact" };
      }

      // STARTS-WITH MATCH (prioritize by specificity)
      if (labelBase.startsWith(searchNormalized)) {
        // Score based on how close we are to exact match
        // Longer search = higher score (more specific)
        // Formula: 50 + (searchLength / labelLength) * 40
        // Gives scores from 50 to 90 (never reaches exact match score of 100)
        const lengthRatio = searchNormalized.length / labelBase.length;
        const score = 50 + lengthRatio * 40;
        return { option, index, score, matchType: "startsWith" };
      }

      // CONTAINS MATCH (lowest priority)
      if (labelBase.includes(searchNormalized)) {
        return { option, index, score: 10, matchType: "contains" };
      }

      // NO MATCH
      return { option, index, score: 0, matchType: "none" };
    });

    // Filter valid matches and sort by score (descending)
    const validMatches = matches
      .filter((m) => m.score > 0)
      .sort((a, b) => {
        // First sort by score
        if (b.score !== a.score) return b.score - a.score;
        // If same score, prefer earlier in list (alphabetical)
        return a.index - b.index;
      });

    if (validMatches.length === 0) {
      return; // No match found
    }

    // Get the best match
    const bestMatch = validMatches[0];
    const targetIndex = bestMatch.index;
    const targetValue = bestMatch.option.value;

    // Get current position
    const currentValue = form.getValues("localitateId");
    const currentIndex = localitatiOptions.findIndex((opt) => opt.value === currentValue);

    if (!targetValue) return;

    // REFINED RULE: Only stop if current position is STILL an exact match for current search
    // This allows progressive refinement: "brad" (exact) → "bradu" (not exact anymore) → scroll to "Brădut"
    if (currentValue === targetValue) {
      // We're at the target position - check if it's still valid for current search
      const currentOption = localitatiOptions[currentIndex];
      if (currentOption) {
        const currentLabelNormalized = normalizeDiacritics(currentOption.label);
        const currentLabelBase = currentLabelNormalized.split("(")[0].trim();

        // Only stay if CURRENT position is exact match for CURRENT search
        const currentIsExactMatch = currentLabelBase === searchNormalized;
        if (currentIsExactMatch) {
          return; // Current position is exact match for current search, stop
        }
        // If current position is no longer exact match, allow scroll to better match
      }
    }

    // If we reach here, we need to scroll to targetValue

    // Calculate direction and distance
    const distance = Math.abs(targetIndex - currentIndex);
    const direction = targetIndex > currentIndex ? 1 : -1;

    // Smooth scroll animation with spring effect
    let step = 0;
    const totalSteps = Math.min(distance, 15); // Max 15 steps for smoothness
    const stepDelay = 30; // 30ms per step

    scrollIntervalRef.current = setInterval(() => {
      step++;

      // Easing function (ease-out for spring effect)
      const progress = step / totalSteps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      // Calculate next index based on eased progress
      const nextIndex = Math.round(currentIndex + distance * easeProgress * direction);
      const nextOption = localitatiOptions[nextIndex];

      if (nextOption && step <= totalSteps) {
        form.setValue("localitateId", nextOption.value);
      }

      // Stop when reached target
      if (step >= totalSteps) {
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        form.setValue("localitateId", targetValue); // Ensure final value is exact
      }
    }, stepDelay);

    // Cleanup function
    return () => {
      // Cleanup any ongoing animation
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [localitateSearch, localitatiOptions, form]);

  const onSubmit = (values: FormSchema) => {
    if (onSubmitProp) {
      onSubmitProp(values);
    } else {
      // Find the selected județ and localitate names
      const selectedJudet = judeteOptions.find((j) => j.value === values.judetId);
      const selectedLocalitate = localitatiOptions.find((l) => l.value === values.localitateId);

      toast.success("Locație selectată!", {
        description: (
          <div className="mt-2 space-y-1">
            <p>
              <strong>Județ:</strong> {selectedJudet?.label || values.judetId}
            </p>
            <p>
              <strong>Localitate:</strong> {selectedLocalitate?.label || values.localitateId}
            </p>
          </div>
        ),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md space-y-6">
        {/* Județ Wheel Picker */}
        <FormField
          control={form.control}
          name="judetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Județ</FormLabel>

              {judeteLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground ml-2 text-sm">Se încarcă județele...</span>
                </div>
              ) : judeteError ? (
                <div className="border-destructive/50 bg-destructive/10 space-y-2 rounded-lg border p-4">
                  <div className="text-destructive flex items-center text-sm">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>{judeteError}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryJudete}
                    className="w-full"
                  >
                    Reîncearcă
                  </Button>
                </div>
              ) : judeteOptions.length > 0 ? (
                <FormControl>
                  <WheelPickerWrapper>
                    <WheelPicker
                      options={judeteOptions}
                      value={field.value || judeteOptions[0]?.value || ""}
                      onValueChange={field.onChange}
                      infinite
                    />
                  </WheelPickerWrapper>
                </FormControl>
              ) : (
                <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border text-sm">
                  Nu există județe disponibile
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Localitate Wheel Picker */}
        <FormField
          control={form.control}
          name="localitateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localitate</FormLabel>

              {!selectedJudetId ? (
                <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border border-dashed text-sm">
                  Selectează județul mai întâi
                </div>
              ) : localitatiError ? (
                <div className="border-destructive/50 bg-destructive/10 space-y-2 rounded-lg border p-4">
                  <div className="text-destructive flex items-center text-sm">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>{localitatiError}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryLocalitati}
                    className="w-full"
                  >
                    Reîncearcă
                  </Button>
                </div>
              ) : localitatiOptions.length > 0 ? (
                <FormControl>
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        placeholder="Caută localitate... (min 3 caractere)"
                        value={localitateSearch}
                        onChange={(e) => setLocalitateSearch(e.target.value)}
                        className="pl-9"
                        aria-label="Caută localitate pentru auto-scroll"
                      />
                      {localitateSearch.length > 0 && localitateSearch.length < 3 && (
                        <span className="text-muted-foreground mt-1 block text-xs">
                          Introdu încă {3 - localitateSearch.length} caracter
                          {3 - localitateSearch.length === 1 ? "" : "e"}
                        </span>
                      )}
                    </div>

                    {/* Wheel Picker */}
                    <div
                      className={cn(
                        "transition-all duration-200 ease-in-out",
                        localitatiLoading && "scale-95 opacity-40 blur-[10px]"
                      )}
                    >
                      <WheelPickerWrapper>
                        <WheelPicker
                          options={localitatiOptions}
                          value={field.value || localitatiOptions[0]?.value || ""}
                          onValueChange={field.onChange}
                          infinite
                        />
                      </WheelPickerWrapper>
                    </div>
                  </div>
                </FormControl>
              ) : (
                <div className="text-muted-foreground flex h-32 items-center justify-center rounded-lg border text-sm">
                  {localitatiLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Se încarcă localitățile...</span>
                    </div>
                  ) : (
                    "Nu există localități în acest județ"
                  )}
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <Button type="submit" size="lg" className="w-full">
            Confirmă locația
          </Button>
        </div>
      </form>
    </Form>
  );
}
