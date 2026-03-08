import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Search, Filter, LayoutGrid, List, ChevronDown, ChevronUp,
  Eye, CheckCircle2, XCircle, Clock, FileText, ArrowUpDown,
  Download, User, Calendar, MessageSquare, Sparkles,
  ChevronLeft, ChevronRight, ArrowRightLeft, AlertTriangle,
  TrendingUp, TrendingDown, Zap, Shield, BarChart3, Activity,
  Timer, Target, UserCheck, AlertCircle, RotateCcw,
  ArrowUp, Send, Lock, Unlock, StickyNote, ChevronRight as ChevRight,
  Gauge, Users, Flame, PauseCircle, PlayCircle, Flag,
  X, MoreVertical, ExternalLink, History, Megaphone,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, BarChart, Bar,
} from "recharts";
import { DonutChart } from "../DonutChart";

// ─── Types ────────────────────────────────────────────

type CerereStatus = "depusa" | "verificare" | "info_supl" | "procesare" | "aprobata" | "respinsa";
type Priority = "urgenta" | "ridicata" | "medie" | "scazuta";
type TabView = "overview" | "table" | "kanban" | "alerts";

interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

interface Cerere {
  id: string;
  numar: string;
  titlu: string;
  cetatean: string;
  tip: string;
  departament: string;
  dataDepunere: string;
  dataLimita: string; // SLA deadline
  status: CerereStatus;
  prioritate: Priority;
  functionar: string;
  descriere: string;
  zileInStatus: number;
  ultimaActivitate: string;
  slaZileRamase: number;
  blocata: boolean;
  motivBlocare?: string;
  noteAdmin: string[];
  auditTrail: AuditEntry[];
  escaladata: boolean;
}

// ─── Config ───────────────────────────────────────────

const statusConfig: Record<CerereStatus, { label: string; color: string; bg: string; icon: any }> = {
  depusa: { label: "Depusa", color: "#3b82f6", bg: "#3b82f612", icon: FileText },
  verificare: { label: "In Verificare", color: "#8b5cf6", bg: "#8b5cf612", icon: Eye },
  info_supl: { label: "Info Suplim.", color: "#f59e0b", bg: "#f59e0b12", icon: AlertCircle },
  procesare: { label: "In Procesare", color: "#06b6d4", bg: "#06b6d412", icon: Activity },
  aprobata: { label: "Aprobata", color: "#10b981", bg: "#10b98112", icon: CheckCircle2 },
  respinsa: { label: "Respinsa", color: "#ef4444", bg: "#ef444412", icon: XCircle },
};

const priorityConfig: Record<Priority, { label: string; color: string; level: number }> = {
  urgenta: { label: "Urgenta", color: "#ef4444", level: 4 },
  ridicata: { label: "Ridicata", color: "#f97316", level: 3 },
  medie: { label: "Medie", color: "#f59e0b", level: 2 },
  scazuta: { label: "Scazuta", color: "#6b7280", level: 1 },
};

const functionari = [
  { id: "f1", name: "Elena Dragomir", dept: "Urbanism", cereriActive: 8 },
  { id: "f2", name: "Ion Petrescu", dept: "Constructii", cereriActive: 12 },
  { id: "f3", name: "Maria Ionescu", dept: "Mediu", cereriActive: 5 },
  { id: "f4", name: "Ana Moldovan", dept: "Fiscal", cereriActive: 9 },
  { id: "f5", name: "George Radu", dept: "Infrastructura", cereriActive: 3 },
];

const departamente = ["Urbanism", "Constructii", "Fiscal", "Mediu", "Infrastructura", "Sanatate", "Publicitate", "Utilitati"];

// ─── Mock Data ────────────────────────────────────────

