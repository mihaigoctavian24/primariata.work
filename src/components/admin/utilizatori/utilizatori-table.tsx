"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  UserCheck,
  CheckCircle2,
  Ban,
  RefreshCcw,
  Eye,
  Phone,
  Calendar,
  Globe,
  FileText,
  BarChart3,
  Lock,
  ArrowRight,
  Info,
  X,
} from "lucide-react";

import type { PlatformUser, UserRole, UserStatus } from "./utilizatori-data";
import {
  roleConfig,
  statusConfig,
  departments,
  canEditUser,
  getAvailableRoles,
  isSelf,
} from "./utilizatori-data";

// ─── Props ────────────────────────────────────────────

interface UtilizatoriTableProps {
  users: PlatformUser[];
  roleFilter: UserRole | "all";
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
  onReactivate: (id: string) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onProfileDrawer: (id: string) => void;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriTable({
  users,
  roleFilter,
  onApprove,
  onSuspend,
  onReactivate,
  onRoleChange,
  onProfileDrawer,
}: UtilizatoriTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string | "all">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "role" | "status" | "date">("role");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const perPage = 8;

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortDir("desc");
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = users.filter((u) => u.role in roleConfig);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") result = result.filter((u) => u.status === statusFilter);
    if (deptFilter !== "all") result = result.filter((u) => u.department === deptFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "role")
        cmp =
          (roleConfig[b.role] ? 1 : 0) - (roleConfig[a.role] ? 1 : 0) ||
          a.role.localeCompare(b.role);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else if (sortBy === "date") cmp = a.registeredDate.localeCompare(b.registeredDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [users, search, roleFilter, statusFilter, deptFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const bulkApprove = () => {
    const pendingSelected = [...selectedUsers].filter(
      (id) => users.find((u) => u.id === id)?.status === "pending"
    );
    pendingSelected.forEach((id) => onApprove(id));
    setSelectedUsers(new Set());
  };

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Caută după nume, email sau departament..."
            className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-600"
            style={{ fontSize: "0.82rem" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="cursor-pointer text-gray-600 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as UserStatus | "all");
            setPage(1);
          }}
          className="cursor-pointer rounded-xl px-3 py-2 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <option value="all">Toate statusurile</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="cursor-pointer rounded-xl px-3 py-2 text-gray-300 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.82rem",
          }}
        >
          <option value="all">Toate departamentele</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {selectedUsers.size > 0 && (
          <div className="ml-2 flex items-center gap-2">
            <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>
              {selectedUsers.size} selectați
            </span>
            <button
              onClick={bulkApprove}
              className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-emerald-400 transition-all hover:bg-emerald-400/10"
              style={{ fontSize: "0.75rem", fontWeight: 600 }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Aprobă selectați
            </button>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="cursor-pointer text-gray-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {(roleFilter !== "all" || statusFilter !== "all" || deptFilter !== "all" || search) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setDeptFilter("all");
              setSearch("");
              setPage(1);
            }}
            className="flex cursor-pointer items-center gap-1 rounded-xl px-3 py-2 text-gray-400 transition-all hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.78rem",
            }}
          >
            <X className="h-3 w-3" /> Resetează filtre
          </button>
        )}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-hidden rounded-2xl"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-4 py-2.5"
          style={{
            fontSize: "0.67rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-1 flex items-center gap-1">
            <input
              type="checkbox"
              className="cursor-pointer accent-violet-500"
              checked={selectedUsers.size === paginated.length && paginated.length > 0}
              onChange={(e) => {
                if (e.target.checked)
                  setSelectedUsers(
                    new Set(
                      paginated.filter((u) => !isSelf(u.id) && canEditUser(u.role)).map((u) => u.id)
                    )
                  );
                else setSelectedUsers(new Set());
              }}
            />
          </div>
          <div
            className="col-span-3 flex cursor-pointer items-center gap-1 transition-all hover:text-white"
            onClick={() => toggleSort("name")}
          >
            Utilizator{" "}
            {sortBy === "name" &&
              (sortDir === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              ))}
          </div>
          <div
            className="col-span-2 flex cursor-pointer items-center gap-1 transition-all hover:text-white"
            onClick={() => toggleSort("role")}
          >
            Rol{" "}
            {sortBy === "role" &&
              (sortDir === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              ))}
          </div>
          <div className="col-span-1">Dept.</div>
          <div
            className="col-span-1 flex cursor-pointer items-center gap-1 transition-all hover:text-white"
            onClick={() => toggleSort("status")}
          >
            Status
          </div>
          <div className="col-span-1">Activitate</div>
          <div className="col-span-1">2FA</div>
          <div className="col-span-2 text-right">Acțiuni</div>
        </div>

        <AnimatePresence mode="popLayout">
          {paginated.map((user) => {
            const rc = roleConfig[user.role as UserRole];
            const sc = statusConfig[user.status];
            if (!rc || !sc) return null;
            const StatusIcon = sc.icon;
            const RoleIcon = rc.icon;
            const isExpanded = expandedUser === user.id;
            const self = isSelf(user.id);
            const editable = canEditUser(user.role) && !self;
            const isOnline = user.lastActive === "online" || user.lastActive.includes("min");
            const isSelected = selectedUsers.has(user.id);
            const availableRoles = getAvailableRoles(user.role);

            return (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className={`grid grid-cols-12 items-center gap-2 px-4 py-3 transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"} ${isSelected ? "bg-violet-500/[0.04]" : ""}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <div className="col-span-1 flex items-center">
                    {editable ? (
                      <input
                        type="checkbox"
                        className="cursor-pointer accent-violet-500"
                        checked={isSelected}
                        onChange={() => toggleSelect(user.id)}
                      />
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                  <div
                    className="col-span-3 flex cursor-pointer items-center gap-2.5"
                    onClick={() => onProfileDrawer(user.id)}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                        style={{
                          background: `linear-gradient(135deg, ${rc.color}, ${rc.color}cc)`,
                          fontSize: "0.62rem",
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
                      {isOnline && (
                        <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0c18] bg-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="flex items-center gap-1.5 truncate text-white"
                        style={{ fontSize: "0.82rem" }}
                      >
                        {user.name}
                        {self && (
                          <span
                            className="rounded px-1 py-0 text-violet-400"
                            style={{ fontSize: "0.55rem", background: "rgba(139,92,246,0.12)" }}
                          >
                            tu
                          </span>
                        )}
                      </div>
                      <div className="truncate text-gray-600" style={{ fontSize: "0.68rem" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5"
                      style={{
                        fontSize: "0.68rem",
                        color: rc.color,
                        background: rc.bg,
                        border: `1px solid ${rc.color}18`,
                      }}
                    >
                      <RoleIcon className="h-3 w-3" /> {rc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="block truncate text-gray-500" style={{ fontSize: "0.72rem" }}>
                      {user.department || "—"}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ fontSize: "0.7rem", color: sc.color }}
                    >
                      <StatusIcon className="h-3 w-3" /> {sc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`${isOnline ? "text-emerald-400" : "text-gray-600"}`}
                      style={{ fontSize: "0.72rem" }}
                    >
                      {user.lastActive}
                    </span>
                  </div>
                  <div className="col-span-1">
                    {user.twoFA ? (
                      <span
                        className="inline-flex items-center gap-0.5 text-emerald-400"
                        style={{ fontSize: "0.68rem" }}
                      >
                        <Lock className="h-3 w-3" /> Da
                      </span>
                    ) : (
                      <span className="text-gray-600" style={{ fontSize: "0.68rem" }}>
                        Nu
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {editable && (
                      <>
                        {user.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove(user.id);
                            }}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                            title="Aprobă"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {user.status === "activ" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspend(user.id);
                            }}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                            title="Suspendă"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {user.status === "suspendat" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReactivate(user.id);
                            }}
                            className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                            title="Reactivează"
                          >
                            <RefreshCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedUser(isExpanded ? null : user.id);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                      title="Detalii rapide"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProfileDrawer(user.id);
                      }}
                      className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                      title="Profil complet"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-4 mb-3 rounded-xl px-4 py-4"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="mb-3 grid grid-cols-5 gap-4">
                          <div>
                            <div
                              className="mb-1 flex items-center gap-1 text-gray-500"
                              style={{ fontSize: "0.68rem" }}
                            >
                              <Phone className="h-3 w-3" /> Telefon
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {user.phone}
                            </div>
                          </div>
                          <div>
                            <div
                              className="mb-1 flex items-center gap-1 text-gray-500"
                              style={{ fontSize: "0.68rem" }}
                            >
                              <Calendar className="h-3 w-3" /> Înregistrat
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {user.registeredDate}
                            </div>
                          </div>
                          <div>
                            <div
                              className="mb-1 flex items-center gap-1 text-gray-500"
                              style={{ fontSize: "0.68rem" }}
                            >
                              <Globe className="h-3 w-3" /> Ultima Logare
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {user.lastLogin || "—"}
                            </div>
                          </div>
                          <div>
                            <div
                              className="mb-1 flex items-center gap-1 text-gray-500"
                              style={{ fontSize: "0.68rem" }}
                            >
                              <FileText className="h-3 w-3" /> Cereri
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {user.cereriCount ?? 0}
                            </div>
                          </div>
                          <div>
                            <div
                              className="mb-1 flex items-center gap-1 text-gray-500"
                              style={{ fontSize: "0.68rem" }}
                            >
                              <BarChart3 className="h-3 w-3" /> Logări Total
                            </div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>
                              {user.loginCount ?? 0}
                            </div>
                          </div>
                        </div>
                        {user.notes && (
                          <div
                            className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{
                              background: "rgba(245,158,11,0.04)",
                              border: "1px solid rgba(245,158,11,0.08)",
                            }}
                          >
                            <Info className="h-3 w-3 shrink-0 text-amber-400" />
                            <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>
                              {user.notes}
                            </span>
                          </div>
                        )}
                        {editable && availableRoles.length > 0 && (
                          <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
                            <span className="mr-1 text-gray-500" style={{ fontSize: "0.75rem" }}>
                              Schimbă rol:
                            </span>
                            {availableRoles.map((r) => (
                              <button
                                key={r}
                                onClick={() => onRoleChange(user.id, r)}
                                className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all hover:brightness-110"
                                style={{
                                  fontSize: "0.72rem",
                                  background: `${roleConfig[r].color}12`,
                                  color: roleConfig[r].color,
                                  border: `1px solid ${roleConfig[r].color}18`,
                                }}
                              >
                                <ArrowRight className="h-3 w-3" /> {roleConfig[r].label}
                              </button>
                            ))}
                          </div>
                        )}
                        {!editable && !self && (
                          <div className="flex items-center gap-2 border-t border-white/[0.04] pt-3">
                            <Lock className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>
                              Nu ai permisiunea să modifici acest utilizator (
                              {roleConfig[user.role].label})
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-600">
            <User className="mb-2 h-10 w-10 text-gray-800" />
            <span style={{ fontSize: "0.88rem" }}>Niciun utilizator găsit</span>
            <span className="mt-1 text-gray-700" style={{ fontSize: "0.75rem" }}>
              Modifică filtrele sau căutarea
            </span>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filtered.length > 0
              ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}`
              : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 cursor-pointer rounded-lg transition-all ${p === page ? "text-white" : "text-gray-600 hover:bg-white/5 hover:text-white"}`}
                style={
                  p === page
                    ? { background: "rgba(139,92,246,0.2)", fontSize: "0.78rem" }
                    : { fontSize: "0.78rem" }
                }
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
