"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, UserPlus, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRoleTabs } from "@/components/admin/utilizatori/user-role-tabs";
import { UserProfileDrawer } from "@/components/admin/utilizatori/user-profile-drawer";
import { RegistrationGrowthChart } from "@/components/admin/utilizatori/registration-growth-chart";
import { InviteModal } from "@/components/admin/utilizatori/invite-modal";
import { RoleColorBadge } from "@/components/admin/shared/role-color-badge";
import type { RoleKey } from "@/components/admin/shared/role-color-badge";

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
}

interface UtilizatoriContentProps {
  users: UtilizatoriUser[];
  growthData: Array<{ created_at: string; rol: string }>;
  primarieId: string;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 8;

// ============================================================================
// Helpers
// ============================================================================

function getInitials(nume: string, prenume: string): string {
  return `${prenume.charAt(0)}${nume.charAt(0)}`.toUpperCase();
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
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
    pending: "Pending",
    inactiv: "Inactiv",
  };
  return labels[status ?? ""] ?? "—";
}

function statusColor(status: string | null): string {
  const colors: Record<string, string> = {
    activ: "bg-emerald-500/15 text-emerald-500",
    suspendat: "bg-red-500/15 text-red-500",
    pending: "bg-amber-500/15 text-amber-500",
    inactiv: "bg-white/10 text-white/40",
  };
  return colors[status ?? ""] ?? "bg-white/10 text-white/40";
}

function matchesRole(user: UtilizatoriUser, role: string): boolean {
  if (role === "all") return true;
  if (role === "admin") return user.rol === "admin" || user.rol === "super_admin";
  return user.rol === role;
}

function matchesSearch(user: UtilizatoriUser, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fullName = `${user.prenume} ${user.nume}`.toLowerCase();
  return fullName.includes(q) || user.email.toLowerCase().includes(q);
}

// ============================================================================
// Component
// ============================================================================

export function UtilizatoriContent({
  users,
  growthData,
  primarieId,
}: UtilizatoriContentProps): React.ReactElement {
  const [activeRole, setActiveRole] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UtilizatoriUser | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showChart, setShowChart] = useState(false);
  // Key to force re-render of list after mutations (since data comes from server props)
  const [refreshKey, setRefreshKey] = useState(0);

  // Counts per tab
  const counts = useMemo((): Record<string, number> => {
    return {
      all: users.length,
      cetatean: users.filter((u) => u.rol === "cetatean").length,
      functionar: users.filter((u) => u.rol === "functionar").length,
      primar: users.filter((u) => u.rol === "primar").length,
      admin: users.filter((u) => u.rol === "admin" || u.rol === "super_admin").length,
    };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo((): UtilizatoriUser[] => {
    return users
      .filter((u) => matchesRole(u, activeRole) && matchesSearch(u, search))
      .sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, activeRole, search, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleRoleChange(role: string): void {
    setActiveRole(role);
    setPage(1);
  }

  function handleUserClick(user: UtilizatoriUser): void {
    setSelectedUser(user);
  }

  function handleDrawerClose(): void {
    setSelectedUser(null);
  }

  const handleMutated = useCallback((): void => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-accent-500/15 text-accent-500 flex h-9 w-9 items-center justify-center rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Utilizatori</h1>
          <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-xs font-semibold text-white/60 tabular-nums">
            {users.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="bg-accent-500 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" />
          Invită Staff
        </button>
      </div>

      {/* Role filter tabs */}
      <UserRoleTabs activeRole={activeRole} onRoleChange={handleRoleChange} counts={counts} />

      {/* Search bar + chart toggle */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Caută după nume sau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="focus:border-accent-500/50 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pr-4 pl-9 text-sm text-white placeholder-white/30 transition-colors outline-none focus:bg-white/[0.06]"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowChart((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white/80"
        >
          {showChart ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Grafic Creștere
        </button>
      </div>

      {/* Registration growth chart — collapsible */}
      <AnimatePresence>
        {showChart && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025]"
          >
            <div className="p-5">
              <p className="mb-4 text-sm font-semibold text-white/70">
                Înregistrări noi — ultimele 30 de zile (pe rol)
              </p>
              <RegistrationGrowthChart growthData={growthData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User table */}
      <AnimatePresence mode="popLayout">
        {filteredUsers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center"
          >
            <Users className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm text-white/40">
              {search ? "Niciun utilizator găsit" : "Niciun utilizator în această categorie"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            {pagedUsers.map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex cursor-pointer items-center gap-4 rounded-xl bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04]"
                onClick={() => handleUserClick(user)}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={`${user.prenume} ${user.nume}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-accent-500/20 text-accent-500 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                      {getInitials(user.nume, user.prenume)}
                    </div>
                  )}
                </div>

                {/* Name + email */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {user.prenume} {user.nume}
                  </p>
                  <p className="truncate text-xs text-white/40">{user.email}</p>
                </div>

                {/* Role badge — use RoleColorBadge for known roles */}
                <RoleColorBadge role={user.rol as RoleKey} />

                {/* Status pill */}
                <span
                  className={cn(
                    "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusColor(user.status)
                  )}
                >
                  {statusLabel(user.status)}
                </span>

                {/* Last active */}
                <span className="hidden flex-shrink-0 text-xs text-white/30 sm:block">
                  {formatDateShort(user.last_login_at)}
                </span>

                {/* Chevron */}
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/20" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/40">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} din{" "}
            {filteredUsers.length} utilizatori
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="flex items-center px-2 text-xs tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Următor
            </button>
          </div>
        </div>
      )}

      {/* Profile drawer */}
      <UserProfileDrawer
        user={selectedUser}
        onClose={handleDrawerClose}
        primarieId={primarieId}
        onRoleUpdated={handleMutated}
        onStatusUpdated={handleMutated}
      />

      {/* Invite modal */}
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} primarieId={primarieId} />
    </motion.div>
  );
}