const initialCereri: Cerere[] = [
  {
    id: "c1", numar: "#1853", titlu: "Certificat de urbanism S+P+2E", cetatean: "Andrei Marinescu", tip: "Urbanism", departament: "Urbanism",
    dataDepunere: "4 Mar 2026", dataLimita: "18 Mar 2026", status: "depusa", prioritate: "urgenta", functionar: "-", descriere: "Solicitare certificat de urbanism pentru constructie S+P+2E pe str. Aviatorilor nr. 15. Include documentatie cadastrala si plan de situatie.",
    zileInStatus: 0, ultimaActivitate: "4 Mar 2026, 09:15", slaZileRamase: 14, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [{ timestamp: "4 Mar 2026, 09:15", action: "Cerere depusa", actor: "Andrei Marinescu", details: "Depunere online cu 4 documente atasate" }],
  },
  {
    id: "c2", numar: "#1852", titlu: "Autorizatie de construire bloc P+4E", cetatean: "Maria Popescu", tip: "Constructii", departament: "Constructii",
    dataDepunere: "3 Mar 2026", dataLimita: "2 Apr 2026", status: "verificare", prioritate: "ridicata", functionar: "Ion Petrescu", descriere: "Autorizatie construire bloc de locuinte, P+4E, zona rezidentiala Nord.",
    zileInStatus: 1, ultimaActivitate: "3 Mar 2026, 14:30", slaZileRamase: 29, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "3 Mar 2026, 10:00", action: "Cerere depusa", actor: "Maria Popescu" },
      { timestamp: "3 Mar 2026, 14:30", action: "Alocata functionar", actor: "Sistem", details: "Auto-alocare catre Ion Petrescu" },
    ],
  },
  {
    id: "c3", numar: "#1851", titlu: "Certificat fiscal vanzare", cetatean: "George Ionescu", tip: "Fiscal", departament: "Fiscal",
    dataDepunere: "3 Mar 2026", dataLimita: "10 Mar 2026", status: "aprobata", prioritate: "scazuta", functionar: "Ana Moldovan", descriere: "Certificat fiscal necesar pentru vanzare proprietate. Toate taxele achitate.",
    zileInStatus: 0, ultimaActivitate: "4 Mar 2026, 08:00", slaZileRamase: 6, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "3 Mar 2026, 09:00", action: "Cerere depusa", actor: "George Ionescu" },
      { timestamp: "3 Mar 2026, 11:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "4 Mar 2026, 08:00", action: "Aprobata", actor: "Ana Moldovan", details: "Toate conditiile indeplinite" },
    ],
  },
  {
    id: "c4", numar: "#1850", titlu: "Aviz de mediu spatiu comercial", cetatean: "Laura Dumitrescu", tip: "Mediu", departament: "Mediu",
    dataDepunere: "2 Mar 2026", dataLimita: "16 Mar 2026", status: "info_supl", prioritate: "medie", functionar: "Maria Ionescu", descriere: "Solicitare aviz de mediu pentru spatiu comercial. Lipsa studiu de impact.",
    zileInStatus: 2, ultimaActivitate: "2 Mar 2026, 16:00", slaZileRamase: 12, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "2 Mar 2026, 09:30", action: "Cerere depusa", actor: "Laura Dumitrescu" },
      { timestamp: "2 Mar 2026, 16:00", action: "Informatii suplimentare solicitate", actor: "Maria Ionescu", details: "Studiu de impact asupra mediului necesar" },
    ],
  },
  {
    id: "c5", numar: "#1849", titlu: "Autorizatie demolare constructie C1", cetatean: "Vasile Radu", tip: "Constructii", departament: "Constructii",
    dataDepunere: "2 Mar 2026", dataLimita: "16 Mar 2026", status: "procesare", prioritate: "medie", functionar: "Ion Petrescu", descriere: "Demolare constructie veche C1 pe str. Libertatii nr. 42.",
    zileInStatus: 2, ultimaActivitate: "3 Mar 2026, 10:00", slaZileRamase: 12, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "2 Mar 2026, 10:00", action: "Cerere depusa", actor: "Vasile Radu" },
      { timestamp: "2 Mar 2026, 14:00", action: "Verificare initiata", actor: "Ion Petrescu" },
      { timestamp: "3 Mar 2026, 10:00", action: "Procesare in curs", actor: "Ion Petrescu", details: "Verificare documentatie tehnica" },
    ],
  },
  {
    id: "c6", numar: "#1848", titlu: "Certificat fiscal succesiune", cetatean: "Ana Sandu", tip: "Fiscal", departament: "Fiscal",
    dataDepunere: "1 Mar 2026", dataLimita: "8 Mar 2026", status: "aprobata", prioritate: "scazuta", functionar: "Ana Moldovan", descriere: "Certificat fiscal pentru succesiune.",
    zileInStatus: 1, ultimaActivitate: "3 Mar 2026, 09:00", slaZileRamase: 4, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "1 Mar 2026, 10:00", action: "Cerere depusa", actor: "Ana Sandu" },
      { timestamp: "1 Mar 2026, 14:00", action: "Verificare", actor: "Ana Moldovan" },
      { timestamp: "3 Mar 2026, 09:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c7", numar: "#1847", titlu: "Reclamatie drum deteriorat", cetatean: "Mihai Vlad", tip: "Infrastructura", departament: "Infrastructura",
    dataDepunere: "1 Mar 2026", dataLimita: "15 Mar 2026", status: "depusa", prioritate: "ridicata", functionar: "-", descriere: "Drum deteriorat pe str. Florilor, necesita reparatii urgente. Pericol accidente.",
    zileInStatus: 3, ultimaActivitate: "1 Mar 2026, 08:00", slaZileRamase: 11, blocata: true, motivBlocare: "Nealocata >48h — niciun functionar disponibil in departament", noteAdmin: [], escaladata: false,
    auditTrail: [{ timestamp: "1 Mar 2026, 08:00", action: "Cerere depusa", actor: "Mihai Vlad", details: "Cu poze atasate (3 fotografii)" }],
  },
  {
    id: "c8", numar: "#1846", titlu: "Aviz sanitar alimentar", cetatean: "Cristina Barbu", tip: "Sanatate", departament: "Sanatate",
    dataDepunere: "28 Feb 2026", dataLimita: "7 Mar 2026", status: "respinsa", prioritate: "scazuta", functionar: "Maria Ionescu", descriere: "Aviz sanitar alimentar respins — documentatie incompleta.",
    zileInStatus: 2, ultimaActivitate: "2 Mar 2026, 11:00", slaZileRamase: 3, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "28 Feb 2026, 09:00", action: "Cerere depusa", actor: "Cristina Barbu" },
      { timestamp: "28 Feb 2026, 14:00", action: "Verificare", actor: "Maria Ionescu" },
      { timestamp: "2 Mar 2026, 11:00", action: "Respinsa", actor: "Maria Ionescu", details: "Documentatie incompleta, lipsesc certificate de conformitate" },
    ],
  },
  {
    id: "c9", numar: "#1845", titlu: "Certificat urbanism extindere", cetatean: "Dan Enescu", tip: "Urbanism", departament: "Urbanism",
    dataDepunere: "28 Feb 2026", dataLimita: "14 Mar 2026", status: "aprobata", prioritate: "medie", functionar: "Elena Dragomir", descriere: "Certificat urbanism extindere spatiu comercial.",
    zileInStatus: 1, ultimaActivitate: "3 Mar 2026, 15:00", slaZileRamase: 10, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "28 Feb 2026, 10:00", action: "Cerere depusa", actor: "Dan Enescu" },
      { timestamp: "28 Feb 2026, 15:00", action: "Verificare", actor: "Elena Dragomir" },
      { timestamp: "3 Mar 2026, 15:00", action: "Aprobata", actor: "Elena Dragomir" },
    ],
  },
  {
    id: "c10", numar: "#1844", titlu: "Autorizatie panou publicitar", cetatean: "SC Media SRL", tip: "Publicitate", departament: "Publicitate",
    dataDepunere: "27 Feb 2026", dataLimita: "13 Mar 2026", status: "verificare", prioritate: "scazuta", functionar: "Ion Petrescu", descriere: "Amplasare panou publicitar zona centrala.",
    zileInStatus: 5, ultimaActivitate: "27 Feb 2026, 11:00", slaZileRamase: 9, blocata: true, motivBlocare: "Fara activitate >5 zile — posibil blocat la functionar", noteAdmin: ["Verificat — Ion P. in concediu medical"], escaladata: false,
    auditTrail: [
      { timestamp: "27 Feb 2026, 09:00", action: "Cerere depusa", actor: "SC Media SRL" },
      { timestamp: "27 Feb 2026, 11:00", action: "Alocata functionar", actor: "Sistem" },
    ],
  },
  {
    id: "c11", numar: "#1843", titlu: "Bransament apa potabila", cetatean: "Florin Neagu", tip: "Utilitati", departament: "Utilitati",
    dataDepunere: "27 Feb 2026", dataLimita: "6 Mar 2026", status: "depusa", prioritate: "urgenta", functionar: "-", descriere: "Bransament apa potabila str. Teiului nr. 8. Zona fara acces la retea.",
    zileInStatus: 5, ultimaActivitate: "27 Feb 2026, 14:00", slaZileRamase: 2, blocata: true, motivBlocare: "SLA aproape expirat + nealocata", noteAdmin: [], escaladata: false,
    auditTrail: [{ timestamp: "27 Feb 2026, 14:00", action: "Cerere depusa", actor: "Florin Neagu" }],
  },
  {
    id: "c12", numar: "#1842", titlu: "Certificat fiscal credit ipotecar", cetatean: "Elena Munteanu", tip: "Fiscal", departament: "Fiscal",
    dataDepunere: "26 Feb 2026", dataLimita: "5 Mar 2026", status: "aprobata", prioritate: "scazuta", functionar: "Ana Moldovan", descriere: "Certificat fiscal necesar pentru credit ipotecar.",
    zileInStatus: 3, ultimaActivitate: "1 Mar 2026, 10:00", slaZileRamase: 1, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "26 Feb 2026, 10:00", action: "Cerere depusa", actor: "Elena Munteanu" },
      { timestamp: "27 Feb 2026, 09:00", action: "Verificare", actor: "Ana Moldovan" },
      { timestamp: "1 Mar 2026, 10:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c13", numar: "#1841", titlu: "Autorizatie construire garaj", cetatean: "Radu Stanescu", tip: "Constructii", departament: "Constructii",
    dataDepunere: "25 Feb 2026", dataLimita: "11 Mar 2026", status: "procesare", prioritate: "medie", functionar: "Ion Petrescu", descriere: "Construire garaj adiacent casei existente.",
    zileInStatus: 4, ultimaActivitate: "28 Feb 2026, 16:00", slaZileRamase: 7, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "25 Feb 2026, 09:00", action: "Cerere depusa", actor: "Radu Stanescu" },
      { timestamp: "25 Feb 2026, 14:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "26 Feb 2026, 10:00", action: "Verificare completa", actor: "Ion Petrescu" },
      { timestamp: "28 Feb 2026, 16:00", action: "Procesare in curs", actor: "Ion Petrescu" },
    ],
  },
  {
    id: "c14", numar: "#1840", titlu: "Aviz defrişare arbori", cetatean: "Comuna Veche SRL", tip: "Mediu", departament: "Mediu",
    dataDepunere: "24 Feb 2026", dataLimita: "3 Mar 2026", status: "info_supl", prioritate: "ridicata", functionar: "Maria Ionescu", descriere: "Solicitare defrisare 15 arbori pentru dezvoltare imobiliara. Necesita aviz suplimentar Directia Silvica.",
    zileInStatus: 8, ultimaActivitate: "24 Feb 2026, 15:00", slaZileRamase: -1, blocata: true, motivBlocare: "SLA DEPASIT — asteptare raspuns institutie externa (Directia Silvica)", noteAdmin: ["24 Feb: Solicitat aviz Directia Silvica", "1 Mar: Fara raspuns, retrimis solicitare"], escaladata: true,
    auditTrail: [
      { timestamp: "24 Feb 2026, 09:00", action: "Cerere depusa", actor: "Comuna Veche SRL" },
      { timestamp: "24 Feb 2026, 12:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "24 Feb 2026, 15:00", action: "Info suplimentare solicitate", actor: "Maria Ionescu", details: "Necesar aviz Directia Silvica + studiu biodiversitate" },
      { timestamp: "1 Mar 2026, 09:00", action: "Nota admin", actor: "Admin", details: "Retrimis solicitare Directia Silvica — fara raspuns" },
    ],
  },
  {
    id: "c15", numar: "#1839", titlu: "Racord gaze naturale", cetatean: "Ion Dumitrache", tip: "Utilitati", departament: "Utilitati",
    dataDepunere: "23 Feb 2026", dataLimita: "9 Mar 2026", status: "verificare", prioritate: "medie", functionar: "George Radu", descriere: "Racordare la reteaua de gaze naturale.",
    zileInStatus: 3, ultimaActivitate: "1 Mar 2026, 10:00", slaZileRamase: 5, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "23 Feb 2026, 10:00", action: "Cerere depusa", actor: "Ion Dumitrache" },
      { timestamp: "24 Feb 2026, 09:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "1 Mar 2026, 10:00", action: "Verificare in curs", actor: "George Radu" },
    ],
  },
  {
    id: "c16", numar: "#1838", titlu: "Certificat fiscal mostenire", cetatean: "Petru Vasiliu", tip: "Fiscal", departament: "Fiscal",
    dataDepunere: "22 Feb 2026", dataLimita: "1 Mar 2026", status: "aprobata", prioritate: "scazuta", functionar: "Ana Moldovan", descriere: "Certificat fiscal pentru procedura de mostenire.",
    zileInStatus: 5, ultimaActivitate: "27 Feb 2026, 14:00", slaZileRamase: 0, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "22 Feb 2026, 09:00", action: "Cerere depusa", actor: "Petru Vasiliu" },
      { timestamp: "23 Feb 2026, 10:00", action: "Verificare", actor: "Ana Moldovan" },
      { timestamp: "27 Feb 2026, 14:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c17", numar: "#1837", titlu: "Autorizatie construire mansarda", cetatean: "Diana Ene", tip: "Constructii", departament: "Constructii",
    dataDepunere: "21 Feb 2026", dataLimita: "7 Mar 2026", status: "procesare", prioritate: "ridicata", functionar: "Elena Dragomir", descriere: "Supraetajare cu mansarda locuinta existenta.",
    zileInStatus: 6, ultimaActivitate: "26 Feb 2026, 14:00", slaZileRamase: 3, blocata: false, noteAdmin: [], escaladata: false,
    auditTrail: [
      { timestamp: "21 Feb 2026, 09:00", action: "Cerere depusa", actor: "Diana Ene" },
      { timestamp: "21 Feb 2026, 14:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "22 Feb 2026, 10:00", action: "Verificare completa", actor: "Elena Dragomir" },
      { timestamp: "26 Feb 2026, 14:00", action: "Procesare in curs — verificare structura", actor: "Elena Dragomir" },
    ],
  },
  {
    id: "c18", numar: "#1836", titlu: "Aviz iluminat public", cetatean: "Asociatia de Proprietari 12", tip: "Infrastructura", departament: "Infrastructura",
    dataDepunere: "20 Feb 2026", dataLimita: "6 Mar 2026", status: "info_supl", prioritate: "medie", functionar: "George Radu", descriere: "Extindere iluminat public pe aleea Parcului. Asteptare buget alocat.",
    zileInStatus: 7, ultimaActivitate: "25 Feb 2026, 09:00", slaZileRamase: 2, blocata: true, motivBlocare: "Blocat — asteptare aprobare buget de la Primar", noteAdmin: ["Necesita aprobare buget inainte de a continua"], escaladata: true,
    auditTrail: [
      { timestamp: "20 Feb 2026, 09:00", action: "Cerere depusa", actor: "Asociatia de Proprietari 12" },
      { timestamp: "20 Feb 2026, 14:00", action: "Alocata functionar", actor: "Sistem" },
      { timestamp: "25 Feb 2026, 09:00", action: "Info suplimentare — buget necesar", actor: "George Radu", details: "Necesita alocare buget ~15.000 RON pentru materiale" },
      { timestamp: "1 Mar 2026, 10:00", action: "Escaladare la Primar", actor: "Admin", details: "Solicitat aprobare buget pentru continuare" },
    ],
  },
];

