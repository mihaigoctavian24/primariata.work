"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  passwordChangeSchema,
  type PasswordChangeFormData,
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PasswordChangeForm({ onSuccess, onError }: PasswordChangeFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  // Watch new password for strength indicator
  const newPassword = watch("new_password");

  // Calculate strength when password changes
  useState(() => {
    if (newPassword) {
      setPasswordStrength(calculatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(0);
    }
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      setLoading(true);
      setSuccess(false);

      const supabase = createClient();

      // First verify current password by attempting to sign in
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user?.email) {
        throw new Error("Utilizator neautentificat");
      }

      // Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.current_password,
      });

      if (signInError) {
        throw new Error("Parola curentă este incorectă");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (updateError) {
        throw updateError;
      }

      // Success
      setSuccess(true);
      reset();
      setPasswordStrength(0);
      onSuccess?.();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la schimbarea parolei";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength when new password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="current_password">
          Parola curentă <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="current_password"
            type={showCurrentPassword ? "text" : "password"}
            placeholder="Introduceți parola curentă"
            {...register("current_password")}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            tabIndex={-1}
            aria-label={showCurrentPassword ? "Ascunde parola curentă" : "Arată parola curentă"}
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.current_password && (
          <p className="text-destructive text-sm">{errors.current_password.message}</p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new_password">
          Parolă nouă <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="new_password"
            type={showNewPassword ? "text" : "password"}
            placeholder="Introduceți parola nouă"
            {...register("new_password", {
              onChange: handlePasswordChange,
            })}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            tabIndex={-1}
            aria-label={showNewPassword ? "Ascunde parola nouă" : "Arată parola nouă"}
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.new_password && (
          <p className="text-destructive text-sm">{errors.new_password.message}</p>
        )}

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Puterea parolei:</span>
              <span className="font-medium">{getPasswordStrengthLabel(passwordStrength)}</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    index <= passwordStrength
                      ? getPasswordStrengthColor(passwordStrength)
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm_password">
          Confirmă parola <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-introduceți parola nouă"
            {...register("confirm_password")}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            tabIndex={-1}
            aria-label={
              showConfirmPassword ? "Ascunde confirmarea parolei" : "Arată confirmarea parolei"
            }
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-destructive text-sm">{errors.confirm_password.message}</p>
        )}
      </div>

      {/* Requirements */}
      <div className="bg-muted rounded-lg p-3">
        <p className="text-muted-foreground mb-2 text-xs font-medium">Cerințe parolă:</p>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>• Minim 8 caractere</li>
          <li>• Cel puțin o literă mare</li>
          <li>• Cel puțin o literă mică</li>
          <li>• Cel puțin o cifră</li>
          <li>• Cel puțin un caracter special (!@#$%^&*)</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Schimbă parola
        </Button>

        {success && (
          <div className="flex items-center gap-2 text-green-600" role="alert" aria-live="polite">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-medium">Parola schimbată cu succes!</span>
          </div>
        )}
      </div>
    </form>
  );
}
