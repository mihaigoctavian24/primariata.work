"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { acceptInviteSchema, type AcceptInviteFormData } from "@/lib/validations/staff-invite";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Clock, User, Shield } from "lucide-react";

/**
 * AcceptInviteForm Component
 *
 * Form for accepting staff invitations and creating accounts.
 *
 * Features:
 * - Token validation on mount
 * - Invitation details display (role, inviter, expiration)
 * - Pre-filled email (read-only)
 * - Password creation with strength indicator
 * - Password confirmation validation
 * - Automatic role assignment via metadata
 * - Success redirect to login
 * - Error handling with user-friendly messages
 *
 * Flow:
 * 1. Load invitation by token
 * 2. Validate: pending, not expired
 * 3. Display invitation details
 * 4. User creates password
 * 5. signUp() with invitation_token in metadata
 * 6. Trigger detects token and assigns role
 * 7. Invitation marked as accepted
 * 8. Redirect to login with success message
 *
 * @param token - Invitation token from URL query
 */

interface Invitation {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol: string;
  expires_at: string;
  invited_by_name?: string;
  primarie_name?: string;
}

interface AcceptInviteFormProps {
  token: string | null;
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);

  const form = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");

  // =====================================================
  // Token Validation and Invitation Loading
  // =====================================================

  useEffect(() => {
    if (!token) {
      setError("Token de invitație lipsă. Te rugăm să verifici linkul din email.");
      setIsValidating(false);
      return;
    }

    validateInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function validateInvitation() {
    if (!token) return;

    try {
      setIsValidating(true);
      setError(null);

      // Query invitation with joined data
      const { data: invitationData, error: invitationError } = await supabase
        .from("user_invitations")
        .select(
          `
          id,
          email,
          nume,
          prenume,
          rol,
          expires_at,
          status,
          invited_by,
          primarie_id
        `
        )
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (invitationError || !invitationData) {
        setError(
          "Invitația nu a fost găsită sau a fost deja utilizată. Te rugăm să verifici linkul."
        );
        setIsValidating(false);
        return;
      }

      // Check expiration
      const expiresAt = new Date(invitationData.expires_at);
      if (expiresAt < new Date()) {
        setError(
          "Această invitație a expirat. Te rugăm să contactezi administratorul pentru o invitație nouă."
        );
        setIsValidating(false);
        return;
      }

      // Get inviter name (optional)
      let inviterName = "Administrator";
      try {
        const { data: inviterData } = await supabase
          .from("utilizatori")
          .select("nume, prenume")
          .eq("id", invitationData.invited_by)
          .single();

        if (inviterData) {
          inviterName = `${inviterData.prenume} ${inviterData.nume}`;
        }
      } catch {
        // Ignore error - not critical
      }

      // Get primarie name (optional)
      let primarieName = "Primăria";
      try {
        const { data: primarieData } = await supabase
          .from("primarii")
          .select("nume_oficial")
          .eq("id", invitationData.primarie_id)
          .single();

        if (primarieData) {
          primarieName = primarieData.nume_oficial;
        }
      } catch {
        // Ignore error - not critical
      }

      setInvitation({
        ...invitationData,
        invited_by_name: inviterName,
        primarie_name: primarieName,
      });

      setIsValidating(false);
    } catch (err) {
      console.error("Error validating invitation:", err);
      setError("A apărut o eroare la validarea invitației. Te rugăm să încerci din nou.");
      setIsValidating(false);
    }
  }

  // =====================================================
  // Form Submission
  // =====================================================

  async function onSubmit(values: AcceptInviteFormData) {
    if (!token || !invitation) return;

    setIsLoading(true);
    setError(null);

    try {
      // Sign up with invitation token in metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: values.password,
        options: {
          data: {
            full_name: `${invitation.prenume} ${invitation.nume}`,
            invitation_token: token,
          },
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error("Failed to create user");
      }

      // Success! Redirect to login with success message
      router.push(
        `/auth/login?message=${encodeURIComponent(
          "Cont creat cu succes! Te rugăm să te autentifici."
        )}`
      );
    } catch (err: unknown) {
      console.error("Error accepting invitation:", err);

      // Type-safe error handling
      if (err instanceof Error) {
        if (err.message.includes("already registered")) {
          setError("Un utilizator cu această adresă de email există deja.");
        } else {
          setError(`Eroare la crearea contului: ${err.message}`);
        }
      } else {
        setError("A apărut o eroare la crearea contului. Te rugăm să încerci din nou.");
      }

      setIsLoading(false);
    }
  }

  // =====================================================
  // Render States
  // =====================================================

  // Loading state
  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Validare invitație...</p>
      </div>
    );
  }

  // Error state (no invitation found)
  if (error && !invitation) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Success state (invitation valid)
  if (!invitation) {
    return null;
  }

  // Role label mapping
  const roleLabels: Record<string, string> = {
    functionar: "Funcționar",
    admin: "Administrator",
  };

  const roleLabel = roleLabels[invitation.rol] || invitation.rol;

  // Calculate time remaining
  const expiresAt = new Date(invitation.expires_at);
  const hoursRemaining = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  const expirationText =
    daysRemaining > 0
      ? `Expiră în ${daysRemaining} ${daysRemaining === 1 ? "zi" : "zile"}`
      : `Expiră în ${hoursRemaining} ${hoursRemaining === 1 ? "oră" : "ore"}`;

  return (
    <div className="space-y-6">
      {/* Invitation Details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-muted/50 space-y-4 rounded-lg border p-4"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="text-muted-foreground h-4 w-4" />
              <p className="text-sm font-medium">Invitat de</p>
            </div>
            <p className="text-muted-foreground text-sm">{invitation.invited_by_name}</p>
          </div>

          <Badge variant="outline" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>{roleLabel}</span>
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <p className="text-sm font-medium">Valabilitate</p>
          </div>
          <p className="text-muted-foreground text-sm">{expirationText}</p>
        </div>

        {invitation.primarie_name && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-muted-foreground text-xs">Primărie</p>
            <p className="text-sm font-medium">{invitation.primarie_name}</p>
          </div>
        )}
      </motion.div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (read-only) */}
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" value={invitation.email} disabled className="bg-muted" />
            </FormControl>
            <p className="text-muted-foreground text-xs">
              Email-ul tău este pre-completat din invitație
            </p>
          </FormItem>

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parolă</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minim 8 caractere"
                    disabled={isLoading}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <PasswordStrengthIndicator password={password} />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmă parola</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repetă parola"
                    disabled={isLoading}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se creează contul...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Acceptă invitația și creează cont
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Security Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-muted-foreground text-center text-xs"
      >
        După crearea contului, vei fi redirecționat către pagina de autentificare.
      </motion.p>
    </div>
  );
}
