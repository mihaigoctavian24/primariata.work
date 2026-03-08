"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { X, Mail, UserPlus } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  primarieId: string;
}

const ROLES = [
  { value: "functionar", label: "Funcționar" },
  { value: "primar", label: "Primar" },
] as const;

const DEPARTMENTS = [
  "Registratură",
  "Urbanism și Amenajarea Teritoriului",
  "Stare Civilă",
  "Taxe și Impozite Locale",
  "Asistență Socială",
  "Mediu",
  "Juridic",
  "Resurse Umane",
] as const;

// ============================================================================
// Component
// ============================================================================

export function InviteModal({ open, onClose, primarieId }: InviteModalProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("functionar");
  const [department, setDepartment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  function handleClose(): void {
    setEmail("");
    setRole("functionar");
    setDepartment("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    // Academic milestone: mock invite — no actual email sending
    // primarieId would be used when wiring a real Server Action
    void primarieId;
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    toast.success("Invitație trimisă!", {
      description: `Un email va fi trimis la ${email}`,
    });
    handleClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="invite-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="invite-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-1/2 left-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-card border-border rounded-2xl border p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="bg-accent-500/15 text-accent-500 flex h-8 w-8 items-center justify-center rounded-lg">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-semibold text-white">Invită Personal</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                  aria-label="Închide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/60">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="utilizator@primarie.ro"
                      className="focus:border-accent-500/50 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pr-4 pl-9 text-sm text-white placeholder-white/30 transition-colors outline-none focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/60">
                    Rol <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="focus:border-accent-500/50 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white transition-colors outline-none focus:bg-white/[0.06]"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-gray-900 text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-white/60">
                    Departament <span className="text-white/30">(opțional)</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="focus:border-accent-500/50 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white transition-colors outline-none focus:bg-white/[0.06]"
                  >
                    <option value="" className="bg-gray-900 text-white">
                      — Selectează departament —
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-gray-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white/80"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    style={{ background: "var(--accent-gradient)" }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {submitting ? "Se trimite..." : "Trimite Invitația"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
