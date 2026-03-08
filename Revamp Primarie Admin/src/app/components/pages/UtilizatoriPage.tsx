import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Users, Search, UserPlus, ShieldCheck,
  Crown, User, UserCheck, ChevronLeft, ChevronRight,
  Mail, Phone, Calendar, ArrowUpDown, CheckCircle2,
  XCircle, Clock, Eye, Ban, RefreshCcw, AlertTriangle,
  X, Activity, Building2, Briefcase, FileText,
  MoreVertical, TrendingUp, Download, ChevronDown,
  ChevronUp, Send, UserMinus, Lock, MapPin, Hash,
  ArrowRight, Info, Zap, BarChart3, Globe,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────

type UserRole = "cetatean" | "functionar" | "primar" | "admin";
type UserStatus = "activ" | "pending" | "suspendat" | "inactiv";

// Hierarchy level — only roles visible to Admin Primărie
// Super Admin exists above but is invisible at this level
const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  primar: 3,
  functionar: 2,
  cetatean: 1,
};

const CURRENT_USER_ROLE: UserRole = "admin"; // Admin Primărie perspective
const CURRENT_USER_ID = "u11";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registeredDate: string;
  lastActive: string;
  cereriCount?: number;
  department?: string;
  twoFA?: boolean;
  avatar?: string;
  notes?: string;
  invitedBy?: string;
  cnp?: string;
  address?: string;
  lastLogin?: string;
  loginCount?: number;
  documentsUploaded?: number;
}

// ─── Config ───────────────────────────────────────────

const roleConfig: Record<UserRole, { label: string; color: string; icon: any; bg: string; description: string }> = {
  cetatean: { label: "Cetățean", color: "#3b82f6", icon: User, bg: "#3b82f612", description: "Depune cereri, plătește taxe, vizualizează documente" },
  functionar: { label: "Funcționar", color: "#10b981", icon: UserCheck, bg: "#10b98112", description: "Procesează cereri, generează documente, gestionează dosare" },
  primar: { label: "Primar", color: "#f59e0b", icon: Crown, bg: "#f59e0b12", description: "Aprobă/respinge final, vizualizează rapoarte, supervizează" },
  admin: { label: "Admin Primărie", color: "#8b5cf6", icon: ShieldCheck, bg: "#8b5cf612", description: "Gestionează utilizatori, roluri, configurare primărie" },
};

const statusConfig: Record<UserStatus, { label: string; color: string; icon: any }> = {
  activ: { label: "Activ", color: "#10b981", icon: CheckCircle2 },
  pending: { label: "În așteptare", color: "#f59e0b", icon: Clock },
  suspendat: { label: "Suspendat", color: "#ef4444", icon: Ban },
  inactiv: { label: "Inactiv", color: "#6b7280", icon: XCircle },
};

const departments = [
  "Urbanism", "Stare Civilă", "Taxe & Impozite", "Registratură",
  "Asistență Socială", "Juridic", "IT & Digital", "Resurse Umane",
];

// ─── Mock Data ────────────────────────────────────────

