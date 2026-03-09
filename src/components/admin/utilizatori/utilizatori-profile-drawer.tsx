"use client";

import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Activity,
  Globe,
  BarChart3,
  FileText,
  Lock,
  UserPlus,
  Info,
  CheckCircle2,
  Ban,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";

import type { PlatformUser, UserRole } from "./utilizatori-data";
import {
  roleConfig,
  roleHierarchy,
  statusConfig,
  canEditUser,
  getAvailableRoles,
  isSelf,
} from "./utilizatori-data";

// ─── Props ────────────────────────────────────────────

interface UtilizatoriProfileDrawerProps {
  user: PlatformUser | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriProfileDrawer({
  user,
  onClose,
  onApprove,
  onSuspend,
  onReactivate,
  onRoleChange,
}: UtilizatoriProfileDrawerProps) {
  if (!user) return null;

  const rc = roleConfig[user.role as UserRole];
  const sc = statusConfig[user.status];
  if (!rc || !sc) return null;
  const StatusIcon = sc.icon;
  const RoleIcon = rc.icon;
  const editable = canEditUser(user.role) && !isSelf(user.id);
  const availableRoles = getAvailableRoles(user.role);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-[420px] overflow-y-auto"
          style={{
            background: "#0e0e1a",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.05) transparent",
          }}
        >
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                Profil Utilizator
              </h3>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${rc.color}, ${rc.color}99)`,
                    fontSize: "1.3rem",
                    fontWeight: 700,
                  }}
                >
                  {user.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                {(user.lastActive === "online" || user.lastActive.includes("min")) && (
                  <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-3 border-[#0e0e1a] bg-emerald-400" />
                )}
              </div>
              <div>
                <div
                  className="flex items-center gap-2 text-white"
                  style={{ fontSize: "1.15rem", fontWeight: 600 }}
                >
                  {user.name}
                  {isSelf(user.id) && (
                    <span
                      className="rounded px-1.5 py-0.5 text-violet-400"
                      style={{ fontSize: "0.6rem", background: "rgba(139,92,246,0.12)" }}
                    >
                      tu
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                    style={{ fontSize: "0.68rem", color: rc.color, background: rc.bg }}
                  >
                    <RoleIcon className="h-3 w-3" /> {rc.label}
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ fontSize: "0.68rem", color: sc.color }}
                  >
                    <StatusIcon className="h-3 w-3" /> {sc.label}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="mb-5 rounded-xl px-3 py-2.5"
              style={{ background: `${rc.color}06`, border: `1px solid ${rc.color}10` }}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <RoleIcon className="h-3 w-3" style={{ color: rc.color }} />
                <span style={{ fontSize: "0.72rem", color: rc.color, fontWeight: 600 }}>
                  Nivel {roleHierarchy[user.role]}/4 — {rc.label}
                </span>
              </div>
              <p className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                {rc.description}
              </p>
            </div>

            <div className="mb-5 flex flex-col gap-3">
              <h4
                className="text-gray-500 uppercase"
                style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}
              >
                Informații Contact
              </h4>
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Phone, label: "Telefon", value: user.phone },
                { icon: Building2, label: "Departament", value: user.department || "—" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <f.icon className="h-3.5 w-3.5 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>
                      {f.label}
                    </div>
                    <div className="text-white" style={{ fontSize: "0.82rem" }}>
                      {f.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-5 flex flex-col gap-3">
              <h4
                className="text-gray-500 uppercase"
                style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}
              >
                Activitate & Statistici
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Înregistrat", value: user.registeredDate, icon: Calendar },
                  { label: "Ultima Activitate", value: user.lastActive, icon: Activity },
                  { label: "Ultima Logare", value: user.lastLogin || "—", icon: Globe },
                  { label: "Total Logări", value: `${user.loginCount ?? 0}`, icon: BarChart3 },
                  {
                    label: "Cereri Depuse/Procesate",
                    value: `${user.cereriCount ?? 0}`,
                    icon: FileText,
                  },
                  { label: "Documente", value: `${user.documentsUploaded ?? 0}`, icon: FileText },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <s.icon className="h-3 w-3 text-gray-600" />
                    <div>
                      <div className="text-gray-600" style={{ fontSize: "0.58rem" }}>
                        {s.label}
                      </div>
                      <div className="text-white" style={{ fontSize: "0.78rem" }}>
                        {s.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-3">
              <h4
                className="text-gray-500 uppercase"
                style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}
              >
                Securitate
              </h4>
              <div
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-400" style={{ fontSize: "0.82rem" }}>
                    Autentificare 2FA
                  </span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 ${user.twoFA ? "text-emerald-400" : "text-gray-600"}`}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: user.twoFA ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  {user.twoFA ? "Activat" : "Dezactivat"}
                </span>
              </div>
              {user.invitedBy && (
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <UserPlus className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>
                    Invitat de: <span className="text-white">{user.invitedBy}</span>
                  </span>
                </div>
              )}
            </div>

            {user.notes && (
              <div
                className="mb-5 flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{
                  background: "rgba(245,158,11,0.04)",
                  border: "1px solid rgba(245,158,11,0.08)",
                }}
              >
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>
                  {user.notes}
                </span>
              </div>
            )}

            {editable && (
              <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-4">
                <h4
                  className="mb-1 text-gray-500 uppercase"
                  style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}
                >
                  Acțiuni Admin
                </h4>
                {user.status === "pending" && (
                  <button
                    onClick={() => {
                      onApprove(user.id);
                      onClose();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-emerald-400 transition-all hover:brightness-110"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.12)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprobă & Activează Cont
                  </button>
                )}
                {user.status === "activ" && (
                  <button
                    onClick={() => {
                      onSuspend(user.id);
                      onClose();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-red-400 transition-all hover:brightness-110"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.1)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <Ban className="h-4 w-4" /> Suspendă Cont
                  </button>
                )}
                {user.status === "suspendat" && (
                  <button
                    onClick={() => {
                      onReactivate(user.id);
                      onClose();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-emerald-400 transition-all hover:brightness-110"
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.12)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" /> Reactivează Cont
                  </button>
                )}
                {availableRoles.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>
                      Schimbă rol:
                    </span>
                    <div className="flex gap-2">
                      {availableRoles.map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            onClose();
                            onRoleChange(user.id, r);
                          }}
                          className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all hover:brightness-110"
                          style={{
                            fontSize: "0.75rem",
                            background: `${roleConfig[r].color}10`,
                            color: roleConfig[r].color,
                            border: `1px solid ${roleConfig[r].color}15`,
                          }}
                        >
                          <ArrowRight className="h-3 w-3" /> {roleConfig[r].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toast("📧 Email de resetare trimis")}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-gray-400 transition-all hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "0.82rem",
                  }}
                >
                  <Mail className="h-4 w-4" /> Trimite Resetare Parolă
                </button>
              </div>
            )}

            {!editable && !isSelf(user.id) && (
              <div className="flex items-center gap-2 border-t border-white/[0.04] pt-4">
                <Lock className="h-3.5 w-3.5 text-gray-700" />
                <span className="text-gray-700" style={{ fontSize: "0.75rem" }}>
                  Utilizatorul are rol {roleConfig[user.role].label} (nivel{" "}
                  {roleHierarchy[user.role]}) — nu poți modifica.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
