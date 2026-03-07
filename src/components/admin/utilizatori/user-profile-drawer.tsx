"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  X,
  User,
  Calendar,
  Clock,
  ShieldOff,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Mail,
  Phone,
  Building2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { approveUser, suspendUser, reactivateUser } from "@/actions/admin-users";

// ============================================================================
// Types
// ============================================================================

interface UtilizatorRow {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol: string;
  status: string | null;
  activ: boolean | null;
  departament: string | null;
  telefon: string | null;
  avatar_url: string | null;
  created_at: string | null;
  last_login_at: string | null;
  primarie_id: string | null;
}

interface UserProfileDrawerProps {
  user: UtilizatorRow | null;
  open: boolean;
  onClose: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function getInitials(nume: string, prenume: string): string {
  return `${prenume.charAt(0)}${nume.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/D";
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function rolLabel(rol: string): string {
  const labels: Record<string, string> = {
    cetatean: "Cetățean",
    functionar: "Funcționar",
    primar: "Primar",
    admin: "Administrator",
    super_admin: "Super Admin",
  };
  return labels[rol] ?? rol;
}

function rolColor(rol: string): string {
  const colors: Record<string, string> = {
    cetatean: "bg-blue-500/15 text-blue-400",
    functionar: "bg-emerald-500/15 text-emerald-400",
    primar: "bg-amber-500/15 text-amber-400",
    admin: "bg-accent-500/15 text-accent-500",
    super_admin: "bg-violet-500/15 text-violet-400",
  };
  return colors[rol] ?? "bg-white/10 text-white/70";
}

function statusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    activ: "Activ",
    suspendat: "Suspendat",
    pending: "În așteptare",
    inactiv: "Inactiv",
  };
  return labels[status ?? ""] ?? "Necunoscut";
}

function statusColor(status: string | null): string {
  const colors: Record<string, string> = {
    activ: "bg-emerald-500/15 text-emerald-400",
    suspendat: "bg-red-500/15 text-red-400",
    pending: "bg-amber-500/15 text-amber-400",
    inactiv: "bg-white/10 text-white/40",
  };
  return colors[status ?? ""] ?? "bg-white/10 text-white/40";
}

// ============================================================================
// Component
// ============================================================================

export function UserProfileDrawer({
  user,
  open,
  onClose,
}: UserProfileDrawerProps): React.ReactElement {
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function handleApprove(): Promise<void> {
    if (!user) return;
    setPendingAction("approve");
    const result = await approveUser(user.id);
    setPendingAction(null);
    if (result.success) {
      toast.success("Utilizator aprobat cu succes");
      onClose();
    } else {
      toast.error("Eroare la aprobare", { description: result.error });
    }
  }

  async function handleSuspend(): Promise<void> {
    if (!user) return;
    setPendingAction("suspend");
    const result = await suspendUser(user.id);
    setPendingAction(null);
    if (result.success) {
      toast.success("Utilizator suspendat");
      onClose();
    } else {
      toast.error("Eroare la suspendare", { description: result.error });
    }
  }

  async function handleReactivate(): Promise<void> {
    if (!user) return;
    setPendingAction("reactivate");
    const result = await reactivateUser(user.id);
    setPendingAction(null);
    if (result.success) {
      toast.success("Utilizator reactivat cu succes");
      onClose();
    } else {
      toast.error("Eroare la reactivare", { description: result.error });
    }
  }

  return (
    <AnimatePresence>
      {open && user && (
        <>
          {/* Overlay */}
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 z-50 flex h-full w-[420px] flex-col overflow-y-auto border-l border-white/[0.06] bg-[var(--surface-raised,#1a1a2e)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-sm font-semibold text-white/80">Profil utilizator</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/80"
                aria-label="Închide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Avatar + identity */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={`${user.prenume} ${user.nume}`}
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-white/[0.08]"
                    />
                  ) : (
                    <div className="bg-accent-500/20 text-accent-500 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold ring-2 ring-white/[0.08]">
                      {getInitials(user.nume, user.prenume)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-white">
                    {user.prenume} {user.nume}
                  </p>
                  <p className="mt-0.5 text-sm text-white/50">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      rolColor(user.rol)
                    )}
                  >
                    {rolLabel(user.rol)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusColor(user.status)
                    )}
                  >
                    {statusLabel(user.status)}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-white/40 uppercase">
                  Detalii cont
                </p>
                <div className="space-y-3">
                  <InfoRow
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={user.email}
                  />
                  <InfoRow
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Telefon"
                    value={user.telefon ?? "N/D"}
                  />
                  {user.departament && (
                    <InfoRow
                      icon={<Building2 className="h-3.5 w-3.5" />}
                      label="Departament"
                      value={user.departament}
                    />
                  )}
                  <InfoRow
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Rol"
                    value={rolLabel(user.rol)}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-white/40 uppercase">
                  Activitate
                </p>
                <div className="space-y-3">
                  <InfoRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Înregistrat"
                    value={formatDate(user.created_at)}
                  />
                  <InfoRow
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Ultima autentificare"
                    value={formatDate(user.last_login_at)}
                  />
                  <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="2FA" value="N/D" />
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-white/40 uppercase">
                  Acțiuni
                </p>
                <div className="flex flex-col gap-2">
                  {/* pending → Aprobă + Respinge */}
                  {user.status === "pending" && (
                    <>
                      <ActionButton
                        onClick={handleApprove}
                        loading={pendingAction === "approve"}
                        variant="success"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        label="Aprobă"
                      />
                      <ActionButton
                        onClick={handleSuspend}
                        loading={pendingAction === "suspend"}
                        variant="danger"
                        icon={<XCircle className="h-4 w-4" />}
                        label="Respinge"
                      />
                    </>
                  )}

                  {/* activ → Suspendă */}
                  {user.status === "activ" && (
                    <ActionButton
                      onClick={handleSuspend}
                      loading={pendingAction === "suspend"}
                      variant="warning"
                      icon={<ShieldOff className="h-4 w-4" />}
                      label="Suspendă"
                    />
                  )}

                  {/* suspendat → Reactivează */}
                  {user.status === "suspendat" && (
                    <ActionButton
                      onClick={handleReactivate}
                      loading={pendingAction === "reactivate"}
                      variant="success"
                      icon={<RefreshCcw className="h-4 w-4" />}
                      label="Reactivează"
                    />
                  )}

                  {/* inactiv → no specific action */}
                  {user.status === "inactiv" && (
                    <p className="text-center text-sm text-white/40">
                      Cont inactiv — nicio acțiune disponibilă
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex-shrink-0 text-white/30">{icon}</span>
      <span className="w-28 flex-shrink-0 text-xs text-white/40">{label}</span>
      <span className="truncate text-sm text-white/80">{value}</span>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => Promise<void>;
  loading: boolean;
  variant: "success" | "danger" | "warning";
  icon: React.ReactNode;
  label: string;
}

function ActionButton({
  onClick,
  loading,
  variant,
  icon,
  label,
}: ActionButtonProps): React.ReactElement {
  const variantClasses = {
    success: "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20",
    danger: "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/20",
    warning: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border-amber-500/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant]
      )}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}
