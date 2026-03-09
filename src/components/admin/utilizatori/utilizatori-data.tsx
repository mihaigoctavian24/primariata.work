import type { LucideIcon } from "lucide-react";
import {
  User,
  UserCheck,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
} from "lucide-react";

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}
interface RechartsTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

// ─── Types ────────────────────────────────────────────

export type UserRole = "cetatean" | "functionar" | "primar" | "admin";
export type UserStatus = "activ" | "pending" | "suspendat" | "inactiv";

export interface PlatformUser {
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
  notes?: string;
  invitedBy?: string;
  lastLogin?: string;
  loginCount?: number;
  documentsUploaded?: number;
}

export interface UserStats {
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  onlineNow: number;
  total: number;
}

// ─── Config ───────────────────────────────────────────

export const roleHierarchy: Record<UserRole, number> = {
  admin: 4,
  primar: 3,
  functionar: 2,
  cetatean: 1,
};
export const CURRENT_USER_ROLE: UserRole = "admin";
export const CURRENT_USER_ID = "u11";

export const roleConfig: Record<
  UserRole,
  { label: string; color: string; icon: LucideIcon; bg: string; description: string }
> = {
  cetatean: {
    label: "Cetățean",
    color: "#3b82f6",
    icon: User,
    bg: "#3b82f612",
    description: "Depune cereri, plătește taxe, vizualizează documente",
  },
  functionar: {
    label: "Funcționar",
    color: "#10b981",
    icon: UserCheck,
    bg: "#10b98112",
    description: "Procesează cereri, generează documente, gestionează dosare",
  },
  primar: {
    label: "Primar",
    color: "#f59e0b",
    icon: Crown,
    bg: "#f59e0b12",
    description: "Aprobă/respinge final, vizualizează rapoarte, supervizează",
  },
  admin: {
    label: "Admin Primărie",
    color: "#8b5cf6",
    icon: ShieldCheck,
    bg: "#8b5cf612",
    description: "Gestionează utilizatori, roluri, configurare primărie",
  },
};

export const statusConfig: Record<UserStatus, { label: string; color: string; icon: LucideIcon }> =
  {
    activ: { label: "Activ", color: "#10b981", icon: CheckCircle2 },
    pending: { label: "În așteptare", color: "#f59e0b", icon: Clock },
    suspendat: { label: "Suspendat", color: "#ef4444", icon: Ban },
    inactiv: { label: "Inactiv", color: "#6b7280", icon: XCircle },
  };

export const departments = [
  "Urbanism",
  "Stare Civilă",
  "Taxe & Impozite",
  "Registratură",
  "Asistență Socială",
  "Juridic",
  "IT & Digital",
  "Resurse Umane",
];

// ─── Helpers ──────────────────────────────────────────

export function canEditUser(targetRole: UserRole): boolean {
  return roleHierarchy[CURRENT_USER_ROLE] > roleHierarchy[targetRole];
}
export function getAvailableRoles(currentRole: UserRole): UserRole[] {
  if (currentRole === "cetatean") return ["functionar"];
  if (currentRole === "functionar") return ["cetatean", "primar"];
  if (currentRole === "primar") return ["functionar"];
  return [];
}
export const isSelf = (id: string) => id === CURRENT_USER_ID;

export function computeStats(users: PlatformUser[]): UserStats {
  const byRole: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const visibleUsers = users.filter((u) => u.role in roleConfig);
  visibleUsers.forEach((u) => {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
    byStatus[u.status] = (byStatus[u.status] || 0) + 1;
  });
  const onlineNow = visibleUsers.filter(
    (u) => u.lastActive === "online" || u.lastActive.includes("min")
  ).length;
  return { byRole, byStatus, onlineNow, total: visibleUsers.length };
}

// ─── Tooltip ──────────────────────────────────────────

export const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="mb-1 text-gray-400" style={{ fontSize: "0.72rem" }}>
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2" style={{ fontSize: "0.8rem" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Mock Data ────────────────────────────────────────

