"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { personalInfoSchema, type PersonalInfoFormData } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

interface PersonalInfoFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PersonalInfoForm({ onSuccess, onError }: PersonalInfoFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
  });

  // Fetch current user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        setFetchingData(true);
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Set form values from user metadata
          setValue("email", user.email || "");
          setValue("full_name", user.user_metadata?.full_name || "");
          setValue("phone", user.user_metadata?.phone || "");
          setValue("birth_date", user.user_metadata?.birth_date || "");
          setValue("cnp", user.user_metadata?.cnp || "");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        onError?.("Eroare la încărcarea datelor utilizatorului");
      } finally {
        setFetchingData(false);
      }
    }

    fetchUserData();
  }, [setValue, onError]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      setLoading(true);
      setSuccess(false);

      const supabase = createClient();

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          phone: data.phone || null,
          birth_date: data.birth_date || null,
          cnp: data.cnp || null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Success
      setSuccess(true);
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la salvarea datelor";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="full_name">
          Nume complet <span className="text-destructive">*</span>
        </Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Ex: Ion Popescu"
          {...register("full_name")}
          disabled={loading}
        />
        {errors.full_name && (
          <p className="text-destructive text-sm">{String(errors.full_name.message)}</p>
        )}
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-muted-foreground text-xs">(nemodificabil)</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-muted-foreground text-xs">
          Pentru modificarea emailului, contactați administratorul.
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Ex: 0712345678 sau +40712345678"
          {...register("phone")}
          disabled={loading}
        />
        {errors.phone && <p className="text-destructive text-sm">{String(errors.phone.message)}</p>}
      </div>

      {/* Birth Date */}
      <div className="space-y-2">
        <Label htmlFor="birth_date">Data nașterii</Label>
        <Input
          id="birth_date"
          type="date"
          {...register("birth_date")}
          disabled={loading}
          max={new Date().toISOString().split("T")[0]}
        />
        {errors.birth_date && (
          <p className="text-destructive text-sm">{String(errors.birth_date.message)}</p>
        )}
      </div>

      {/* CNP */}
      <div className="space-y-2">
        <Label htmlFor="cnp">CNP</Label>
        <Input
          id="cnp"
          type="text"
          placeholder="Ex: 1234567890123"
          maxLength={13}
          {...register("cnp")}
          disabled={loading}
        />
        {errors.cnp && <p className="text-destructive text-sm">{String(errors.cnp.message)}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvează modificările
        </Button>

        {success && (
          <div className="flex items-center gap-2 text-green-600" role="alert" aria-live="polite">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Date salvate cu succes!</span>
          </div>
        )}
      </div>
    </form>
  );
}
