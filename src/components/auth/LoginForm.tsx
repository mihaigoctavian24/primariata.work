"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import { getLocation } from "@/lib/location-storage";

/**
 * LoginForm Component
 *
 * Extracted login form with:
 * - Email/password validation (Zod)
 * - Google OAuth integration
 * - Remember me checkbox
 * - Loading and error states
 * - Enhanced focus states with glow effects
 * - Success animations
 *
 * @example
 * <LoginForm redirectTo="/dashboard" />
 */

const loginSchema = z.object({
  email: z.string().email("Adresa de email invalidă"),
  password: z.string().min(8, "Parola trebuie să conțină minim 8 caractere"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo?: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function LoginForm({
  redirectTo = null,
  onSuccess,
  onError,
  className = "",
}: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const supabase = createClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        const errorMessage = signInError.message.includes("Invalid login credentials")
          ? "Email sau parolă greșită"
          : signInError.message.includes("Email not confirmed")
            ? "Te rugăm să confirmi adresa de email"
            : signInError.message;

        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (data.session) {
        setSuccess(true);
        onSuccess?.();

        // Redirect logic
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          const savedLocation = getLocation();
          if (savedLocation) {
            router.push(
              `/app/${savedLocation.judetSlug}/${savedLocation.localitateSlug}/dashboard`
            );
          } else {
            router.push("/");
          }
        }
      }
    } catch (err) {
      const errorMsg = "A apărut o eroare. Te rugăm să încerci din nou.";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
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
      const errorMsg = "A apărut o eroare la autentificarea cu Google.";
      setError(errorMsg);
      onError?.(errorMsg);
      console.error("Google sign-in error:", err);
      setIsGoogleLoading(false);
    }
  }

  // Prevent hydration errors by only rendering on client
  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className={className}
    >
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-950"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Autentificare reușită! Redirecționare...
          </p>
        </motion.div>
      )}

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
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading || success}
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
            Continuă cu Google
          </span>
        )}
      </Button>

      <div className="relative my-6">
        <Separator />
        <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
          SAU
        </span>
      </div>

      {/* Email/Password Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    disabled={isLoading || isGoogleLoading || success}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Parolă</FormLabel>
                  <Link
                    href="/auth/reset-password"
                    className="text-primary text-sm hover:underline"
                    tabIndex={isLoading || isGoogleLoading || success ? -1 : 0}
                  >
                    Ai uitat parola?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading || isGoogleLoading || success}
                    className="focus:ring-primary transition-all focus:ring-2 focus:ring-offset-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me Checkbox */}
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <input
                    type="checkbox"
                    className="border-input focus:ring-primary size-4 rounded transition-all focus:ring-2 focus:ring-offset-2"
                    disabled={isLoading || isGoogleLoading || success}
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">Ține-mă conectat</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isGoogleLoading || success}
          >
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
                Se încarcă...
              </span>
            ) : (
              "Intră în cont"
            )}
          </Button>
        </form>
      </Form>

      {/* Registration Link */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Nu ai cont?{" "}
        <Link
          href="/auth/register"
          className="text-primary font-medium hover:underline"
          tabIndex={isLoading || isGoogleLoading || success ? -1 : 0}
        >
          Înregistrează-te
        </Link>
      </p>
    </motion.div>
  );
}
