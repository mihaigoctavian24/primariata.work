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
  RefreshCcw,
  Mail,
  Phone,
  Building2,
  Shield,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleColorBadge } from "@/components/admin/shared/role-color-badge";
import type { RoleKey } from "@/components/admin/shared/role-color-badge";
import { updateUserStatus, updateUserRole, updateUserDepartment } from "@/components/admin/utilizatori/actions";

// ============================================================================
// Constants
// ============================================================================

const DEPARTMENTS = [
  "Urbanism",
  "Stare Civilă",
  "Taxe & Impozite",
  "Registratură",
  "Asistență Socială",
  "Juridic",
  "IT & Digital",
  "Resurse Umane",
];

// ============================================================================
// Types
// ============================================================================

interface UtilizatoriUser {
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
  two_factor_enabled?: boolean;
}

interface UserProfileDrawerProps {
  user: UtilizatoriUser | null;
  onClose: () => void;
  primarieId: string;
  onRoleUpdated: () => void;
  onStatusUpdated: () => void;
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

const ROLE_OPTIONS = [
  { value: "cetatean", label: "Cetățean" },
  { value: "functionar", label: "Funcționar" },
  { value: "primar", label: "Primar" },
  { value: "admin", label: "Admin" },
] as const;

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

// ============================================================================
// Component
// ============================================================================

export function UserProfileDrawer({
  user,
  onClose,
  primarieId,
  onRoleUpdated,
  onStatusUpdated,
}: UserProfileDrawerProps): React.ReactElement {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pendingRoleChange, setPendingRoleChange] = useState<{ newRol: string; label: string } | null>(null);

  const open = user !== null;

  async function handleStatusChange(
    newStatus: "activ" | "suspendat" | "inactiv" | "pending"
  ): Promise<void> {
    if (!user) return;
    setPendingAction(newStatus);
    const result = await updateUserStatus(user.id, newStatus, primarieId);
    setPendingAction(null);
    if (result.error) {
      toast.error("Eroare la actualizare", { description: result.error });
    } else {
      const messages: Record<string, string> = {
        activ: "Utilizator aprobat / reactivat",
        suspendat: "Utilizator suspendat",
        inactiv: "Utilizator dezactivat",
      };
      toast.success(messages[newStatus] ?? "Status actualizat");
      onStatusUpdated();
      onClose();
    }
  }

  async function handleRoleChange(): Promise<void> {
    if (!user || !pendingRoleChange) return;
    setPendingAction("role");
    const result = await updateUserRole(user.id, pendingRoleChange.newRol, primarieId);
    setPendingAction(null);
    setShowRoleSelect(false);
    setPendingRoleChange(null);
    if (result.error) {
      toast.error("Eroare la schimbarea rolului", { description: result.error });
    } else {
      toast.success("Rol actualizat cu succes");
      onRoleUpdated();
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && user && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="bg-card fixed top-0 right-0 z-[90] flex h-full w-96 flex-col overflow-y-auto border-l border-white/[0.06]"
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
                  <RoleColorBadge role={user.rol as RoleKey} />
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
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
                  <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 text-white/30"><Building2 className="h-3.5 w-3.5" /></span>
                    <span className="w-28 flex-shrink-0 text-xs text-white/40">Departament</span>
                    <select
                      value={user.departament ?? ""}
                      onChange={async (e) => {
                        const val = e.target.value;
                        const p = updateUserDepartment(user.id, val);
                        toast.promise(p, {
                          loading: "Se actualizează departamentul...",
                          success: "Departament actualizat",
                          error: "Eroare la actualizare"
                        });
                        await p;
                      }}
                      className="bg-transparent border-none text-sm text-white/80 outline-none w-full"
                    >
                      <option value="" className="bg-card text-muted-foreground">— Fără departament —</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="bg-card text-foreground">{d}</option>
                      ))}
                    </select>
                  </div>
                  <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Cereri" value="—" />
                </div>
              </div>

              {/* Activity */}
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
                    label="Ultima login"
                    value={formatDate(user.last_login_at)}
                  />
                  <div className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 text-white/30"><Shield className="h-3.5 w-3.5" /></span>
                    <span className="w-28 flex-shrink-0 text-xs text-white/40">2FA</span>
                    <span className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.65rem] font-medium tracking-wide",
                      user.two_factor_enabled
                        ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                        : "bg-[var(--color-neutral)]/20 text-[var(--color-neutral)]"
                    )}>
                      {user.two_factor_enabled ? <ShieldCheck className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                      {user.two_factor_enabled ? "Activat" : "Dezactivat"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-white/40 uppercase">
                  Acțiuni
                </p>
                <div className="flex flex-col gap-2">
                  {/* pending → Aprobă */}
                  {user.status === "pending" && (
                    <ActionButton
                      onClick={async () => handleStatusChange("activ")}
                      loading={pendingAction === "activ"}
                      variant="success"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label="Aprobă"
                    />
                  )}

                  {/* activ → Suspendă */}
                  {user.status === "activ" && (
                    <ActionButton
                      onClick={async () => handleStatusChange("suspendat")}
                      loading={pendingAction === "suspendat"}
                      variant="warning"
                      icon={<ShieldOff className="h-4 w-4" />}
                      label="Suspendă"
                    />
                  )}

                  {/* suspendat → Reactivează */}
                  {user.status === "suspendat" && (
                    <ActionButton
                      onClick={async () => handleStatusChange("activ")}
                      loading={pendingAction === "activ"}
                      variant="success"
                      icon={<RefreshCcw className="h-4 w-4" />}
                      label="Reactivează"
                    />
                  )}

                  {/* inactiv — no specific action */}
                  {user.status === "inactiv" && (
                    <p className="text-center text-sm text-white/40">
                      Cont inactiv — nicio acțiune disponibilă
                    </p>
                  )}

                  {/* Schimbă rol */}
                  {pendingRoleChange !== null ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-subtle)] p-4 mb-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-foreground text-sm font-semibold mb-1">Confirmare schimbare rol</p>
                          <p className="text-muted-foreground text-xs mb-3">
                            Vrei să schimbi rolul utilizatorului în <strong className="text-foreground">{pendingRoleChange.label}</strong>?
                            {user.rol === "admin" && (
                              <span className="block mt-1 text-[var(--color-error)] text-xs font-medium">
                                Atenție: Retrogradarea unui admin îi va revoca toate permisiunile administrative.
                              </span>
                            )}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={pendingAction === "role"}
                              onClick={handleRoleChange}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
                              style={{ background: "var(--color-warning)" }}
                            >
                              {pendingAction === "role" ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              ) : (
                                "Confirmă"
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={pendingAction === "role"}
                              onClick={() => setPendingRoleChange(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors disabled:opacity-50"
                            >
                              Anulează
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : !showRoleSelect ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole(user.rol);
                        setShowRoleSelect(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white/80"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Schimbă rol
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="focus:border-[var(--color-info)]/50 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-foreground outline-none"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value} className="bg-card">
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const option = ROLE_OPTIONS.find(r => r.value === selectedRole);
                          if (option) {
                            setPendingRoleChange({ newRol: selectedRole, label: option.label });
                          }
                        }}
                        disabled={selectedRole === user.rol}
                        className="bg-[var(--color-info)] flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRoleSelect(false)}
                        className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
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