const initialUsers: PlatformUser[] = [
  // Admin Primărie (current user — cel mai înalt rol vizibil)
  { id: "u11", name: "Elena Dumitrescu", email: "elena.d@primarias1.ro", phone: "+40 721 234 567", role: "admin", status: "activ", registeredDate: "1 Sep 2025", lastActive: "online", department: "IT & Digital", twoFA: true, lastLogin: "4 Mar 2026, 08:30", loginCount: 420, documentsUploaded: 15 },
  // Primar
  { id: "u10", name: "Dan Preda", email: "dan.preda@primarias1.ro", phone: "+40 741 000 100", role: "primar", status: "activ", registeredDate: "1 Sep 2025", lastActive: "acum 4h", twoFA: true, lastLogin: "4 Mar 2026, 07:00", loginCount: 310, notes: "Mandatar ales 2024-2028" },
  // Funcționari
  { id: "u5", name: "Ion Popescu", email: "ion.popescu@primarias1.ro", phone: "+40 731 100 200", role: "functionar", status: "activ", registeredDate: "1 Sep 2025", lastActive: "acum 30min", cereriCount: 142, department: "Urbanism", twoFA: true, invitedBy: "Elena Dumitrescu", lastLogin: "4 Mar 2026, 08:15", loginCount: 380, documentsUploaded: 89 },
  { id: "u6", name: "Maria Ionescu", email: "maria.ionescu@primarias1.ro", phone: "+40 731 100 201", role: "functionar", status: "activ", registeredDate: "15 Sep 2025", lastActive: "acum 1h", cereriCount: 98, department: "Stare Civilă", twoFA: true, invitedBy: "Elena Dumitrescu", lastLogin: "4 Mar 2026, 08:45", loginCount: 290, documentsUploaded: 67 },
  { id: "u7", name: "George Radu", email: "george.radu@primarias1.ro", phone: "+40 731 100 202", role: "functionar", status: "inactiv", registeredDate: "1 Oct 2025", lastActive: "acum 3 zile", cereriCount: 45, department: "Taxe & Impozite", twoFA: false, invitedBy: "Elena Dumitrescu", lastLogin: "1 Mar 2026, 16:00", loginCount: 120, documentsUploaded: 23 },
  { id: "u8", name: "Ana Moldovan", email: "ana.moldovan@primarias1.ro", phone: "+40 731 100 203", role: "functionar", status: "activ", registeredDate: "15 Oct 2025", lastActive: "acum 15min", cereriCount: 76, department: "Registratură", twoFA: true, invitedBy: "Elena Dumitrescu", lastLogin: "4 Mar 2026, 08:00", loginCount: 340, documentsUploaded: 145 },
  { id: "u16", name: "Raluca Stancu", email: "raluca.s@primarias1.ro", phone: "+40 731 100 204", role: "functionar", status: "activ", registeredDate: "1 Dec 2025", lastActive: "acum 2h", cereriCount: 34, department: "Asistență Socială", twoFA: false, invitedBy: "Elena Dumitrescu", lastLogin: "4 Mar 2026, 09:30", loginCount: 85, documentsUploaded: 31 },
  { id: "u17", name: "Bogdan Marin", email: "bogdan.m@primarias1.ro", phone: "+40 731 100 205", role: "functionar", status: "activ", registeredDate: "15 Ian 2026", lastActive: "acum 45min", cereriCount: 18, department: "Juridic", twoFA: true, invitedBy: "Elena Dumitrescu", lastLogin: "4 Mar 2026, 08:50", loginCount: 62, documentsUploaded: 12 },
  // Cetățeni
  { id: "u1", name: "Andrei Marinescu", email: "andrei.m@email.ro", phone: "+40 721 111 222", role: "cetatean", status: "activ", registeredDate: "15 Ian 2026", lastActive: "acum 2h", cereriCount: 3, lastLogin: "4 Mar 2026, 12:00", loginCount: 15, documentsUploaded: 8 },
  { id: "u2", name: "Maria Popescu", email: "maria.p@email.ro", phone: "+40 722 222 333", role: "cetatean", status: "activ", registeredDate: "20 Ian 2026", lastActive: "acum 1h", cereriCount: 2, lastLogin: "4 Mar 2026, 13:00", loginCount: 9, documentsUploaded: 4 },
  { id: "u3", name: "George Ionescu", email: "george.i@email.ro", phone: "+40 723 333 444", role: "cetatean", status: "pending", registeredDate: "3 Mar 2026", lastActive: "niciodată", lastLogin: "—" },
  { id: "u4", name: "Laura Dumitrescu", email: "laura.d@email.ro", phone: "+40 724 444 555", role: "cetatean", status: "pending", registeredDate: "4 Mar 2026", lastActive: "niciodată", lastLogin: "—" },
  { id: "u9", name: "Vasile Radu", email: "vasile.r@email.ro", phone: "+40 725 555 666", role: "cetatean", status: "suspendat", registeredDate: "10 Dec 2025", lastActive: "acum 1 săpt.", notes: "Suspendat — comportament abuziv pe platformă", lastLogin: "25 Feb 2026", loginCount: 42 },
  { id: "u12", name: "Mihai Vlad", email: "mihai.v@email.ro", phone: "+40 726 666 777", role: "cetatean", status: "pending", registeredDate: "4 Mar 2026", lastActive: "niciodată", lastLogin: "—" },
  { id: "u13", name: "Cristina Barbu", email: "cristina.b@email.ro", phone: "+40 727 777 888", role: "cetatean", status: "activ", registeredDate: "5 Feb 2026", lastActive: "acum 5h", cereriCount: 1, lastLogin: "4 Mar 2026, 09:00", loginCount: 7, documentsUploaded: 2 },
  { id: "u14", name: "Florin Neagu", email: "florin.n@email.ro", phone: "+40 728 888 999", role: "cetatean", status: "pending", registeredDate: "3 Mar 2026", lastActive: "niciodată", lastLogin: "—" },
  { id: "u15", name: "SC Media SRL", email: "contact@media-srl.ro", phone: "+40 21 555 1234", role: "cetatean", status: "activ", registeredDate: "10 Ian 2026", lastActive: "acum 2 zile", cereriCount: 1, lastLogin: "2 Mar 2026, 10:00", loginCount: 12, documentsUploaded: 3, notes: "Persoană juridică" },
  { id: "u18", name: "Delia Enescu", email: "delia.e@email.ro", phone: "+40 729 111 222", role: "cetatean", status: "activ", registeredDate: "1 Feb 2026", lastActive: "acum 6h", cereriCount: 4, lastLogin: "4 Mar 2026, 08:00", loginCount: 22, documentsUploaded: 9 },
];

