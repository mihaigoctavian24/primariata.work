"use client";

import { logger } from "@/lib/logger";
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
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * AdminLoginForm Component
 *
 * Email + password login form for staff/admin users with Google OAuth.
 * Key differences from citizen LoginForm:
 * - No "Remember me" checkbox
 * - No registration link (staff are invited)
 * - Post-login role check via user_primarii table
 * - Auto-detect primarie from user_primarii join
 *
 * @example
 * <AdminLoginForm />
 */

const ADMIN_ROLES = ["admin", "functionar", "primar", "super_admin"] as const;

const adminLoginSchema = z.object({
  email: z.string().email("Adresa de email invalida"),
  password: z.string().min(8, "Parola trebuie sa contina minim 8 caractere"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

interface AdminLoginFormProps {
  className?: string;
}

export function AdminLoginForm({ className = "" }: AdminLoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRedirect, setErrorRedirect] = useState<{
    text: string;
    href: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const supabase = createClient();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: AdminLoginFormValues): Promise<void> {
    try {
      setIsLoading(true);
      setError(null);
      setErrorRedirect(null);

      // Step 1: Authenticate with email + password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        const errorMessage = signInError.message.includes("Invalid login credentials")
          ? "Email sau parola gresita"
          : signInError.message.includes("Email not confirmed")
            ? "Te rugam sa confirmi adresa de email"
            : signInError.message;

        setError(errorMessage);
        return;
      }

      if (!data.user) {
        setError("A aparut o eroare la autentificare.");
        return;
      }

      // Step 2: Check user_primarii for staff role
      const { data: staffAssociation, error: assocError } = await supabase
        .from("user_primarii")
        .select("primarie_id, rol, primarii(localitate_id, localitati(slug, judete(slug)))")
        .eq("user_id", data.user.id)
        .in("rol", ADMIN_ROLES)
        .eq("status", "approved")
        .limit(1)
        .single();

      if (assocError || !staffAssociation) {
        // Not a staff user - sign out and show error
        await supabase.auth.signOut();
        setError("Contul tau nu are acces la panoul de administrare.");
        setErrorRedirect({
          text: "Esti cetatean? Selecteaza localitatea ta",
          href: "/?step=2",
        });
        return;
      }

      // Step 3: Extract slugs and redirect to admin dashboard
      const primarii = staffAssociation.primarii as unknown as {
        localitate_id: number;
        localitati: {
          slug: string;
          judete: {
            slug: string;
          };
        };
      };

      const judetSlug = primarii?.localitati?.judete?.slug;
      const localitateSlug = primarii?.localitati?.slug;

      if (!judetSlug || !localitateSlug) {
        await supabase.auth.signOut();
        setError("Nu s-a putut determina primaria asociata contului.");
        return;
      }

      setSuccess(true);
      const rolePath = staffAssociation.rol === "primar" ? "primar" : "admin";
      router.push(`/app/${judetSlug}/${localitateSlug}/${rolePath}`);
    } catch (err) {
      const errorMsg = "A aparut o eroare. Te rugam sa incerci din nou.";
      setError(errorMsg);
      logger.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    try {
      setIsGoogleLoading(true);
      setError(null);
      setErrorRedirect(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError("A aparut o eroare la autentificarea cu Google.");
      logger.error("Google sign-in error:", err);
      setIsGoogleLoading(false);
    }
  }

  // Prevent hydration errors
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
            Autentificare reusita! Redirectionare...
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
          {errorRedirect && (
            <Link
              href={errorRedirect.href}
              className="text-primary mt-2 inline-block text-sm hover:underline"
            >
              {errorRedirect.text}
            </Link>
          )}
        </motion.div>
      )}

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        className="border-primary/30 hover:border-primary/60 hover:bg-primary/5 w-full transition-colors"
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
            Se incarca...
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
            Continua cu Google
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
                    placeholder="nume@primarie.ro"
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
                  <FormLabel>Parola</FormLabel>
                  <Link
                    href="/auth/reset-password?return=admin"
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

          {/* Submit Button */}
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
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
                Se incarca...
              </span>
            ) : (
              "Autentificare"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