export const initialUsers: PlatformUser[] = [
  {
    id: "u11",
    name: "Elena Dumitrescu",
    email: "elena.d@primarias1.ro",
    phone: "+40 721 234 567",
    role: "admin",
    status: "activ",
    registeredDate: "1 Sep 2025",
    lastActive: "online",
    department: "IT & Digital",
    twoFA: true,
    lastLogin: "4 Mar 2026, 08:30",
    loginCount: 420,
    documentsUploaded: 15,
  },
  {
    id: "u10",
    name: "Dan Preda",
    email: "dan.preda@primarias1.ro",
    phone: "+40 741 000 100",
    role: "primar",
    status: "activ",
    registeredDate: "1 Sep 2025",
    lastActive: "acum 4h",
    twoFA: true,
    lastLogin: "4 Mar 2026, 07:00",
    loginCount: 310,
    notes: "Mandatar ales 2024-2028",
  },
  {
    id: "u5",
    name: "Ion Popescu",
    email: "ion.popescu@primarias1.ro",
    phone: "+40 731 100 200",
    role: "functionar",
    status: "activ",
    registeredDate: "1 Sep 2025",
    lastActive: "acum 30min",
    cereriCount: 142,
    department: "Urbanism",
    twoFA: true,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "4 Mar 2026, 08:15",
    loginCount: 380,
    documentsUploaded: 89,
  },
  {
    id: "u6",
    name: "Maria Ionescu",
    email: "maria.ionescu@primarias1.ro",
    phone: "+40 731 100 201",
    role: "functionar",
    status: "activ",
    registeredDate: "15 Sep 2025",
    lastActive: "acum 1h",
    cereriCount: 98,
    department: "Stare Civilă",
    twoFA: true,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "4 Mar 2026, 08:45",
    loginCount: 290,
    documentsUploaded: 67,
  },
  {
    id: "u7",
    name: "George Radu",
    email: "george.radu@primarias1.ro",
    phone: "+40 731 100 202",
    role: "functionar",
    status: "inactiv",
    registeredDate: "1 Oct 2025",
    lastActive: "acum 3 zile",
    cereriCount: 45,
    department: "Taxe & Impozite",
    twoFA: false,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "1 Mar 2026, 16:00",
    loginCount: 120,
    documentsUploaded: 23,
  },
  {
    id: "u8",
    name: "Ana Moldovan",
    email: "ana.moldovan@primarias1.ro",
    phone: "+40 731 100 203",
    role: "functionar",
    status: "activ",
    registeredDate: "15 Oct 2025",
    lastActive: "acum 15min",
    cereriCount: 76,
    department: "Registratură",
    twoFA: true,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "4 Mar 2026, 08:00",
    loginCount: 340,
    documentsUploaded: 145,
  },
  {
    id: "u16",
    name: "Raluca Stancu",
    email: "raluca.s@primarias1.ro",
    phone: "+40 731 100 204",
    role: "functionar",
    status: "activ",
    registeredDate: "1 Dec 2025",
    lastActive: "acum 2h",
    cereriCount: 34,
    department: "Asistență Socială",
    twoFA: false,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "4 Mar 2026, 09:30",
    loginCount: 85,
    documentsUploaded: 31,
  },
  {
    id: "u17",
    name: "Bogdan Marin",
    email: "bogdan.m@primarias1.ro",
    phone: "+40 731 100 205",
    role: "functionar",
    status: "activ",
    registeredDate: "15 Ian 2026",
    lastActive: "acum 45min",
    cereriCount: 18,
    department: "Juridic",
    twoFA: true,
    invitedBy: "Elena Dumitrescu",
    lastLogin: "4 Mar 2026, 08:50",
    loginCount: 62,
    documentsUploaded: 12,
  },
  {
    id: "u1",
    name: "Andrei Marinescu",
    email: "andrei.m@email.ro",
    phone: "+40 721 111 222",
    role: "cetatean",
    status: "activ",
    registeredDate: "15 Ian 2026",
    lastActive: "acum 2h",
    cereriCount: 3,
    lastLogin: "4 Mar 2026, 12:00",
    loginCount: 15,
    documentsUploaded: 8,
  },
  {
    id: "u2",
    name: "Maria Popescu",
    email: "maria.p@email.ro",
    phone: "+40 722 222 333",
    role: "cetatean",
    status: "activ",
    registeredDate: "20 Ian 2026",
    lastActive: "acum 1h",
    cereriCount: 2,
    lastLogin: "4 Mar 2026, 13:00",
    loginCount: 9,
    documentsUploaded: 4,
  },
  {
    id: "u3",
    name: "George Ionescu",
    email: "george.i@email.ro",
    phone: "+40 723 333 444",
    role: "cetatean",
    status: "pending",
    registeredDate: "3 Mar 2026",
    lastActive: "niciodată",
    lastLogin: "—",
  },
  {
    id: "u4",
    name: "Laura Dumitrescu",
    email: "laura.d@email.ro",
    phone: "+40 724 444 555",
    role: "cetatean",
    status: "pending",
    registeredDate: "4 Mar 2026",
    lastActive: "niciodată",
    lastLogin: "—",
  },
  {
    id: "u9",
    name: "Vasile Radu",
    email: "vasile.r@email.ro",
    phone: "+40 725 555 666",
    role: "cetatean",
    status: "suspendat",
    registeredDate: "10 Dec 2025",
    lastActive: "acum 1 săpt.",
    notes: "Suspendat — comportament abuziv pe platformă",
    lastLogin: "25 Feb 2026",
    loginCount: 42,
  },
  {
    id: "u12",
    name: "Mihai Vlad",
    email: "mihai.v@email.ro",
    phone: "+40 726 666 777",
    role: "cetatean",
    status: "pending",
    registeredDate: "4 Mar 2026",
    lastActive: "niciodată",
    lastLogin: "—",
  },
  {
    id: "u13",
    name: "Cristina Barbu",
    email: "cristina.b@email.ro",
    phone: "+40 727 777 888",
    role: "cetatean",
    status: "activ",
    registeredDate: "5 Feb 2026",
    lastActive: "acum 5h",
    cereriCount: 1,
    lastLogin: "4 Mar 2026, 09:00",
    loginCount: 7,
    documentsUploaded: 2,
  },
  {
    id: "u14",
    name: "Florin Neagu",
    email: "florin.n@email.ro",
    phone: "+40 728 888 999",
    role: "cetatean",
    status: "pending",
    registeredDate: "3 Mar 2026",
    lastActive: "niciodată",
    lastLogin: "—",
  },
  {
    id: "u15",
    name: "SC Media SRL",
    email: "contact@media-srl.ro",
    phone: "+40 21 555 1234",
    role: "cetatean",
    status: "activ",
    registeredDate: "10 Ian 2026",
    lastActive: "acum 2 zile",
    cereriCount: 1,
    lastLogin: "2 Mar 2026, 10:00",
    loginCount: 12,
    documentsUploaded: 3,
    notes: "Persoană juridică",
  },
  {
    id: "u18",
    name: "Delia Enescu",
    email: "delia.e@email.ro",
    phone: "+40 729 111 222",
    role: "cetatean",
    status: "activ",
    registeredDate: "1 Feb 2026",
    lastActive: "acum 6h",
    cereriCount: 4,
    lastLogin: "4 Mar 2026, 08:00",
    loginCount: 22,
    documentsUploaded: 9,
  },
];

export const registrationTrend = [
  { month: "Oct", total: 3 },
  { month: "Nov", total: 5 },
  { month: "Dec", total: 4 },
  { month: "Ian", total: 8 },
  { month: "Feb", total: 6 },
  { month: "Mar", total: 7 },
];
