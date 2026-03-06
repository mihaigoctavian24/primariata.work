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
 * Email + password login form for staff/admin users.
 * Key differences from citizen LoginForm:
 * - No Google OAuth button
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
      router.push(`/app/${judetSlug}/${localitateSlug}/admin`);
    } catch (err) {
      const errorMsg = "A aparut o eroare. Te rugam sa incerci din nou.";
      setError(errorMsg);
      logger.error("Admin login error:", err);
    } finally {
      setIsLoading(false);
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
                    disabled={isLoading || success}
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
                    tabIndex={isLoading || success ? -1 : 0}
                  >
                    Ai uitat parola?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading || success}
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
            className="w-full"
            style={{ background: "var(--accent-gradient)" }}
            disabled={isLoading || success}
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
