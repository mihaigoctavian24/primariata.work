"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Users, Search, UserPlus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { stagger, slideIn } from "@/lib/motion";
import { UserRoleTabs } from "@/components/admin/utilizatori/user-role-tabs";
import type { UserRoleTab } from "@/components/admin/utilizatori/user-role-tabs";
import { UserProfileDrawer } from "@/components/admin/utilizatori/user-profile-drawer";
import { RegistrationGrowthChart } from "@/components/admin/utilizatori/registration-growth-chart";
import { InviteStaffDialog } from "@/components/admin/InviteStaffDialog";

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

interface GrowthDataPoint {
  created_at: string;
  rol: string;
}

interface UtilizatoriContentProps {
  users: UtilizatorRow[];
  growthData: GrowthDataPoint[];
  primarieId: string;
}

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

function rolLabel(rol: string): string {
  const labels: Record<string, string> = {
    cetatean: "Cetățean",
    functionar: "Funcționar",
    primar: "Primar",
    admin: "Admin",
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
  return colors[rol] ?? "bg-white/10 text-white/60";
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
    activ: "bg-emerald-500/15 text-emerald-400",
    suspendat: "bg-red-500/15 text-red-400",
    pending: "bg-amber-500/15 text-amber-400",
    inactiv: "bg-white/10 text-white/40",
  };
  return colors[status ?? ""] ?? "bg-white/10 text-white/40";
}

function matchesSearch(user: UtilizatorRow, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fullName = `${user.prenume} ${user.nume}`.toLowerCase();
  return fullName.includes(q) || user.email.toLowerCase().includes(q);
}

function matchesTab(user: UtilizatorRow, tab: UserRoleTab): boolean {
  if (tab === "all") return true;
  if (tab === "pending") return user.status === "pending";
  return user.rol === tab;
}

// ============================================================================
// Component
// ============================================================================

export function UtilizatoriContent({
  users,
  growthData,
  primarieId,
}: UtilizatoriContentProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<UserRoleTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UtilizatorRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Tab counts
  const counts = useMemo((): Partial<Record<UserRoleTab, number>> => {
    return {
      all: users.length,
      cetatean: users.filter((u) => u.rol === "cetatean").length,
      functionar: users.filter((u) => u.rol === "functionar").length,
      primar: users.filter((u) => u.rol === "primar").length,
      admin: users.filter((u) => u.rol === "admin" || u.rol === "super_admin").length,
      pending: users.filter((u) => u.status === "pending").length,
    };
  }, [users]);

  // Filtered + sorted users
  const filteredUsers = useMemo((): UtilizatorRow[] => {
    return users
      .filter((u) => matchesTab(u, activeTab) && matchesSearch(u, searchQuery))
      .sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
  }, [users, activeTab, searchQuery]);

  function handleUserClick(user: UtilizatorRow): void {
    setSelectedUser(user);
    setDrawerOpen(true);
  }

  function handleDrawerClose(): void {
    setDrawerOpen(false);
  }

  return (
    <div className="space-y-5">
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

        <InviteStaffDialog
          primarieId={primarieId}
          trigger={
            <button
              type="button"
              className="bg-accent-500 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Invită Personal
            </button>
          }
        />
      </div>

      {/* Role tabs */}
      <UserRoleTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {/* Search input */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Caută după nume sau email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus:border-accent-500/50 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pr-4 pl-9 text-sm text-white placeholder-white/30 transition-colors outline-none focus:bg-white/[0.06]"
        />
      </div>

      {/* User list */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-1.5">
        {filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-white/20" />
            <p className="text-sm text-white/40">
              {searchQuery ? "Niciun utilizator găsit" : "Niciun utilizator în această categorie"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              variants={slideIn}
              className={cn(
                "flex cursor-pointer items-center gap-4 rounded-xl bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04]"
              )}
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

              {/* Role badge */}
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  rolColor(user.rol)
                )}
              >
                {rolLabel(user.rol)}
              </span>

              {/* Status badge */}
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusColor(user.status)
                )}
              >
                {statusLabel(user.status)}
              </span>

              {/* Date */}
              <span className="hidden flex-shrink-0 text-xs text-white/30 sm:block">
                {formatDateShort(user.created_at)}
              </span>

              {/* Chevron */}
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/20" />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Registration Growth Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <p className="mb-4 text-sm font-semibold text-white/70">
          Înregistrări noi — ultimele 30 de zile
        </p>
        <RegistrationGrowthChart data={growthData} />
      </div>

      {/* Profile drawer */}
      <UserProfileDrawer user={selectedUser} open={drawerOpen} onClose={handleDrawerClose} />
    </div>
  );
}
