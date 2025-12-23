"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { saveLocation } from "@/lib/location-storage";
import { cn } from "@/lib/utils";

// Search bar styling constants for consistent design
const SEARCH_INPUT_CLASSES = [
  "h-14",
  "!bg-transparent",
  "pl-9",
  "!text-lg",
  "text-center",
  "shadow-none",
  "focus:!ring-0",
  "focus:!ring-offset-0",
  "focus-visible:!ring-0",
  "focus-visible:!ring-offset-0",
  "focus-visible:!border-border/40",
  "sm:!text-xl",
].join(" ");

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
  onSearchInputChange?: (length: number) => void;
}

export function LocationWheelPickerForm({
  onSubmit: onSubmitProp,
  defaultJudetId,
  defaultLocalitateId,
  onSearchInputChange,
}: LocationWheelPickerFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      judetId: defaultJudetId || "",
      localitateId: defaultLocalitateId || "",
    },
  });

  const router = useRouter();
  const selectedJudetId = form.watch("judetId");
  const [localitateSearch, setLocalitateSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interaction timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // Fetch județe
  const {
    options: judeteOptions,
    loading: judeteLoading,
    error: judeteError,
    retry: retryJudete,
    getJudetById,
  } = useJudeteWheelPicker();

  // Fetch localități based on selected județ
  const {
    options: localitatiOptions,
    loading: localitatiLoading,
    error: localitatiError,
    retry: retryLocalitati,
    getLocalitateById,
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

  // Notify parent of search input length changes
  useEffect(() => {
    onSearchInputChange?.(localitateSearch.length);
  }, [localitateSearch, onSearchInputChange]);

  // Search with instant matching (no debounce) and smooth scroll animation
  useEffect(() => {
    // Cancel any ongoing animation when search changes
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    // Don't search if user is manually interacting with wheel picker
    if (isUserInteracting) {
      console.log("🔍 Search: User is interacting, skipping search");
      return;
    }

    // Only search if we have 3+ characters and localități are loaded
    if (localitateSearch.length < 3 || localitatiOptions.length === 0) {
      console.log("🔍 Search: Not enough chars or no options", {
        searchLength: localitateSearch.length,
        optionsLength: localitatiOptions.length,
      });
      return;
    }

    // INSTANT search - no debounce (triggers on every keystroke)
    // This ensures progressive refinement as user types each letter
    // Normalize search term (remove diacritics)
    const searchNormalized = normalizeDiacritics(localitateSearch);
    console.log("🔍 Search triggered:", {
      original: localitateSearch,
      normalized: searchNormalized,
      totalOptions: localitatiOptions.length,
    });

    // Advanced scoring algorithm with progressive refinement
    const matches = localitatiOptions.map((option, index) => {
      const labelNormalized = normalizeDiacritics(String(option.label ?? ""));

      // Extract the base name (before parentheses) for better matching
      const labelBase = (labelNormalized.split("(")[0] ?? "").trim();

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

    console.log(
      "🔍 Matches found:",
      validMatches.length,
      validMatches.slice(0, 3).map((m) => ({
        label: m.option.label,
        score: m.score,
        type: m.matchType,
      }))
    );

    if (validMatches.length === 0) {
      console.log("🔍 No matches found");
      return; // No match found
    }

    // Get the best match
    const bestMatch = validMatches[0];
    if (!bestMatch) return;
    const targetIndex = bestMatch.index;
    const targetValue = bestMatch.option.value;
    console.log("🔍 Best match:", {
      label: bestMatch.option.label,
      score: bestMatch.score,
      type: bestMatch.matchType,
      targetIndex,
      targetValue,
    });

    // Get current position
    const currentValue = form.getValues("localitateId");
    const currentIndex = localitatiOptions.findIndex((opt) => opt.value === currentValue);

    if (!targetValue) return;

    // REFINED RULE: Only stop if current position is STILL an exact match for current search
    // This allows progressive refinement: "brad" (exact) → "bradu" (not exact anymore) → scroll to "Brădut"
    if (currentValue === targetValue) {
      // We're at the target position - check if it's still valid for current search
      const currentOption = localitatiOptions[currentIndex];
      if (currentOption && currentOption.label) {
        const currentLabelNormalized = normalizeDiacritics(String(currentOption.label));
        const currentLabelBase = (currentLabelNormalized.split("(")[0] ?? "").trim();

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

    console.log("🔍 Starting scroll animation:", {
      from: currentIndex,
      to: targetIndex,
      distance,
      direction,
    });

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
  }, [localitateSearch, localitatiOptions, form, isUserInteracting]);

  const onSubmit = (values: FormSchema) => {
    if (onSubmitProp) {
      onSubmitProp(values);
      return;
    }

    // Get full data for județ and localitate (including slugs)
    const judet = getJudetById(values.judetId);
    const localitate = getLocalitateById(values.localitateId);

    // Validate data
    if (!judet || !localitate) {
      toast.error("Eroare la salvarea locației", {
        description: "Nu s-au putut prelua detaliile locației. Te rugăm să încerci din nou.",
      });
      return;
    }

    // Validate slugs exist
    if (!judet.slug || !localitate.slug) {
      toast.error("Eroare de configurare", {
        description: "Locația selectată nu are un identificator valid.",
      });
      return;
    }

    // Save location to storage (localStorage + cookie)
    saveLocation({
      judetId: judet.id.toString(),
      judetSlug: judet.slug,
      localitateId: localitate.id.toString(),
      localitateSlug: localitate.slug,
    });

    // Show success toast
    toast.success("Locație salvată!", {
      description: `${judet.nume}, ${localitate.nume}`,
    });

    // Redirect to dashboard
    router.push(`/app/${judet.slug}/${localitate.slug}/dashboard`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-4xl">
        {/* Wheel Pickers Container - Responsive Layout */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Județ Wheel Picker */}
          <FormField
            control={form.control}
            name="judetId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel
                  htmlFor="judetId"
                  className="block text-center"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
                >
                  Județ
                </FormLabel>

                {judeteLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    <span className="text-muted-foreground ml-2 text-sm">
                      Se încarcă județele...
                    </span>
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
                    <div>
                      {/* Hidden input for form autofill support */}
                      <input
                        type="hidden"
                        id="judetId"
                        name="judetId"
                        value={field.value || ""}
                        aria-hidden="true"
                      />
                      <WheelPickerWrapper>
                        <WheelPicker
                          options={judeteOptions}
                          value={field.value || judeteOptions[0]?.value || ""}
                          onValueChange={field.onChange}
                          infinite
                          aria-label="Selectează județul"
                        />
                      </WheelPickerWrapper>
                    </div>
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
              <FormItem className="flex-1">
                <FormLabel
                  htmlFor="localitateId"
                  className="block text-center"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
                >
                  Localitate
                </FormLabel>

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
                    <div
                      className={cn(
                        "transition-all duration-200 ease-in-out",
                        localitatiLoading && "scale-95 opacity-40 blur-[10px]"
                      )}
                    >
                      {/* Hidden input for form autofill support */}
                      <input
                        type="hidden"
                        id="localitateId"
                        name="localitateId"
                        value={field.value || ""}
                        aria-hidden="true"
                      />
                      <WheelPickerWrapper>
                        <WheelPicker
                          options={localitatiOptions}
                          value={field.value || localitatiOptions[0]?.value || ""}
                          onValueChange={(value) => {
                            // User is manually scrolling - stop search animation
                            setIsUserInteracting(true);

                            // Clear previous timeout
                            if (interactionTimeoutRef.current) {
                              clearTimeout(interactionTimeoutRef.current);
                            }

                            // Set timeout to clear interaction flag after user stops
                            interactionTimeoutRef.current = setTimeout(() => {
                              setIsUserInteracting(false);
                              interactionTimeoutRef.current = null;
                            }, 500); // 500ms delay after last scroll

                            // Call the form's onChange
                            field.onChange(value);
                          }}
                          infinite
                          aria-label="Selectează localitatea"
                        />
                      </WheelPickerWrapper>
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
        </div>

        {/* Search Bar - Centered BELOW wheel pickers, ABOVE button */}
        {selectedJudetId && localitatiOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-6 w-full max-w-md"
          >
            <div className="relative">
              {/* Animated Search Icon */}
              <motion.div
                animate={{
                  scale: isSearchFocused ? 1.15 : 1,
                  rotate: localitateSearch.length >= 3 ? [0, -10, 10, -10, 0] : 0,
                }}
                transition={{
                  scale: { duration: 0.2 },
                  rotate: {
                    duration: 0.5,
                    repeat: localitateSearch.length >= 3 ? Infinity : 0,
                    repeatDelay: 2,
                  },
                }}
                className="absolute top-1/2 left-3 -translate-y-1/2"
              >
                <Search className="text-muted-foreground h-5 w-5 transition-colors duration-200" />
              </motion.div>

              {/* Input with animated placeholder */}
              <div className="relative">
                <Input
                  value={localitateSearch}
                  onChange={(e) => setLocalitateSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={SEARCH_INPUT_CLASSES}
                  aria-label="Caută localitate pentru auto-scroll"
                />

                {/* Custom animated placeholder that fades on focus */}
                <AnimatePresence>
                  {!isSearchFocused && localitateSearch.length === 0 && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-muted-foreground pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-sm sm:text-base"
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
                    >
                      Caută localitate...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Character counter with animation */}
              <AnimatePresence>
                {localitateSearch.length > 0 && localitateSearch.length < 3 && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground mt-1 block text-center text-xs"
                  >
                    Introdu încă {3 - localitateSearch.length} caracter
                    {3 - localitateSearch.length === 1 ? "" : "e"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </form>
    </Form>
  );
}
