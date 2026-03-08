"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** "sm" = 400px, "md" = 520px (default), "lg" = 680px, "xl" = 820px */
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  /** Optional footer buttons rendered below children */
  footer?: React.ReactNode;
}

const SIZE_MAP: Record<Required<AdminModalProps>["size"], string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  size = "md",
  children,
  footer,
}: AdminModalProps): React.JSX.Element {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full rounded-2xl",
              "bg-card border-border border",
              "shadow-[0_25px_60px_rgba(0,0,0,0.45)]",
              "flex max-h-[90vh] flex-col",
              SIZE_MAP[size]
            )}
          >
            {/* Header */}
            <div className="border-border flex shrink-0 items-center justify-between border-b px-5 py-4">
              <h3 className="text-foreground text-[0.95rem] font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1 transition-all hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {/* Footer */}
            {footer && <div className="border-border shrink-0 border-t px-5 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