// ─── Chart Data ───────────────────────────────────────

const trendData = [
  { zi: "20 Feb", depuse: 5, rezolvate: 3 },
  { zi: "21 Feb", depuse: 3, rezolvate: 4 },
  { zi: "22 Feb", depuse: 6, rezolvate: 2 },
  { zi: "23 Feb", depuse: 2, rezolvate: 5 },
  { zi: "24 Feb", depuse: 4, rezolvate: 3 },
  { zi: "25 Feb", depuse: 7, rezolvate: 6 },
  { zi: "26 Feb", depuse: 3, rezolvate: 4 },
  { zi: "27 Feb", depuse: 5, rezolvate: 3 },
  { zi: "28 Feb", depuse: 4, rezolvate: 5 },
  { zi: "1 Mar", depuse: 6, rezolvate: 4 },
  { zi: "2 Mar", depuse: 3, rezolvate: 2 },
  { zi: "3 Mar", depuse: 4, rezolvate: 3 },
  { zi: "4 Mar", depuse: 2, rezolvate: 1 },
];

// ─── Component ────────────────────────────────────────

export function CereriPage() {
  const [cereri, setCereri] = useState<Cerere[]>(initialCereri);
  const [activeTab, setActiveTab] = useState<TabView>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CerereStatus | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"numar" | "sla" | "prioritate" | "zile">("sla");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showReassignModal, setShowReassignModal] = useState<string | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [detailDrawer, setDetailDrawer] = useState<string | null>(null);
  const perPage = 8;

  // ─── Computed Stats ───────────────────────────────────

  const stats = useMemo(() => {
    const total = cereri.length;
    const active = cereri.filter((c) => !["aprobata", "respinsa"].includes(c.status)).length;
    const aprobate = cereri.filter((c) => c.status === "aprobata").length;
    const respinse = cereri.filter((c) => c.status === "respinsa").length;
    const blocate = cereri.filter((c) => c.blocata && !["aprobata", "respinsa"].includes(c.status)).length;
    const nealocate = cereri.filter((c) => c.functionar === "-" && !["aprobata", "respinsa"].includes(c.status)).length;
    const slaBreach = cereri.filter((c) => c.slaZileRamase <= 0 && !["aprobata", "respinsa"].includes(c.status)).length;
    const slaWarning = cereri.filter((c) => c.slaZileRamase > 0 && c.slaZileRamase <= 3 && !["aprobata", "respinsa"].includes(c.status)).length;
    const rataAprobare = total > 0 ? Math.round((aprobate / (aprobate + respinse || 1)) * 100) : 0;
    const timpMediuZile = 3.2; // mock
    const slaCompliance = total > 0 ? Math.round(((total - slaBreach) / total) * 100) : 100;

    const byStatus: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    const byFunctionar: Record<string, number> = {};
    cereri.forEach((c) => {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byDept[c.departament] = (byDept[c.departament] || 0) + 1;
      if (c.functionar !== "-") byFunctionar[c.functionar] = (byFunctionar[c.functionar] || 0) + 1;
    });

    return { total, active, aprobate, respinse, blocate, nealocate, slaBreach, slaWarning, rataAprobare, timpMediuZile, slaCompliance, byStatus, byDept, byFunctionar };
  }, [cereri]);

  const alerts = useMemo(() => {
    return cereri.filter((c) =>
      (c.blocata || c.slaZileRamase <= 2 || (c.zileInStatus >= 5 && !["aprobata", "respinsa"].includes(c.status)) || (c.functionar === "-" && c.zileInStatus >= 1))
      && !["aprobata", "respinsa"].includes(c.status)
    ).sort((a, b) => a.slaZileRamase - b.slaZileRamase);
  }, [cereri]);

  // ─── Filtered & Sorted ─────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...cereri];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.titlu.toLowerCase().includes(q) || c.cetatean.toLowerCase().includes(q) || c.numar.includes(q) || c.tip.toLowerCase().includes(q) || c.functionar.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter);
    if (deptFilter !== "all") result = result.filter((c) => c.departament === deptFilter);
    if (priorityFilter !== "all") result = result.filter((c) => c.prioritate === priorityFilter);
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "numar") cmp = b.numar.localeCompare(a.numar);
      else if (sortBy === "sla") cmp = a.slaZileRamase - b.slaZileRamase;
      else if (sortBy === "prioritate") cmp = priorityConfig[b.prioritate].level - priorityConfig[a.prioritate].level;
      else if (sortBy === "zile") cmp = b.zileInStatus - a.zileInStatus;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [cereri, searchQuery, statusFilter, deptFilter, priorityFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // ─── Actions ────────────────────────────────────────────

  const handleApprove = useCallback((id: string) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, status: "aprobata" as CerereStatus, blocata: false,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: "Aprobata de Admin (escaladare)", actor: "Admin Primarie" }],
    } : c));
    toast.success("Cerere aprobata prin escaladare admin!");
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#10b981", "#3b82f6", "#ec4899", "#f59e0b"] });
  }, []);

  const handleReject = useCallback((id: string) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, status: "respinsa" as CerereStatus, blocata: false,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: "Respinsa de Admin", actor: "Admin Primarie" }],
    } : c));
    toast.error("Cerere respinsa de admin.");
  }, []);

  const handleReassign = useCallback((id: string, funcName: string) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, functionar: funcName, blocata: false, zileInStatus: 0,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: `Reasignata de admin`, actor: "Admin Primarie", details: `Nou functionar: ${funcName}` }],
    } : c));
    toast.success(`Cerere reasignata catre ${funcName}`);
    setShowReassignModal(null);
  }, []);

  const handleUnblock = useCallback((id: string) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, blocata: false, motivBlocare: undefined, zileInStatus: 0,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: "Deblocata de admin", actor: "Admin Primarie", details: "Cerere deblocata manual — resetare timer" }],
    } : c));
    toast.success("Cerere deblocata! Timer resetat.");
  }, []);

  const handleEscalate = useCallback((id: string) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, escaladata: true, prioritate: "urgenta" as Priority,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: "Escaladat la Primar", actor: "Admin Primarie", details: "Prioritate schimbata in Urgenta" }],
    } : c));
    toast("Cerere escaladata la Primar cu prioritate urgenta!", { icon: "🔺" });
  }, []);

  const handleForceStatus = useCallback((id: string, newStatus: CerereStatus) => {
    const label = statusConfig[newStatus].label;
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, status: newStatus, blocata: false, zileInStatus: 0,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: `Status fortat: ${label}`, actor: "Admin Primarie", details: "Override manual de admin" }],
    } : c));
    toast(`Status schimbat in ${label}`, { icon: "⚡" });
  }, []);

  const handleAddNote = useCallback((id: string, note: string) => {
    if (!note.trim()) return;
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, noteAdmin: [...c.noteAdmin, note],
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: "Nota admin adaugata", actor: "Admin Primarie", details: note }],
    } : c));
    toast.success("Nota adaugata!");
    setAdminNoteInput("");
  }, []);

  const handleChangePriority = useCallback((id: string, newPriority: Priority) => {
    setCereri((prev) => prev.map((c) => c.id === id ? {
      ...c, prioritate: newPriority,
      auditTrail: [...c.auditTrail, { timestamp: "4 Mar 2026, 10:00", action: `Prioritate schimbata: ${priorityConfig[newPriority].label}`, actor: "Admin Primarie" }],
    } : c));
    toast(`Prioritate actualizata: ${priorityConfig[newPriority].label}`, { icon: "🏷️" });
  }, []);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("asc"); }
  };

  const kanbanColumns: CerereStatus[] = ["depusa", "verificare", "info_supl", "procesare", "aprobata", "respinsa"];

  const donutData = Object.entries(stats.byStatus).map(([key, val]) => ({
    label: statusConfig[key as CerereStatus]?.label || key,
    value: val,
    color: statusConfig[key as CerereStatus]?.color || "#666",
  }));

  const workloadData = functionari.map((f) => ({
    name: f.name.split(" ")[0],
    cereri: stats.byFunctionar[f.name] || 0,
    active: cereri.filter((c) => c.functionar === f.name && !["aprobata", "respinsa"].includes(c.status)).length,
  }));

  const drawerCerere = detailDrawer ? cereri.find((c) => c.id === detailDrawer) : null;

  // ─── Render ─────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <FileText className="w-6 h-6 text-pink-400" /> Supervizare Cereri
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-0.5" style={{ fontSize: "0.83rem" }}>
            {stats.total} cereri · {stats.active} active · {stats.blocate > 0 && <span className="text-red-400">{stats.blocate} blocate · </span>}{stats.nealocate > 0 && <span className="text-amber-400">{stats.nealocate} nealocate</span>}
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-gray-400 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Download className="w-3.5 h-3.5" />
            <span style={{ fontSize: "0.82rem" }}>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {([
          { id: "overview" as TabView, label: "Overview", icon: BarChart3 },
          { id: "table" as TabView, label: "Tabel", icon: List },
          { id: "kanban" as TabView, label: "Kanban", icon: LayoutGrid },
          { id: "alerts" as TabView, label: `Alerte${alerts.length > 0 ? ` (${alerts.length})` : ""}`, icon: AlertTriangle },
        ]).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="cereriTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.08))", border: "1px solid rgba(236,72,153,0.15)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? "text-pink-400" : ""}`} />
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>{tab.label}</span>
              {tab.id === "alerts" && alerts.length > 0 && !isActive && (
                <span className="relative z-10 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-3 mb-5">
            {[
              { label: "Cereri Active", value: stats.active, icon: Activity, color: "#3b82f6", sub: `din ${stats.total} total` },
              { label: "Rata Aprobare", value: `${stats.rataAprobare}%`, icon: Target, color: "#10b981", sub: `${stats.aprobate} aprobate` },
              { label: "SLA Compliance", value: `${stats.slaCompliance}%`, icon: Gauge, color: stats.slaCompliance >= 90 ? "#10b981" : stats.slaCompliance >= 70 ? "#f59e0b" : "#ef4444", sub: `${stats.slaBreach} incalcari` },
              { label: "Timp Mediu", value: `${stats.timpMediuZile}z`, icon: Timer, color: "#8b5cf6", sub: "per cerere" },
              { label: "Blocate", value: stats.blocate, icon: PauseCircle, color: stats.blocate > 0 ? "#ef4444" : "#6b7280", sub: stats.blocate > 0 ? "necesita atentie!" : "totul ok" },
              { label: "Nealocate", value: stats.nealocate, icon: Users, color: stats.nealocate > 0 ? "#f59e0b" : "#6b7280", sub: stats.nealocate > 0 ? "asteapta alocare" : "toate alocate" },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                  className="p-3.5 rounded-xl" style={{ background: `${kpi.color}08`, border: `1px solid ${kpi.color}15` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <div className="text-white" style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1 }}>{kpi.value}</div>
                  <div className="text-gray-500 mt-0.5" style={{ fontSize: "0.72rem" }}>{kpi.label}</div>
                  <div className="text-gray-600 mt-0.5" style={{ fontSize: "0.65rem" }}>{kpi.sub}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-12 gap-4 mb-5">
            {/* Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="col-span-5 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>Trend Cereri (14 zile)</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-blue-400" style={{ fontSize: "0.65rem" }}><span className="w-2 h-1 rounded bg-blue-500" /> Depuse</span>
                  <span className="flex items-center gap-1 text-emerald-400" style={{ fontSize: "0.65rem" }}><span className="w-2 h-1 rounded bg-emerald-500" /> Rezolvate</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradDepuse" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gradRezolvate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="zi" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip
                    cursor={{ stroke: "rgba(139,92,246,0.15)", strokeWidth: 1 }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{
                          background: "rgba(20,20,36,0.85)",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          border: "1px solid rgba(139,92,246,0.2)",
                          borderRadius: 14,
                          padding: "10px 14px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.08)",
                        }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{label}</div>
                          {payload.map((p: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block", boxShadow: `0 0 6px ${p.color}60` }} />
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{p.dataKey === "depuse" ? "Depuse" : "Rezolvate"}:</span>
                              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: p.color }}>{p.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="depuse" stroke="#3b82f6" strokeWidth={2} fill="url(#gradDepuse)" />
                  <Area type="monotone" dataKey="rezolvate" stroke="#10b981" strokeWidth={2} fill="url(#gradRezolvate)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Status Distribution — Donut */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="col-span-3 p-4 rounded-xl flex flex-col items-center" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-white mb-2 self-start" style={{ fontSize: "0.88rem", fontWeight: 600 }}>Distributie Status</h3>
              <DonutChart data={donutData} size={150} />
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
                {donutData.map((p) => (
                  <span key={p.label} className="flex items-center gap-1" style={{ fontSize: "0.62rem", color: p.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} /> {p.label} ({p.value})
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Workload per Functionar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="col-span-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>Workload Functionari</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-violet-400" style={{ fontSize: "0.65rem" }}><span className="w-2 h-1 rounded bg-violet-500" /> Total</span>
                  <span className="flex items-center gap-1 text-pink-400" style={{ fontSize: "0.65rem" }}><span className="w-2 h-1 rounded bg-pink-500" /> Active</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={workloadData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip
                    cursor={{ fill: "rgba(139,92,246,0.06)", radius: 8 } as any}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div style={{
                          background: "rgba(20,20,36,0.85)",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                          border: "1px solid rgba(139,92,246,0.2)",
                          borderRadius: 14,
                          padding: "10px 14px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.08)",
                        }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>{label}</div>
                          {payload.map((p: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 3, background: p.color, display: "inline-block", boxShadow: `0 0 6px ${p.color}60` }} />
                              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{p.dataKey === "cereri" ? "Total" : "Active"}:</span>
                              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: p.color }}>{p.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="cereri" fill="#8b5cf680" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Alert Strip */}
          {alerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-xl p-3 mb-5 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {alerts.length} cereri necesita atentie
                </div>
                <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>
                  {stats.slaBreach > 0 && `${stats.slaBreach} SLA depasit · `}
                  {stats.blocate > 0 && `${stats.blocate} blocate · `}
                  {stats.nealocate > 0 && `${stats.nealocate} nealocate`}
                </div>
              </div>
              <button onClick={() => setActiveTab("alerts")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-red-400 hover:text-white transition-all"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", fontSize: "0.82rem" }}>
                <Eye className="w-3.5 h-3.5" /> Vezi Alerte
              </button>
            </motion.div>
          )}

          {/* Quick Stats Grid: SLA distribution + recent activity */}
          <div className="grid grid-cols-2 gap-4">
            {/* SLA Health */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-white mb-3" style={{ fontSize: "0.88rem", fontWeight: 600 }}>SLA Health — Cereri Active</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Depasit SLA", count: stats.slaBreach, color: "#ef4444", icon: XCircle },
                  { label: "SLA < 3 zile", count: stats.slaWarning, color: "#f59e0b", icon: AlertTriangle },
                  { label: "SLA OK (> 3 zile)", count: stats.active - stats.slaBreach - stats.slaWarning, color: "#10b981", icon: CheckCircle2 },
                ].map((row) => {
                  const Icon = row.icon;
                  const pct = stats.active > 0 ? Math.round((row.count / stats.active) * 100) : 0;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: row.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300" style={{ fontSize: "0.78rem" }}>{row.label}</span>
                          <span style={{ fontSize: "0.78rem", color: row.color, fontWeight: 600 }}>{row.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: row.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Department Performance */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-white mb-3" style={{ fontSize: "0.88rem", fontWeight: 600 }}>Per Departament</h3>
              <div className="flex flex-col gap-1.5">
                {Object.entries(stats.byDept).sort(([, a], [, b]) => b - a).slice(0, 6).map(([dept, count]) => {
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={dept} className="flex items-center gap-3">
                      <span className="text-gray-400 w-24 truncate" style={{ fontSize: "0.75rem" }}>{dept}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #8b5cf6, #ec4899)" }} />
                      </div>
                      <span className="text-gray-500 w-10 text-right" style={{ fontSize: "0.72rem" }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* TABLE TAB */}
      {activeTab === "table" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-4 h-4 text-gray-500" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Cauta cereri, cetateni, functionari..." className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.85rem" }} />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2 rounded-xl text-gray-300 outline-none cursor-pointer appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
              <option value="all">Toate statusurile</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl text-gray-300 outline-none cursor-pointer appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
              <option value="all">Toate departamentele</option>
              {departamente.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2 rounded-xl text-gray-300 outline-none cursor-pointer appearance-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem" }}>
              <option value="all">Toate prioritatile</option>
              {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5" style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("numar")}>Nr. <ArrowUpDown className="w-3 h-3" /></div>
              <div className="col-span-3">Cerere / Functionar</div>
              <div className="col-span-1">Dept.</div>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("prioritate")}>Prior. <ArrowUpDown className="w-3 h-3" /></div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("sla")}>SLA <ArrowUpDown className="w-3 h-3" /></div>
              <div className="col-span-1 flex items-center gap-1 cursor-pointer" onClick={() => toggleSort("zile")}>Zile <ArrowUpDown className="w-3 h-3" /></div>
              <div className="col-span-1">Flag</div>
              <div className="col-span-2 text-right">Actiuni</div>
            </div>

            {/* Rows */}
            <AnimatePresence mode="popLayout">
              {paginated.map((c) => {
                const sc = statusConfig[c.status];
                const pc = priorityConfig[c.prioritate];
                const isExpanded = expandedRow === c.id;
                const isFinal = c.status === "aprobata" || c.status === "respinsa";
                const slaColor = c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";

                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div
                      className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center cursor-pointer transition-all ${isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onClick={() => setExpandedRow(isExpanded ? null : c.id)}
                    >
                      <div className="col-span-1 text-gray-400" style={{ fontSize: "0.82rem", fontWeight: 500 }}>{c.numar}</div>
                      <div className="col-span-3 min-w-0">
                        <div className="text-white truncate" style={{ fontSize: "0.82rem" }}>{c.titlu}</div>
                        <div className="text-gray-600 truncate flex items-center gap-1" style={{ fontSize: "0.68rem" }}>
                          <User className="w-2.5 h-2.5" /> {c.cetatean}
                          <span className="text-gray-700 mx-0.5">·</span>
                          {c.functionar !== "-" ? <><UserCheck className="w-2.5 h-2.5" /> {c.functionar}</> : <span className="text-amber-500">Nealocat</span>}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className="text-gray-500 truncate" style={{ fontSize: "0.72rem" }}>{c.departament}</span>
                      </div>
                      <div className="col-span-1">
                        <span className="flex items-center gap-1" style={{ fontSize: "0.7rem", color: pc.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc.color }} /> {pc.label}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="px-1.5 py-0.5 rounded-md inline-flex items-center gap-1" style={{ fontSize: "0.68rem", color: sc.color, background: sc.bg }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: sc.color }} /> {sc.label}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="flex items-center gap-1" style={{ fontSize: "0.75rem", color: slaColor, fontWeight: 600 }}>
                          <Timer className="w-3 h-3" />
                          {isFinal ? "—" : c.slaZileRamase <= 0 ? `${Math.abs(c.slaZileRamase)}z dep.` : `${c.slaZileRamase}z`}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>{isFinal ? "—" : `${c.zileInStatus}z`}</span>
                      </div>
                      <div className="col-span-1 flex items-center gap-1">
                        {c.blocata && <span title="Blocata" className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}><Lock className="w-3 h-3 text-red-400" /></span>}
                        {c.escaladata && <span title="Escaladata" className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}><ArrowUp className="w-3 h-3 text-amber-400" /></span>}
                        {c.noteAdmin.length > 0 && <span title="Note admin" className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}><StickyNote className="w-3 h-3 text-violet-400" /></span>}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        {!isFinal && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleApprove(c.id); }} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-600 hover:text-emerald-400 cursor-pointer transition-all" title="Aproba"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleReject(c.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 cursor-pointer transition-all" title="Respinge"><XCircle className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setDetailDrawer(c.id); }} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-white cursor-pointer transition-all" title="Detalii complete"><ExternalLink className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>

                    {/* Expanded Quick Actions */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 py-3 mx-3 mb-2 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div className="grid grid-cols-4 gap-3 mb-3">
                              <div>
                                <div className="text-gray-600 mb-0.5" style={{ fontSize: "0.65rem" }}>Descriere</div>
                                <p className="text-gray-300" style={{ fontSize: "0.78rem" }}>{c.descriere}</p>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-0.5" style={{ fontSize: "0.65rem" }}>Data Depunere / Deadline SLA</div>
                                <div className="text-white" style={{ fontSize: "0.78rem" }}>{c.dataDepunere} → {c.dataLimita}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-0.5" style={{ fontSize: "0.65rem" }}>Ultima Activitate</div>
                                <div className="text-gray-300" style={{ fontSize: "0.78rem" }}>{c.ultimaActivitate}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 mb-0.5" style={{ fontSize: "0.65rem" }}>Motiv Blocare</div>
                                <div className={c.blocata ? "text-red-400" : "text-gray-600"} style={{ fontSize: "0.78rem" }}>{c.motivBlocare || "—"}</div>
                              </div>
                            </div>

                            {/* Quick Admin Actions */}
                            {!isFinal && (
                              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                                <span className="text-gray-600 mr-1" style={{ fontSize: "0.68rem" }}>Admin:</span>
                                <button onClick={() => setShowReassignModal(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-cyan-400 hover:bg-cyan-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.1)" }}>
                                  <ArrowRightLeft className="w-3 h-3" /> Reasigneaza
                                </button>
                                {c.blocata && (
                                  <button onClick={() => handleUnblock(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-emerald-400 hover:bg-emerald-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                                    <Unlock className="w-3 h-3" /> Deblocheaza
                                  </button>
                                )}
                                {!c.escaladata && (
                                  <button onClick={() => handleEscalate(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-amber-400 hover:bg-amber-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                                    <ArrowUp className="w-3 h-3" /> Escaleaza
                                  </button>
                                )}
                                <button onClick={() => setDetailDrawer(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-violet-400 hover:bg-violet-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)" }}>
                                  <History className="w-3 h-3" /> Audit Trail
                                </button>
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
              <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>
                {filtered.length > 0 ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} din ${filtered.length}` : "Nicio cerere"}
              </span>
              <div className="flex items-center gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg cursor-pointer transition-all ${p === page ? "text-white" : "text-gray-600 hover:text-white hover:bg-white/5"}`} style={p === page ? { background: "rgba(236,72,153,0.2)", fontSize: "0.78rem" } : { fontSize: "0.78rem" }}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30 cursor-pointer transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KANBAN TAB */}
      {activeTab === "kanban" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 overflow-x-auto pb-4">
          {kanbanColumns.map((status) => {
            const sc = statusConfig[status];
            const items = cereri.filter((c) => c.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-56 flex flex-col rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.04]">
                  <div className="w-2 h-2 rounded-full" style={{ background: sc.color }} />
                  <span className="text-gray-200" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{sc.label}</span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-gray-500" style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.05)" }}>{items.length}</span>
                </div>
                <div className="flex-1 p-2 flex flex-col gap-2 max-h-[55vh] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}>
                  {items.map((c) => {
                    const slaColor = c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
                    const isFinal = c.status === "aprobata" || c.status === "respinsa";
                    return (
                      <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-2.5 rounded-xl cursor-pointer group hover:bg-white/[0.03] transition-all"
                        style={{ background: "rgba(255,255,255,0.015)", border: c.blocata ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.04)" }}
                        onClick={() => setDetailDrawer(c.id)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500" style={{ fontSize: "0.68rem" }}>{c.numar}</span>
                          <div className="flex items-center gap-1">
                            {c.blocata && <Lock className="w-2.5 h-2.5 text-red-400" />}
                            <span className="flex items-center gap-0.5" style={{ fontSize: "0.62rem", color: priorityConfig[c.prioritate].color }}>
                              <span className="w-1 h-1 rounded-full" style={{ background: priorityConfig[c.prioritate].color }} /> {priorityConfig[c.prioritate].label}
                            </span>
                          </div>
                        </div>
                        <div className="text-white mb-1" style={{ fontSize: "0.78rem" }}>{c.titlu}</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-gray-600" />
                            <span className="text-gray-500 truncate" style={{ fontSize: "0.68rem" }}>{c.cetatean}</span>
                          </div>
                          {!isFinal && (
                            <span className="flex items-center gap-0.5" style={{ fontSize: "0.62rem", color: slaColor }}>
                              <Timer className="w-2.5 h-2.5" /> {c.slaZileRamase <= 0 ? "SLA!" : `${c.slaZileRamase}z`}
                            </span>
                          )}
                        </div>
                        {c.functionar !== "-" && (
                          <div className="flex items-center gap-1 mt-1">
                            <UserCheck className="w-2.5 h-2.5 text-gray-600" />
                            <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>{c.functionar}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {items.length === 0 && <div className="flex items-center justify-center py-6 text-gray-700" style={{ fontSize: "0.75rem" }}>Gol</div>}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ALERTS TAB */}
      {activeTab === "alerts" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-600">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/30 mb-3" />
              <div style={{ fontSize: "1rem", fontWeight: 600 }} className="text-gray-400">Nicio alerta activa</div>
              <div style={{ fontSize: "0.82rem" }}>Toate cererile sunt in parametri normali.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {alerts.map((c, i) => {
                const sc = statusConfig[c.status];
                const pc = priorityConfig[c.prioritate];
                const slaColor = c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
                const severity = c.slaZileRamase <= 0 ? "critical" : c.blocata ? "high" : c.slaZileRamase <= 3 ? "medium" : "low";
                const severityColor = severity === "critical" ? "#ef4444" : severity === "high" ? "#f97316" : severity === "medium" ? "#f59e0b" : "#6b7280";

                return (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
                    className="p-4 rounded-xl" style={{ background: `${severityColor}06`, border: `1px solid ${severityColor}15` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${severityColor}15` }}>
                        {severity === "critical" ? <Flame className="w-4 h-4" style={{ color: severityColor }} /> :
                         severity === "high" ? <AlertTriangle className="w-4 h-4" style={{ color: severityColor }} /> :
                         <Clock className="w-4 h-4" style={{ color: severityColor }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>{c.numar}</span>
                          <span className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>{c.titlu}</span>
                          <span className="px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.65rem", color: sc.color, background: sc.bg }}>{sc.label}</span>
                          <span className="flex items-center gap-1" style={{ fontSize: "0.65rem", color: pc.color }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: pc.color }} />{pc.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 mb-2" style={{ fontSize: "0.75rem" }}>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {c.cetatean}</span>
                          <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {c.functionar !== "-" ? c.functionar : "Nealocat"}</span>
                          <span className="flex items-center gap-1" style={{ color: slaColor, fontWeight: 600 }}>
                            <Timer className="w-3 h-3" /> {c.slaZileRamase <= 0 ? `Depasit cu ${Math.abs(c.slaZileRamase)}z` : `${c.slaZileRamase}z ramase`}
                          </span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.zileInStatus}z in status actual</span>
                        </div>
                        {c.motivBlocare && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-2" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)", fontSize: "0.75rem" }}>
                            <Lock className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="text-red-300/80">{c.motivBlocare}</span>
                          </div>
                        )}
                        {/* Admin interventions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button onClick={() => setShowReassignModal(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-cyan-400 hover:bg-cyan-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.1)" }}>
                            <ArrowRightLeft className="w-3 h-3" /> Reasigneaza
                          </button>
                          {c.blocata && (
                            <button onClick={() => handleUnblock(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-emerald-400 hover:bg-emerald-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                              <Unlock className="w-3 h-3" /> Deblocheaza
                            </button>
                          )}
                          {!c.escaladata && (
                            <button onClick={() => handleEscalate(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-amber-400 hover:bg-amber-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)" }}>
                              <ArrowUp className="w-3 h-3" /> Escaleaza la Primar
                            </button>
                          )}
                          <button onClick={() => handleApprove(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-emerald-400 hover:bg-emerald-400/10 transition-all" style={{ fontSize: "0.72rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                            <CheckCircle2 className="w-3 h-3" /> Aproba
                          </button>
                          <button onClick={() => setDetailDrawer(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer text-gray-400 hover:bg-white/5 transition-all" style={{ fontSize: "0.72rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <History className="w-3 h-3" /> Detalii
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ─── DETAIL DRAWER ────────────────────────────────── */}
      <AnimatePresence>
        {detailDrawer && drawerCerere && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50" onClick={() => setDetailDrawer(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 w-[460px] h-full overflow-y-auto"
              style={{ background: "#0e0e1a", borderLeft: "1px solid rgba(255,255,255,0.06)", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.05) transparent" }}>
              {(() => {
                const c = drawerCerere;
                const sc = statusConfig[c.status];
                const pc = priorityConfig[c.prioritate];
                const slaColor = c.slaZileRamase <= 0 ? "#ef4444" : c.slaZileRamase <= 3 ? "#f59e0b" : "#10b981";
                const isFinal = c.status === "aprobata" || c.status === "respinsa";

                return (
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>Detalii Cerere</h3>
                      <button onClick={() => setDetailDrawer(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Title Card */}
                    <div className="p-4 rounded-xl mb-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>{c.numar}</span>
                        <span className="px-1.5 py-0.5 rounded-md" style={{ fontSize: "0.65rem", color: sc.color, background: sc.bg }}>{sc.label}</span>
                        <span className="flex items-center gap-1" style={{ fontSize: "0.65rem", color: pc.color }}>
                          <span className="w-1 h-1 rounded-full" style={{ background: pc.color }} /> {pc.label}
                        </span>
                        {c.blocata && <span className="px-1.5 py-0.5 rounded-md text-red-400" style={{ fontSize: "0.65rem", background: "rgba(239,68,68,0.12)" }}>BLOCAT</span>}
                        {c.escaladata && <span className="px-1.5 py-0.5 rounded-md text-amber-400" style={{ fontSize: "0.65rem", background: "rgba(245,158,11,0.12)" }}>ESCALAT</span>}
                      </div>
                      <div className="text-white mb-2" style={{ fontSize: "1.05rem", fontWeight: 600 }}>{c.titlu}</div>
                      <p className="text-gray-400" style={{ fontSize: "0.82rem" }}>{c.descriere}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: "Cetatean", value: c.cetatean, icon: User },
                        { label: "Functionar", value: c.functionar !== "-" ? c.functionar : "Nealocat", icon: UserCheck },
                        { label: "Departament", value: c.departament, icon: FileText },
                        { label: "Tip", value: c.tip, icon: FileText },
                        { label: "Data Depunere", value: c.dataDepunere, icon: Calendar },
                        { label: "Deadline SLA", value: c.dataLimita, icon: Timer },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-1 text-gray-600 mb-0.5" style={{ fontSize: "0.65rem" }}><Icon className="w-3 h-3" /> {item.label}</div>
                            <div className="text-white" style={{ fontSize: "0.82rem" }}>{item.value}</div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SLA Meter */}
                    <div className="p-3 rounded-xl mb-4" style={{ background: `${slaColor}08`, border: `1px solid ${slaColor}15` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-400" style={{ fontSize: "0.78rem" }}>SLA Status</span>
                        <span style={{ fontSize: "0.85rem", color: slaColor, fontWeight: 700 }}>
                          {isFinal ? "Finalizata" : c.slaZileRamase <= 0 ? `DEPASIT cu ${Math.abs(c.slaZileRamase)} zile` : `${c.slaZileRamase} zile ramase`}
                        </span>
                      </div>
                      {!isFinal && (
                        <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min(100, Math.max(5, c.slaZileRamase <= 0 ? 100 : (1 - c.slaZileRamase / 30) * 100))}%`,
                            background: slaColor,
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Motiv Blocare */}
                    {c.motivBlocare && (
                      <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                        <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-red-300" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Motiv Blocare</div>
                          <div className="text-red-300/70" style={{ fontSize: "0.78rem" }}>{c.motivBlocare}</div>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {c.noteAdmin.length > 0 && (
                      <div className="mb-4">
                        <div className="text-gray-400 mb-2 flex items-center gap-1" style={{ fontSize: "0.78rem", fontWeight: 600 }}><StickyNote className="w-3.5 h-3.5 text-violet-400" /> Note Admin ({c.noteAdmin.length})</div>
                        <div className="flex flex-col gap-1.5">
                          {c.noteAdmin.map((note, i) => (
                            <div key={i} className="px-3 py-2 rounded-lg text-gray-300" style={{ fontSize: "0.78rem", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.08)" }}>{note}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audit Trail */}
                    <div className="mb-4">
                      <div className="text-gray-400 mb-2 flex items-center gap-1" style={{ fontSize: "0.78rem", fontWeight: 600 }}><History className="w-3.5 h-3.5 text-pink-400" /> Audit Trail ({c.auditTrail.length})</div>
                      <div className="relative pl-4 flex flex-col gap-0">
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
                        {c.auditTrail.map((entry, i) => (
                          <div key={i} className="relative flex gap-3 py-2">
                            <div className="absolute left-[-13px] top-3 w-2.5 h-2.5 rounded-full border-2 shrink-0" style={{ borderColor: i === c.auditTrail.length - 1 ? "#ec4899" : "rgba(255,255,255,0.1)", background: i === c.auditTrail.length - 1 ? "#ec4899" : "#0e0e1a" }} />
                            <div className="ml-2">
                              <div className="text-white" style={{ fontSize: "0.78rem" }}>{entry.action}</div>
                              <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: "0.68rem" }}>
                                <span>{entry.timestamp}</span>
                                <span>·</span>
                                <span>{entry.actor}</span>
                              </div>
                              {entry.details && <div className="text-gray-500 mt-0.5" style={{ fontSize: "0.72rem" }}>{entry.details}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Actions Panel */}
                    {!isFinal && (
                      <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.04), rgba(139,92,246,0.04))", border: "1px solid rgba(236,72,153,0.1)" }}>
                        <div className="text-white mb-3 flex items-center gap-1.5" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          <Shield className="w-4 h-4 text-pink-400" /> Interventii Admin
                        </div>

                        {/* Add Note */}
                        <div className="mb-3">
                          <div className="text-gray-500 mb-1" style={{ fontSize: "0.72rem" }}>Adauga nota admin</div>
                          <div className="flex gap-2">
                            <input value={adminNoteInput} onChange={(e) => setAdminNoteInput(e.target.value)} placeholder="Nota..." className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.06)" }}
                              onKeyDown={(e) => { if (e.key === "Enter") { handleAddNote(c.id, adminNoteInput); } }} />
                            <button onClick={() => handleAddNote(c.id, adminNoteInput)} className="px-3 py-2 rounded-lg cursor-pointer text-violet-400 hover:bg-violet-400/10 transition-all" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.1)", fontSize: "0.82rem" }}>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Priority Override */}
                        <div className="mb-3">
                          <div className="text-gray-500 mb-1" style={{ fontSize: "0.72rem" }}>Schimba prioritate</div>
                          <div className="flex gap-1.5">
                            {(Object.entries(priorityConfig) as [Priority, typeof priorityConfig[Priority]][]).map(([key, cfg]) => (
                              <button key={key} onClick={() => handleChangePriority(c.id, key)}
                                className={`flex-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${c.prioritate === key ? "ring-1" : ""}`}
                                style={{ fontSize: "0.72rem", color: cfg.color, background: `${cfg.color}10`, border: `1px solid ${cfg.color}${c.prioritate === key ? "40" : "15"}`, ...(c.prioritate === key ? { ringColor: cfg.color } : {}) }}>
                                {cfg.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Force Status */}
                        <div className="mb-3">
                          <div className="text-gray-500 mb-1" style={{ fontSize: "0.72rem" }}>Forteaza status (override)</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(["depusa", "verificare", "info_supl", "procesare"] as CerereStatus[]).filter((s) => s !== c.status).map((s) => {
                              const cfg = statusConfig[s];
                              return (
                                <button key={s} onClick={() => handleForceStatus(c.id, s)}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all hover:brightness-125"
                                  style={{ fontSize: "0.7rem", color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}20` }}>
                                  <Zap className="w-2.5 h-2.5" /> {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.04]">
                          <button onClick={() => setShowReassignModal(c.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-cyan-400 hover:bg-cyan-400/10 transition-all"
                            style={{ fontSize: "0.78rem", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.12)" }}>
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Reasigneaza
                          </button>
                          {c.blocata && (
                            <button onClick={() => handleUnblock(c.id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-emerald-400 hover:bg-emerald-400/10 transition-all"
                              style={{ fontSize: "0.78rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}>
                              <Unlock className="w-3.5 h-3.5" /> Deblocheaza
                            </button>
                          )}
                          {!c.escaladata && (
                            <button onClick={() => handleEscalate(c.id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer text-amber-400 hover:bg-amber-400/10 transition-all"
                              style={{ fontSize: "0.78rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.12)" }}>
                              <ArrowUp className="w-3.5 h-3.5" /> Escaleaza la Primar
                            </button>
                          )}
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApprove(c.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer text-white"
                            style={{ fontSize: "0.78rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aproba
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleReject(c.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl cursor-pointer text-white"
                            style={{ fontSize: "0.78rem", background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                            <XCircle className="w-3.5 h-3.5" /> Respinge
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {isFinal && (
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: c.status === "aprobata" ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${sc.color}15` }}>
                        {c.status === "aprobata" ? <Sparkles className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                        <span style={{ fontSize: "0.85rem", color: sc.color, fontWeight: 600 }}>Cerere {sc.label.toLowerCase()}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── REASSIGN MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {showReassignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowReassignModal(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-5 rounded-2xl"
              style={{ background: "linear-gradient(180deg, #1a1a2e, #141424)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white flex items-center gap-2" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  <ArrowRightLeft className="w-4 h-4 text-cyan-400" /> Reasigneaza Cerere
                </h3>
                <button onClick={() => setShowReassignModal(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-gray-500 mb-3" style={{ fontSize: "0.82rem" }}>
                Selecteaza functionarul caruia doresti sa-i reasignezi cererea {cereri.find((c) => c.id === showReassignModal)?.numar}:
              </div>
              <div className="flex flex-col gap-2">
                {functionari.map((f) => {
                  const currentCerere = cereri.find((c) => c.id === showReassignModal);
                  const isCurrent = currentCerere?.functionar === f.name;
                  const activeCnt = cereri.filter((c) => c.functionar === f.name && !["aprobata", "respinsa"].includes(c.status)).length;
                  return (
                    <button key={f.id} onClick={() => !isCurrent && handleReassign(showReassignModal, f.name)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-left ${isCurrent ? "ring-1 ring-cyan-500/30" : "hover:bg-white/[0.03]"}`}
                      style={{ background: isCurrent ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8b5cf680, #ec489980)", fontSize: "0.75rem", fontWeight: 700 }}>
                        {f.name.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white flex items-center gap-2" style={{ fontSize: "0.85rem" }}>
                          {f.name}
                          {isCurrent && <span className="text-cyan-400 px-1.5 py-0.5 rounded" style={{ fontSize: "0.6rem", background: "rgba(6,182,212,0.12)" }}>actual</span>}
                        </div>
                        <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>{f.dept} · {activeCnt} cereri active</div>
                      </div>
                      <div className="shrink-0">
                        <div className={`w-8 h-2 rounded-full ${activeCnt > 8 ? "bg-red-500/30" : activeCnt > 4 ? "bg-amber-500/30" : "bg-emerald-500/30"}`}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (activeCnt / 12) * 100)}%`, background: activeCnt > 8 ? "#ef4444" : activeCnt > 4 ? "#f59e0b" : "#10b981" }} />
                        </div>
                        <div className="text-gray-600 text-right mt-0.5" style={{ fontSize: "0.6rem" }}>workload</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
