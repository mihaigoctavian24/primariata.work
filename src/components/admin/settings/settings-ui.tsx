"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType, InputHTMLAttributes, ButtonHTMLAttributes } from "react";

// ============================================================================
// InputWithIcon
// ============================================================================

interface InputWithIconProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  icon: ComponentType<{ className?: string }>;
  error?: string;
  label?: string;
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  function InputWithIcon({ icon: Icon, error, label, ...inputProps }, ref) {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.8rem" }}>
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2.5",
            error && "border-red-500/50"
          )}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Icon className="h-4 w-4 shrink-0 text-gray-600" />
          <input
            ref={ref}
            className={cn(
              "text-foreground flex-1 bg-transparent outline-none placeholder:text-gray-600",
              inputProps.readOnly && "text-muted-foreground"
            )}
            style={{ fontSize: "0.88rem" }}
            {...inputProps}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

// ============================================================================
// GradientSaveButton
// ============================================================================

interface GradientSaveButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  loading?: boolean;
  label?: string;
  icon?: ComponentType<{ className?: string }>;
}

export function GradientSaveButton({
  loading = false,
  label = "Salveaza",
  icon: CustomIcon,
  ...buttonProps
}: GradientSaveButtonProps): React.JSX.Element {
  const ButtonIcon = CustomIcon ?? Save;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading || buttonProps.disabled}
      className="flex items-center gap-2 self-start rounded-xl px-5 py-2.5 text-white disabled:opacity-60"
      style={{ background: "var(--accent-gradient)" }}
      {...(buttonProps as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ButtonIcon className="h-4 w-4" />}
      <span style={{ fontSize: "0.88rem" }}>{label}</span>
    </motion.button>
  );
}

// ============================================================================
// AnimatedToggle
// ============================================================================

interface AnimatedToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AnimatedToggle({
  checked,
  onCheckedChange,
  disabled = false,
}: AnimatedToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="relative h-6 w-11 cursor-pointer rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: checked ? "var(--accent-gradient)" : "rgba(255,255,255,0.1)",
      }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white"
      />
    </button>
  );
}
