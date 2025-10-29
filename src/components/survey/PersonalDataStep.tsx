"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectJudet } from "@/components/location/SelectJudet";
import { SelectLocalitate } from "@/components/location/SelectLocalitate";
import { GDPRConsent } from "@/components/survey/GDPRConsent";
import type { PersonalDataForm } from "@/types/survey";
import type { Judet, ApiResponse } from "@/types/api";

const personalDataSchema = z.object({
  firstName: z
    .string()
    .min(2, "Prenumele trebuie să conțină cel puțin 2 caractere")
    .max(100, "Prenumele este prea lung"),
  lastName: z
    .string()
    .min(2, "Numele trebuie să conțină cel puțin 2 caractere")
    .max(100, "Numele este prea lung"),
  email: z.string().email("Adresa de email nu este validă").optional().or(z.literal("")),
  ageCategory: z.enum(["18-25", "26-35", "36-45", "46-60", "60+"] as const).optional(),
  county: z.string().min(1, "Județul este obligatoriu"),
  locality: z.string().min(1, "Localitatea este obligatorie"),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: "Trebuie să accepți Politica de Confidențialitate pentru a continua",
  }),
});

type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

interface PersonalDataStepProps {
  defaultValues?: Partial<PersonalDataForm>;
  onSubmit: (data: PersonalDataForm) => void;
  onBack?: () => void;
}

export function PersonalDataStep({ defaultValues, onSubmit, onBack }: PersonalDataStepProps) {
  const [selectedJudetId, setSelectedJudetId] = useState<number | null>(null);
  const [selectedLocalitateId, setSelectedLocalitateId] = useState<number | null>(null);
  const [judete, setJudete] = useState<Judet[]>([]);

  const form = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || "",
      lastName: defaultValues?.lastName || "",
      email: defaultValues?.email || "",
      ageCategory: defaultValues?.ageCategory,
      county: defaultValues?.county || "",
      locality: defaultValues?.locality || "",
      gdprConsent: false,
    },
  });

  // Fetch județe on mount for name lookup
  useEffect(() => {
    const fetchJudete = async () => {
      try {
        const response = await fetch("/api/localitati/judete");
        const data = (await response.json()) as ApiResponse<Judet[]>;
        if (response.ok) {
          setJudete(data.data);
        }
      } catch (err) {
        console.error("Error fetching județe:", err);
      }
    };
    fetchJudete();
  }, []);

  const handleJudetSelect = (judetId: number) => {
    setSelectedJudetId(judetId);
    setSelectedLocalitateId(null);

    // Find județ name and set it in form
    const judet = judete.find((j) => j.id === judetId);
    if (judet) {
      form.setValue("county", judet.nume);
      form.setValue("locality", ""); // Reset locality when county changes
    }
  };

  const handleLocalitateSelect = (localitateId: number, localitateNume: string) => {
    setSelectedLocalitateId(localitateId);
    form.setValue("locality", localitateNume);
    form.trigger("locality"); // Explicitly trigger validation
  };

  const handleFormSubmit = (data: PersonalDataFormValues) => {
    // Convert empty email string to undefined
    const formData: PersonalDataForm = {
      ...data,
      email: data.email || undefined,
    };

    onSubmit(formData);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Date personale</h1>
        <p className="text-muted-foreground">
          Completează câteva informații despre tine. Email-ul este opțional.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Prenume <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ion" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nume <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Popescu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opțional)</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ion.popescu@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Dacă dorești să primești rezultatele chestionarului
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age Category */}
          <FormField
            control={form.control}
            name="ageCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie de vârstă (opțional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează categoria de vârstă" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 ani</SelectItem>
                    <SelectItem value="26-35">26-35 ani</SelectItem>
                    <SelectItem value="36-45">36-45 ani</SelectItem>
                    <SelectItem value="46-60">46-60 ani</SelectItem>
                    <SelectItem value="60+">60+ ani</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* County */}
          <FormField
            control={form.control}
            name="county"
            render={() => (
              <FormItem>
                <FormLabel>
                  Județ <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <SelectJudet
                    onSelect={handleJudetSelect}
                    defaultValue={selectedJudetId?.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Locality */}
          <FormField
            control={form.control}
            name="locality"
            render={() => (
              <FormItem>
                <FormLabel>
                  Localitate <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <SelectLocalitate
                    judetId={selectedJudetId}
                    onSelect={handleLocalitateSelect}
                    defaultValue={selectedLocalitateId?.toString()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GDPR Consent */}
          <FormField
            control={form.control}
            name="gdprConsent"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <GDPRConsent
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    error={form.formState.errors.gdprConsent?.message}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Înapoi
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Continuă
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
