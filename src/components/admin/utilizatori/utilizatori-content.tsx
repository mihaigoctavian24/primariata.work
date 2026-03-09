"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Users, UserPlus, Download, Info, ArrowRight, AlertTriangle } from "lucide-react";

import type { PlatformUser, UserRole, UserStatus } from "./utilizatori-data";
import {
  initialUsers,
  roleConfig,
  statusConfig,
  computeStats,
  canEditUser,
} from "./utilizatori-data";
import { UtilizatoriStats } from "./utilizatori-stats";
import { UtilizatoriTable } from "./utilizatori-table";
import { UtilizatoriInviteModal } from "./utilizatori-invite-modal";
import { UtilizatoriRoleConfirm } from "./utilizatori-role-confirm";
import { UtilizatoriProfileDrawer } from "./utilizatori-profile-drawer";

// ─── Preserved interface ──────────────────────────────

export interface UtilizatoriContentProps {
  users: unknown[];
  growthData: unknown[];
  primarieId: string;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriContent(_props: UtilizatoriContentProps) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState<{
    userId: string;
    newRole: UserRole;
  } | null>(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(users), [users]);
  const profileUser = showProfileDrawer
    ? (users.find((u) => u.id === showProfileDrawer) ?? null)
    : null;

  // ─── Actions ────────────────────────────────────────

  const approveUser = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "activ" as UserStatus } : u))
    );
    toast.success("Cont activat cu succes!");
  }, []);
  const suspendUser = useCallback(
    (id: string) => {
      const user = users.find((u) => u.id === id);
      if (user && !canEditUser(user.role)) {
        toast.error("Nu ai permisiunea");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "suspendat" as UserStatus } : u))
      );
      toast("Cont suspendat", { icon: "⚠️" });
    },
    [users]
  );
  const reactivateUser = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "activ" as UserStatus } : u))
    );
    toast.success("Cont reactivat!");
  }, []);
  const confirmRoleChange = useCallback(() => {
    if (!showRoleConfirm) return;
    const { userId, newRole } = showRoleConfirm;
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    toast.success(`Rol schimbat: ${user.name} → ${roleConfig[newRole].label}`);
    setShowRoleConfirm(null);
  }, [showRoleConfirm, users]);
  const handleInvite = useCallback(
    (form: { name: string; email: string; role: UserRole; department: string }) => {
      if (!form.name || !form.email) {
        toast.error("Completează toate câmpurile");
        return;
      }
      const newUser: PlatformUser = {
        id: `u-${Date.now()}`,
        name: form.name,
        email: form.email,
        phone: "—",
        role: form.role,
        status: "pending",
        registeredDate: "4 Mar 2026",
        lastActive: "niciodată",
        department: form.department || undefined,
        twoFA: false,
        invitedBy: "Elena Dumitrescu",
        lastLogin: "—",
      };
      setUsers((prev) => [newUser, ...prev]);
      setShowInviteModal(false);
      toast.success(`Invitație trimisă către ${newUser.email}`);
    },
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <Users className="h-6 w-6 text-indigo-400" /> Gestionare Utilizatori
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            {stats.total} utilizatori · {stats.byStatus.pending || 0} în așteptare ·{" "}
            {stats.onlineNow} online acum —{" "}
            <span className="text-violet-400/70">Admin Primărie</span>
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => toast.success("Export CSV generat")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-gray-400 transition-all hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Download className="h-4 w-4" />
            <span style={{ fontSize: "0.82rem" }}>Export</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowInviteModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-white"
            style={{
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.25)",
            }}
          >
            <UserPlus className="h-4 w-4" />
            <span style={{ fontSize: "0.85rem" }}>Invită Utilizator</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Row */}
      <UtilizatoriStats
        stats={stats}
        roleFilter={roleFilter}
        onRoleFilter={(r) => {
          setRoleFilter(r);
        }}
      />

      {/* Hierarchy Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="mb-5 flex items-center gap-2 rounded-xl px-4 py-2.5"
        style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)" }}
      >
        <Info className="h-3.5 w-3.5 shrink-0 text-violet-400" />
        <span className="flex-1 text-gray-500" style={{ fontSize: "0.75rem" }}>
          <span className="text-violet-400" style={{ fontWeight: 600 }}>
            Ierarhie permisiuni:
          </span>{" "}
          {(["admin", "primar", "functionar", "cetatean"] as UserRole[]).map((r, i, arr) => (
            <span key={r}>
              <span style={{ color: roleConfig[r].color, fontWeight: r === "admin" ? 600 : 400 }}>
                {roleConfig[r].label}
              </span>
              {r === "admin" && (
                <span className="text-violet-400/50" style={{ fontSize: "0.6rem" }}>
                  {" "}
                  (tu)
                </span>
              )}
              {i < arr.length - 1 && <span className="mx-1 text-gray-700">›</span>}
            </span>
          ))}{" "}
          — Poți gestiona rolurile de sub nivelul tău.
        </span>
      </motion.div>

      {/* Pending Banner */}
      {(stats.byStatus.pending || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="flex-1 text-amber-300/80" style={{ fontSize: "0.83rem" }}>
            <span style={{ fontWeight: 600 }}>{stats.byStatus.pending}</span> conturi noi așteaptă
            aprobarea ta.
          </span>
          <button
            onClick={() => setRoleFilter("all")}
            className="cursor-pointer rounded-lg px-3 py-1 text-amber-400 transition-all hover:bg-amber-400/10"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            Filtrează pending
          </button>
        </motion.div>
      )}

      {/* Table */}
      <UtilizatoriTable
        users={users}
        roleFilter={roleFilter}
        onApprove={approveUser}
        onSuspend={suspendUser}
        onReactivate={reactivateUser}
        onRoleChange={(userId, newRole) => setShowRoleConfirm({ userId, newRole })}
        onProfileDrawer={(id) => setShowProfileDrawer(id)}
      />

      {/* Modals & Drawers */}
      <UtilizatoriInviteModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
      <UtilizatoriRoleConfirm
        data={showRoleConfirm}
        users={users}
        onConfirm={confirmRoleChange}
        onClose={() => setShowRoleConfirm(null)}
      />
      <UtilizatoriProfileDrawer
        user={profileUser}
        onClose={() => setShowProfileDrawer(null)}
        onApprove={approveUser}
        onSuspend={suspendUser}
        onReactivate={reactivateUser}
        onRoleChange={(userId, newRole) => setShowRoleConfirm({ userId, newRole })}
      />
    </div>
  );
}
