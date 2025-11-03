"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Lock, AlertCircle } from "lucide-react";

/**
 * UpdatePasswordForm Component
 *
 * Form for updating password after reset:
 * - Token verification from URL
 * - New password with strength indicator
 * - Confirm password validation
 * - Supabase updateUser integration
 * - Redirect to success page
 *
 * @example
 * <UpdatePasswordForm />
 */

interface UpdatePasswordFormProps {
  className?: string;
}

// Validation schema
const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Parola trebuie să conțină minim 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
      .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm({ className = "" }: UpdatePasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verify token on component mount
  useEffect(() => {
    async function verifyToken() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If there's a session, the token is valid
        setTokenValid(!!session);

        if (!session) {
          setError(
            "Link-ul de resetare este invalid sau a expirat. Te rugăm să soliciți unul nou."
          );
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setTokenValid(false);
        setError("A apărut o eroare la verificarea link-ului. Te rugăm să încerci din nou.");
      }
    }

    if (mounted) {
      verifyToken();
    }
  }, [mounted]);

  async function onSubmit(data: UpdatePasswordFormData) {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        throw updateError;
      }

      // Redirect to success page
      router.push("/auth/password-reset-success");
    } catch (err) {
      console.error("Password update error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "A apărut o eroare la actualizarea parolei. Te rugăm să încerci din nou."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading while checking token
  if (!mounted || tokenValid === null) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-destructive mt-0.5 size-5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-destructive text-sm font-medium">Link invalid sau expirat</p>
              <p className="text-destructive/80 text-sm">{error}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => router.push("/auth/reset-password")}
          variant="outline"
          className="w-full"
        >
          Solicită un nou link
        </Button>
      </div>
    );
  }

  // Show update password form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg border border-red-200 p-3 text-sm dark:border-red-900">
            {error}
          </div>
        )}

        {/* New Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parolă nouă</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2" />
                  <Input
                    type="password"
                    placeholder="••••••••"
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

        {/* Password Strength Indicator */}
        {password && <PasswordStrengthIndicator password={password} />}

        {/* Confirm Password Field */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmă parola</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2" />
                  <Input
                    type="password"
                    placeholder="••••••••"
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
              Se actualizează...
            </span>
          ) : (
            "Actualizează parola"
          )}
        </Button>
      </form>
    </Form>
  );
}
