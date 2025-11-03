"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

/**
 * RegisterForm Component
 *
 * Registration form with:
 * - Full name, email, password, confirm password fields
 * - Password strength indicator
 * - Terms and conditions checkbox
 * - Google OAuth integration
 * - Email verification flow
 * - Real-time and submit validation (Zod)
 * - Loading and error states
 * - Success animations
 *
 * @example
 * <RegisterForm redirectTo="/dashboard" />
 */

// Password strength validation
const passwordSchema = z
  .string()
  .min(8, "Parola trebuie să conțină minim 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Numele trebuie să conțină minim 3 caractere"),
    email: z.string().email("Adresa de email invalidă"),
    password: passwordSchema,
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Trebuie să accepți termenii și condițiile",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  redirectTo?: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function RegisterForm({
  redirectTo = null,
  onSuccess,
  onError,
  className = "",
}: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const supabase = createClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
          emailRedirectTo: redirectTo
            ? `${window.location.origin}/auth/callback?next=${redirectTo}`
            : `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        // Handle specific errors
        const errorMessage =
          signUpError.message.includes("already registered") ||
          signUpError.message.includes("already been registered")
            ? "Această adresă de email este deja înregistrată"
            : signUpError.message.includes("weak")
              ? "Parola este prea slabă"
              : signUpError.message;

        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (data.user) {
        setUserEmail(values.email);
        setEmailSent(true);
        onSuccess?.();
      }
    } catch (err) {
      const errorMsg = "A apărut o eroare. Te rugăm să încerci din nou.";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    try {
      setIsGoogleLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo
            ? `${window.location.origin}/auth/callback?next=${redirectTo}`
            : `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        onError?.(signInError.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      const errorMsg = "A apărut o eroare la înregistrarea cu Google.";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("Google sign-up error:", err);
      setIsGoogleLoading(false);
    }
  }

  async function handleResendEmail() {
    try {
      setResendLoading(true);
      setError(null);

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        // Show success message briefly
        setError(null);
      }
    } catch (err) {
      setError("A apărut o eroare la retrimiterea emailului.");
      console.error("Resend email error:", err);
    } finally {
      setResendLoading(false);
    }
  }

  // Prevent hydration errors by only rendering on client
  if (!mounted) {
    return null;
  }

  // Show email verification message after successful registration
  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-950">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Verifică-ți emailul
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>Am trimis un email de confirmare la:</p>
                <p className="mt-1 font-semibold">{userEmail}</p>
                <p className="mt-2">
                  Te rugăm să verifici inbox-ul și să dai click pe linkul de confirmare pentru a-ți
                  activa contul.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resend Email Button */}
        <div className="text-center">
          <p className="text-muted-foreground mb-2 text-sm">Nu ai primit emailul?</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResendEmail}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Se trimite...
              </span>
            ) : (
              "Retrimite emailul"
            )}
          </Button>
        </div>

        {/* Back to Login */}
        <div className="border-border border-t pt-4 text-center">
          <p className="text-muted-foreground text-sm">
            Ai deja cont?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Intră în cont
            </Link>
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className={className}
    >
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="bg-destructive/10 mb-6 rounded-md p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-destructive text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isLoading}
      >
        {isGoogleLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="size-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Se încarcă...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Înregistrează-te cu Google
          </span>
        )}
      </Button>

      <div className="relative my-6">
        <Separator />
        <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
          SAU
        </span>
      </div>

      {/* Registration Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name Field */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nume complet</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Ion Popescu"
                    autoComplete="name"
                    disabled={isLoading || isGoogleLoading}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nume@exemplu.ro"
                    autoComplete="email"
                    disabled={isLoading || isGoogleLoading}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field with Strength Indicator */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parolă</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <PasswordStrengthIndicator password={field.value} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmă parola</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading || isGoogleLoading}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Terms Checkbox */}
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || isGoogleLoading}
                  />
                </FormControl>
                <div className="flex-1 space-y-1">
                  <FormLabel className="text-sm leading-relaxed font-normal">
                    Accept{" "}
                    <Link
                      href="/termeni"
                      className="text-primary font-medium whitespace-nowrap hover:underline"
                    >
                      termenii și condițiile
                    </Link>{" "}
                    și{" "}
                    <Link
                      href="/confidentialitate"
                      className="text-primary font-medium whitespace-nowrap hover:underline"
                    >
                      politica de confidențialitate
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Se creează contul...
              </span>
            ) : (
              "Creează cont"
            )}
          </Button>
        </form>
      </Form>

      {/* Login Link */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Ai deja cont?{" "}
        <Link
          href="/auth/login"
          className="text-primary font-medium hover:underline"
          tabIndex={isLoading || isGoogleLoading ? -1 : 0}
        >
          Intră în cont
        </Link>
      </p>
    </motion.div>
  );
}