const registrationTrend = [
  { month: "Oct", total: 3 }, { month: "Nov", total: 5 }, { month: "Dec", total: 4 },
  { month: "Ian", total: 8 }, { month: "Feb", total: 6 }, { month: "Mar", total: 7 },
];

// ─── Permission Helpers ──────────────────────────────

function canEditUser(targetRole: UserRole): boolean {
  return roleHierarchy[CURRENT_USER_ROLE] > roleHierarchy[targetRole];
}

function canChangeRoleTo(currentRole: UserRole, targetRole: UserRole): boolean {
  // Admin Primărie can assign: cetățean ↔ funcționar, funcționar → primar
  // Cannot set admin (own role level)
  if (targetRole === "admin") return false;
  if (currentRole === "admin") return false;
  return true;
}

function getAvailableRoles(currentRole: UserRole): UserRole[] {
  const available: UserRole[] = [];
  if (currentRole === "cetatean") {
    available.push("functionar");
  } else if (currentRole === "functionar") {
    available.push("cetatean", "primar");
  } else if (currentRole === "primar") {
    available.push("functionar");
  }
  return available;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="px-3 py-2 rounded-xl" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="text-gray-400 mb-1" style={{ fontSize: "0.72rem" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2" style={{ fontSize: "0.8rem" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────

export function UtilizatoriPage() {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string | "all">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "role" | "status" | "date">("role");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "functionar" as UserRole, department: "" });
  const [showRoleConfirm, setShowRoleConfirm] = useState<{ userId: string; newRole: UserRole } | null>(null);
  const perPage = 8;

  // ─── Computed ────────────────────────────────────

  const filtered = useMemo(() => {
    // Filter out users with roles not visible to Admin Primărie (e.g. super_admin)
    let result = users.filter((u) => u.role in roleConfig);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department?.toLowerCase().includes(q)));
    }
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all") result = result.filter((u) => u.status === statusFilter);
    if (deptFilter !== "all") result = result.filter((u) => u.department === deptFilter);
    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "role") cmp = roleHierarchy[b.role] - roleHierarchy[a.role];
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      else if (sortBy === "date") cmp = a.registeredDate.localeCompare(b.registeredDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [users, search, roleFilter, statusFilter, deptFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const visibleUsers = users.filter((u) => u.role in roleConfig);
    visibleUsers.forEach((u) => {
      byRole[u.role] = (byRole[u.role] || 0) + 1;
      byStatus[u.status] = (byStatus[u.status] || 0) + 1;
    });
    const onlineNow = visibleUsers.filter((u) => u.lastActive === "online" || u.lastActive.includes("min")).length;
    return { byRole, byStatus, onlineNow, total: visibleUsers.length };
  }, [users]);

  const roleDistribution = useMemo(() =>
    (Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([key, cfg]) => ({
      name: cfg.label, value: stats.byRole[key] || 0, color: cfg.color,
    })),
    [stats]
  );

  // ─── Actions ─────────────────────────────────────

  const approveUser = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "activ" as UserStatus } : u));
    toast.success("Cont activat cu succes!");
  };

  const suspendUser = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user && !canEditUser(user.role)) {
      toast.error("Nu ai permisiunea să suspendezi acest utilizator");
      return;
    }
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "suspendat" as UserStatus } : u));
    toast("Cont suspendat", { icon: "⚠️" });
  };

  const reactivateUser = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "activ" as UserStatus } : u));
    toast.success("Cont reactivat!");
  };

  const confirmRoleChange = () => {
    if (!showRoleConfirm) return;
    const { userId, newRole } = showRoleConfirm;
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    toast.success(`Rol schimbat: ${user.name} → ${roleConfig[newRole].label}`);
    setShowRoleConfirm(null);
  };

  const bulkApprove = () => {
    const pendingSelected = [...selectedUsers].filter((id) => users.find((u) => u.id === id)?.status === "pending");
    if (pendingSelected.length === 0) { toast.error("Niciun cont pending selectat"); return; }
    setUsers((prev) => prev.map((u) => pendingSelected.includes(u.id) ? { ...u, status: "activ" as UserStatus } : u));
    setSelectedUsers(new Set());
    toast.success(`${pendingSelected.length} conturi activate`);
  };

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) { toast.error("Completează toate câmpurile"); return; }
    const newUser: PlatformUser = {
      id: `u-${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      phone: "—",
      role: inviteForm.role,
      status: "pending",
      registeredDate: "4 Mar 2026",
      lastActive: "niciodată",
      department: inviteForm.department || undefined,
      twoFA: false,
      invitedBy: "Elena Dumitrescu",
      lastLogin: "—",
    };
    setUsers((prev) => [newUser, ...prev]);
    setInviteForm({ name: "", email: "", role: "functionar", department: "" });
    setShowInviteModal(false);
    toast.success(`Invitație trimisă către ${newUser.email}`);
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const profileUser = showProfileDrawer ? users.find((u) => u.id === showProfileDrawer) : null;

  const isSelf = (id: string) => id === CURRENT_USER_ID;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <Users className="w-6 h-6 text-indigo-400" /> Gestionare Utilizatori
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            {stats.total} utilizatori · {stats.byStatus.pending || 0} în așteptare · {stats.onlineNow} online acum — <span className="text-violet-400/70">Admin Primărie</span>
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => toast.success("Export CSV generat")} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-gray-400 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Download className="w-4 h-4" />
            <span style={{ fontSize: "0.82rem" }}>Export</span>
          </motion.button>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-white" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)", boxShadow: "0 4px 20px rgba(236,72,153,0.25)" }}>
            <UserPlus className="w-4 h-4" />
            <span style={{ fontSize: "0.85rem" }}>Invită Utilizator</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-12 gap-4 mb-5">
        {/* Role Cards */}
        <div className="col-span-8 grid grid-cols-4 gap-2.5">
          {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([key, cfg], i) => {
            const Icon = cfg.icon;
            const isActive = roleFilter === key;
            const isSelf = key === "admin";
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                whileHover={{ y: -2 }}
                onClick={() => { setRoleFilter(isActive ? "all" : key); setPage(1); }}
                className={`flex flex-col p-3 rounded-xl cursor-pointer transition-all text-left ${isActive ? "ring-1" : ""}`}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.color}${isActive ? "40" : "18"}`,
                  ...(isActive ? { ringColor: cfg.color } : {}),
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  {isSelf && <ShieldCheck className="w-3 h-3 text-violet-400/50" />}
                </div>
                <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1 }}>{stats.byRole[key] || 0}</div>
                <div className="text-gray-500 mt-0.5" style={{ fontSize: "0.65rem" }}>{cfg.label}</div>
              </motion.button>
            );
          })}
        </div>

        {/* Mini Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-4 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 className="text-white mb-3" style={{ fontSize: "0.85rem", fontWeight: 600 }}>Înregistrări Recente</h3>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={registrationTrend}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Utilizatori" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#regGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Hierarchy Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.08)" }}>
        <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span className="text-gray-500 flex-1" style={{ fontSize: "0.75rem" }}>
          <span className="text-violet-400" style={{ fontWeight: 600 }}>Ierarhie permisiuni:</span>{" "}
          {(["admin", "primar", "functionar", "cetatean"] as UserRole[]).map((r, i, arr) => (
            <span key={r}>
              <span style={{ color: roleConfig[r].color, fontWeight: r === "admin" ? 600 : 400 }}>{roleConfig[r].label}</span>
              {r === "admin" && <span className="text-violet-400/50" style={{ fontSize: "0.6rem" }}> (tu)</span>}
              {i < arr.length - 1 && <span className="text-gray-700 mx-1">›</span>}
            </span>
          ))}
          {" "}— Poți gestiona rolurile de sub nivelul tău.
        </span>
      </motion.div>

      {/* Pending Banner */}
      {(stats.byStatus.pending || 0) > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-300/80 flex-1" style={{ fontSize: "0.83rem" }}>
            <span style={{ fontWeight: 600 }}>{stats.byStatus.pending}</span> conturi noi așteaptă aprobarea ta.
          </span>
          <button onClick={() => { setStatusFilter("pending"); setRoleFilter("all"); setPage(1); }} className="px-3 py-1 rounded-lg text-amber-400 cursor-pointer transition-all hover:bg-amber-400/10" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
            Filtrează pending
          </button>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[220px] flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Search className="w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Caută după nume, email sau departament..." className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.82rem" }} />
          {search && <button onClick={() => setSearch("")} className="text-gray-600 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }} className="px-3 py-2 rounded-xl text-gray-300 outline-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
          <option value="all">Toate statusurile</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl text-gray-300 outline-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
          <option value="all">Toate departamentele</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>{selectedUsers.size} selectați</span>
            <button onClick={bulkApprove} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-400 cursor-pointer hover:bg-emerald-400/10 transition-all" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Aprobă selectați
            </button>
            <button onClick={() => setSelectedUsers(new Set())} className="text-gray-500 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {(roleFilter !== "all" || statusFilter !== "all" || deptFilter !== "all" || search) && (
          <button onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setDeptFilter("all"); setSearch(""); setPage(1); }} className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem" }}>
            <X className="w-3 h-3" /> Resetează filtre
          </button>
        )}
      </div>

      {/* User Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/[0.04]" style={{ fontSize: "0.67rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <div className="col-span-1 flex items-center gap-1">
            <input type="checkbox" className="accent-violet-500 cursor-pointer" checked={selectedUsers.size === paginated.length && paginated.length > 0} onChange={(e) => {
              if (e.target.checked) setSelectedUsers(new Set(paginated.filter((u) => !isSelf(u.id) && canEditUser(u.role)).map((u) => u.id)));
              else setSelectedUsers(new Set());
            }} />
          </div>
          <div className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("name")}>
            Utilizator {sortBy === "name" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </div>
          <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("role")}>
            Rol {sortBy === "role" && (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
          </div>
          <div className="col-span-1">Dept.</div>
          <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-white transition-all" onClick={() => toggleSort("status")}>
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
              <motion.div key={user.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"} ${isSelected ? "bg-violet-500/[0.04]" : ""}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <div className="col-span-1 flex items-center">
                    {editable ? (
                      <input type="checkbox" className="accent-violet-500 cursor-pointer" checked={isSelected} onChange={() => toggleSelect(user.id)} />
                    ) : (
                      <div className="w-4" />
                    )}
                  </div>
                  <div className="col-span-3 flex items-center gap-2.5 cursor-pointer" onClick={() => setShowProfileDrawer(user.id)}>
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${rc.color}, ${rc.color}cc)`, fontSize: "0.62rem", fontWeight: 700 }}>
                        {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c18]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white truncate flex items-center gap-1.5" style={{ fontSize: "0.82rem" }}>
                        {user.name}
                        {self && <span className="text-violet-400 px-1 py-0 rounded" style={{ fontSize: "0.55rem", background: "rgba(139,92,246,0.12)" }}>tu</span>}
                      </div>
                      <div className="text-gray-600 truncate" style={{ fontSize: "0.68rem" }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.68rem", color: rc.color, background: rc.bg, border: `1px solid ${rc.color}18` }}>
                      <RoleIcon className="w-3 h-3" /> {rc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-gray-500 truncate block" style={{ fontSize: "0.72rem" }}>{user.department || "—"}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="inline-flex items-center gap-1" style={{ fontSize: "0.7rem", color: sc.color }}>
                      <StatusIcon className="w-3 h-3" /> {sc.label}
                    </span>
                  </div>
                  <div className="col-span-1">
                    <span className={`${isOnline ? "text-emerald-400" : "text-gray-600"}`} style={{ fontSize: "0.72rem" }}>{user.lastActive}</span>
                  </div>
                  <div className="col-span-1">
                    {user.twoFA ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-400" style={{ fontSize: "0.68rem" }}>
                        <Lock className="w-3 h-3" /> Da
                      </span>
                    ) : (
                      <span className="text-gray-600" style={{ fontSize: "0.68rem" }}>Nu</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    {editable && (
                      <>
                        {user.status === "pending" && (
                          <button onClick={(e) => { e.stopPropagation(); approveUser(user.id); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-600 hover:text-emerald-400 cursor-pointer transition-all" title="Aprobă">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user.status === "activ" && (
                          <button onClick={(e) => { e.stopPropagation(); suspendUser(user.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 cursor-pointer transition-all" title="Suspendă">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {user.status === "suspendat" && (
                          <button onClick={(e) => { e.stopPropagation(); reactivateUser(user.id); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-600 hover:text-emerald-400 cursor-pointer transition-all" title="Reactivează">
                            <RefreshCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setExpandedUser(isExpanded ? null : user.id); }} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all" title="Detalii rapide">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowProfileDrawer(user.id); }} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all" title="Profil complet">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 py-4 mx-4 mb-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="grid grid-cols-5 gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}><Phone className="w-3 h-3" /> Telefon</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{user.phone}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}><Calendar className="w-3 h-3" /> Înregistrat</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{user.registeredDate}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}><Globe className="w-3 h-3" /> Ultima Logare</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{user.lastLogin || "—"}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}><FileText className="w-3 h-3" /> Cereri</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{user.cereriCount ?? 0}</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-500 mb-1" style={{ fontSize: "0.68rem" }}><BarChart3 className="w-3 h-3" /> Logări Total</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{user.loginCount ?? 0}</div>
                          </div>
                        </div>
                        {user.notes && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.08)" }}>
                            <Info className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{user.notes}</span>
                          </div>
                        )}
                        {editable && availableRoles.length > 0 && (
                          <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                            <span className="text-gray-500 mr-1" style={{ fontSize: "0.75rem" }}>Schimbă rol:</span>
                            {availableRoles.map((r) => (
                              <button
                                key={r}
                                onClick={() => setShowRoleConfirm({ userId: user.id, newRole: r })}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:brightness-110"
                                style={{ fontSize: "0.72rem", background: `${roleConfig[r].color}12`, color: roleConfig[r].color, border: `1px solid ${roleConfig[r].color}18` }}
                              >
                                <ArrowRight className="w-3 h-3" /> {roleConfig[r].label}
                              </button>
                            ))}
                          </div>
                        )}
                        {!editable && !self && (
                          <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                            <Lock className="w-3 h-3 text-gray-600" />
                            <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>Nu ai permisiunea să modifici acest utilizator ({roleConfig[user.role].label})</span>
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
            <Users className="w-10 h-10 text-gray-800 mb-2" />
            <span style={{ fontSize: "0.88rem" }}>Niciun utilizator găsit</span>
            <span className="text-gray-700 mt-1" style={{ fontSize: "0.75rem" }}>Modifică filtrele sau căutarea</span>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
          <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
            {filtered.length > 0 ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}` : "0 rezultate"}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg cursor-pointer transition-all ${p === page ? "text-white" : "text-gray-600 hover:text-white hover:bg-white/5"}`} style={p === page ? { background: "rgba(139,92,246,0.2)", fontSize: "0.78rem" } : { fontSize: "0.78rem" }}>
                {p}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ INVITE MODAL ═══ */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={() => setShowInviteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6" style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))" }}>
                    <UserPlus className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Invită Utilizator Nou</h3>
                    <p className="text-gray-600" style={{ fontSize: "0.72rem" }}>Se va trimite email cu link de activare</p>
                  </div>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.78rem" }}>Nume complet</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <User className="w-4 h-4 text-gray-600" />
                    <input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="ex. Ion Popescu" className="flex-1 bg-transparent text-white placeholder:text-gray-700 outline-none" style={{ fontSize: "0.85rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.78rem" }}>Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Mail className="w-4 h-4 text-gray-600" />
                    <input value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="email@primarias1.ro" className="flex-1 bg-transparent text-white placeholder:text-gray-700 outline-none" style={{ fontSize: "0.85rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.78rem" }}>Rol atribuit</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cetatean", "functionar", "primar"] as UserRole[]).map((r) => {
                      const cfg = roleConfig[r];
                      const Icon = cfg.icon;
                      const isSelected = inviteForm.role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => setInviteForm({ ...inviteForm, role: r })}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? "ring-1" : ""}`}
                          style={{
                            background: isSelected ? `${cfg.color}15` : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isSelected ? cfg.color + "30" : "rgba(255,255,255,0.06)"}`,
                            ...(isSelected ? { ringColor: cfg.color } : {}),
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? cfg.color : "#6b7280" }} />
                          <span style={{ fontSize: "0.78rem", color: isSelected ? cfg.color : "#9ca3af" }}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-600 mt-1.5" style={{ fontSize: "0.68rem" }}>{roleConfig[inviteForm.role].description}</p>
                </div>
                {inviteForm.role === "functionar" && (
                  <div>
                    <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.78rem" }}>Departament</label>
                    <select value={inviteForm.department} onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })} className="w-full px-3 py-2.5 rounded-xl text-white outline-none cursor-pointer" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.85rem" }}>
                      <option value="">Selectează departament...</option>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all" style={{ fontSize: "0.85rem" }}>
                  Anulează
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInvite} className="flex items-center gap-2 px-5 py-2 rounded-xl text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)", fontSize: "0.85rem" }}>
                  <Send className="w-4 h-4" /> Trimite Invitație
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ROLE CHANGE CONFIRM ═══ */}
      <AnimatePresence>
        {showRoleConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={() => setShowRoleConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(() => {
                const user = users.find((u) => u.id === showRoleConfirm.userId);
                if (!user) return null;
                const currentRc = roleConfig[user.role];
                const newRc = roleConfig[showRoleConfirm.newRole];
                const CurrentIcon = currentRc.icon;
                const NewIcon = newRc.icon;
                return (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>Confirmare Schimbare Rol</h3>
                    </div>
                    <p className="text-gray-400 mb-4" style={{ fontSize: "0.85rem" }}>
                      Ești sigur că vrei să schimbi rolul utilizatorului <span className="text-white" style={{ fontWeight: 600 }}>{user.name}</span>?
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ fontSize: "0.78rem", color: currentRc.color, background: currentRc.bg }}>
                        <CurrentIcon className="w-3.5 h-3.5" /> {currentRc.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg" style={{ fontSize: "0.78rem", color: newRc.color, background: newRc.bg }}>
                        <NewIcon className="w-3.5 h-3.5" /> {newRc.label}
                      </span>
                    </div>
                    {showRoleConfirm.newRole === "primar" && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-300/80" style={{ fontSize: "0.72rem" }}>Atenție: Atribuirea rolului de Primar conferă permisiuni extinse de aprobare și supervizare.</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowRoleConfirm(null)} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all" style={{ fontSize: "0.85rem" }}>
                        Anulează
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmRoleChange} className="flex items-center gap-2 px-5 py-2 rounded-xl text-white cursor-pointer" style={{ background: `linear-gradient(135deg, ${newRc.color}, ${newRc.color}cc)`, fontSize: "0.85rem" }}>
                        <CheckCircle2 className="w-4 h-4" /> Confirmă
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ PROFILE DRAWER ═══ */}
      <AnimatePresence>
        {showProfileDrawer && profileUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowProfileDrawer(null)}>
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[420px] h-full overflow-y-auto"
              style={{ background: "#0e0e1a", borderLeft: "1px solid rgba(255,255,255,0.06)", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}
            >
              {(() => {
                const user = profileUser;
                const rc = roleConfig[user.role as UserRole];
                const sc = statusConfig[user.status];
                if (!rc || !sc) return null;
                const StatusIcon = sc.icon;
                const RoleIcon = rc.icon;
                const editable = canEditUser(user.role) && !isSelf(user.id);
                const availableRoles = getAvailableRoles(user.role);

                return (
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Profil Utilizator</h3>
                      <button onClick={() => setShowProfileDrawer(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${rc.color}, ${rc.color}99)`, fontSize: "1.3rem", fontWeight: 700 }}>
                          {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        {(user.lastActive === "online" || user.lastActive.includes("min")) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-3 border-[#0e0e1a]" />
                        )}
                      </div>
                      <div>
                        <div className="text-white flex items-center gap-2" style={{ fontSize: "1.15rem", fontWeight: 600 }}>
                          {user.name}
                          {isSelf(user.id) && <span className="text-violet-400 px-1.5 py-0.5 rounded" style={{ fontSize: "0.6rem", background: "rgba(139,92,246,0.12)" }}>tu</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.68rem", color: rc.color, background: rc.bg }}>
                            <RoleIcon className="w-3 h-3" /> {rc.label}
                          </span>
                          <span className="inline-flex items-center gap-1" style={{ fontSize: "0.68rem", color: sc.color }}>
                            <StatusIcon className="w-3 h-3" /> {sc.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Description */}
                    <div className="px-3 py-2.5 rounded-xl mb-5" style={{ background: `${rc.color}06`, border: `1px solid ${rc.color}10` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <RoleIcon className="w-3 h-3" style={{ color: rc.color }} />
                        <span style={{ fontSize: "0.72rem", color: rc.color, fontWeight: 600 }}>Nivel {roleHierarchy[user.role]}/4 — {rc.label}</span>
                      </div>
                      <p className="text-gray-500" style={{ fontSize: "0.72rem" }}>{rc.description}</p>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-3 mb-5">
                      <h4 className="text-gray-500 uppercase" style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}>Informații Contact</h4>
                      {[
                        { icon: Mail, label: "Email", value: user.email },
                        { icon: Phone, label: "Telefon", value: user.phone },
                        { icon: Building2, label: "Departament", value: user.department || "—" },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <f.icon className="w-3.5 h-3.5 text-gray-600" />
                          <div className="flex-1">
                            <div className="text-gray-600" style={{ fontSize: "0.62rem" }}>{f.label}</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{f.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Activity Stats */}
                    <div className="flex flex-col gap-3 mb-5">
                      <h4 className="text-gray-500 uppercase" style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}>Activitate & Statistici</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Înregistrat", value: user.registeredDate, icon: Calendar },
                          { label: "Ultima Activitate", value: user.lastActive, icon: Activity },
                          { label: "Ultima Logare", value: user.lastLogin || "—", icon: Globe },
                          { label: "Total Logări", value: `${user.loginCount ?? 0}`, icon: BarChart3 },
                          { label: "Cereri Depuse/Procesate", value: `${user.cereriCount ?? 0}`, icon: FileText },
                          { label: "Documente", value: `${user.documentsUploaded ?? 0}`, icon: FileText },
                        ].map((s) => (
                          <div key={s.label} className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                            <s.icon className="w-3 h-3 text-gray-600" />
                            <div>
                              <div className="text-gray-600" style={{ fontSize: "0.58rem" }}>{s.label}</div>
                              <div className="text-white" style={{ fontSize: "0.78rem" }}>{s.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security */}
                    <div className="flex flex-col gap-3 mb-5">
                      <h4 className="text-gray-500 uppercase" style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}>Securitate</h4>
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-gray-400" style={{ fontSize: "0.82rem" }}>Autentificare 2FA</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded ${user.twoFA ? "text-emerald-400" : "text-gray-600"}`} style={{ fontSize: "0.72rem", fontWeight: 600, background: user.twoFA ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)" }}>
                          {user.twoFA ? "Activat" : "Dezactivat"}
                        </span>
                      </div>
                      {user.invitedBy && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <UserPlus className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-gray-500" style={{ fontSize: "0.78rem" }}>Invitat de: <span className="text-white">{user.invitedBy}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {user.notes && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-5" style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.08)" }}>
                        <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>{user.notes}</span>
                      </div>
                    )}

                    {/* Actions */}
                    {editable && (
                      <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.04]">
                        <h4 className="text-gray-500 uppercase mb-1" style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.05em" }}>Acțiuni Admin</h4>
                        {user.status === "pending" && (
                          <button onClick={() => { approveUser(user.id); setShowProfileDrawer(null); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110 text-emerald-400" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)", fontSize: "0.82rem" }}>
                            <CheckCircle2 className="w-4 h-4" /> Aprobă & Activează Cont
                          </button>
                        )}
                        {user.status === "activ" && (
                          <button onClick={() => { suspendUser(user.id); setShowProfileDrawer(null); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110 text-red-400" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)", fontSize: "0.82rem" }}>
                            <Ban className="w-4 h-4" /> Suspendă Cont
                          </button>
                        )}
                        {user.status === "suspendat" && (
                          <button onClick={() => { reactivateUser(user.id); setShowProfileDrawer(null); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110 text-emerald-400" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)", fontSize: "0.82rem" }}>
                            <RefreshCcw className="w-4 h-4" /> Reactivează Cont
                          </button>
                        )}
                        {availableRoles.length > 0 && (
                          <div className="flex flex-col gap-1.5 mt-1">
                            <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>Schimbă rol:</span>
                            <div className="flex gap-2">
                              {availableRoles.map((r) => (
                                <button
                                  key={r}
                                  onClick={() => { setShowProfileDrawer(null); setShowRoleConfirm({ userId: user.id, newRole: r }); }}
                                  className="flex items-center gap-1 px-3 py-2 rounded-xl cursor-pointer transition-all hover:brightness-110 flex-1 justify-center"
                                  style={{ fontSize: "0.75rem", background: `${roleConfig[r].color}10`, color: roleConfig[r].color, border: `1px solid ${roleConfig[r].color}15` }}
                                >
                                  <ArrowRight className="w-3 h-3" /> {roleConfig[r].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <button onClick={() => toast("📧 Email de resetare trimis")} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/[0.04] text-gray-400" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: "0.82rem" }}>
                          <Mail className="w-4 h-4" /> Trimite Resetare Parolă
                        </button>
                      </div>
                    )}

                    {!editable && !isSelf(user.id) && (
                      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04]">
                        <Lock className="w-3.5 h-3.5 text-gray-700" />
                        <span className="text-gray-700" style={{ fontSize: "0.75rem" }}>
                          Utilizatorul are rol {roleConfig[user.role].label} (nivel {roleHierarchy[user.role]}) — nu poți modifica.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
