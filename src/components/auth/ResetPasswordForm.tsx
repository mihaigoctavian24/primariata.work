"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, CheckCircle2 } from "lucide-react";

/**
 * ResetPasswordForm Component
 *
 * Form for requesting password reset email:
 * - Email input with validation
 * - Supabase resetPasswordForEmail integration
 * - Success message display
 * - Error handling
 *
 * @example
 * <ResetPasswordForm />
 */

interface ResetPasswordFormProps {
  className?: string;
}

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ className = "" }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Send password reset email with redirect URL
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) {
        throw resetError;
      }

      // Show success message
      setUserEmail(data.email);
      setEmailSent(true);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "A apărut o eroare la trimiterea emailului. Te rugăm să încerci din nou."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Success state
  if (emailSent) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-primary mt-0.5 size-5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-foreground text-sm font-semibold">Email trimis cu succes!</p>
              <p className="text-foreground text-sm">
                Am trimis instrucțiuni de resetare la <strong>{userEmail}</strong>
              </p>
              <p className="text-muted-foreground text-xs">
                Verifică și folderul de spam dacă nu găsești emailul.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              Înapoi la autentificare
            </Button>
          </Link>
          <p className="text-muted-foreground text-center text-xs">
            Nu ai primit emailul?{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                form.reset();
              }}
              className="text-primary hover:underline"
            >
              Încearcă din nou
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Request form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg border border-red-200 p-3 text-sm dark:border-red-900">
            {error}
          </div>
        )}

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresa de email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="nume@exemplu.ro"
                    className="pl-10"
                    disabled={isLoading}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Se trimite...
            </span>
          ) : (
            "Trimite link de resetare"
          )}
        </Button>

        {/* Back to Login Link */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Înapoi la autentificare
          </Link>
        </div>
      </form>
    </Form>
  );
}
