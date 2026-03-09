import type { LucideIcon } from "lucide-react";
import { FileText, Eye, AlertCircle, Activity, CheckCircle2, XCircle } from "lucide-react";

// ─── Tooltip types ────────────────────────────────────

interface TooltipEntry {
  dataKey: string;
  value: number;
  color: string;
}
interface RechartsTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

// ─── Types ────────────────────────────────────────────

export type CerereStatus =
  | "depusa"
  | "verificare"
  | "info_supl"
  | "procesare"
  | "aprobata"
  | "respinsa";
export type Priority = "urgenta" | "ridicata" | "medie" | "scazuta";
export type TabView = "overview" | "table" | "kanban" | "alerts";

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface Cerere {
  id: string;
  numar: string;
  titlu: string;
  cetatean: string;
  tip: string;
  departament: string;
  dataDepunere: string;
  dataLimita: string;
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

export const statusConfig: Record<
  CerereStatus,
  { label: string; color: string; bg: string; icon: LucideIcon }
> = {
  depusa: { label: "Depusa", color: "#3b82f6", bg: "#3b82f612", icon: FileText },
  verificare: { label: "In Verificare", color: "#8b5cf6", bg: "#8b5cf612", icon: Eye },
  info_supl: { label: "Info Suplim.", color: "#f59e0b", bg: "#f59e0b12", icon: AlertCircle },
  procesare: { label: "In Procesare", color: "#06b6d4", bg: "#06b6d412", icon: Activity },
  aprobata: { label: "Aprobata", color: "#10b981", bg: "#10b98112", icon: CheckCircle2 },
  respinsa: { label: "Respinsa", color: "#ef4444", bg: "#ef444412", icon: XCircle },
};

export const priorityConfig: Record<Priority, { label: string; color: string; level: number }> = {
  urgenta: { label: "Urgenta", color: "#ef4444", level: 4 },
  ridicata: { label: "Ridicata", color: "#f97316", level: 3 },
  medie: { label: "Medie", color: "#f59e0b", level: 2 },
  scazuta: { label: "Scazuta", color: "#6b7280", level: 1 },
};

export const functionariList = [
  { id: "f1", name: "Elena Dragomir", dept: "Urbanism", cereriActive: 8 },
  { id: "f2", name: "Ion Petrescu", dept: "Constructii", cereriActive: 12 },
  { id: "f3", name: "Maria Ionescu", dept: "Mediu", cereriActive: 5 },
  { id: "f4", name: "Ana Moldovan", dept: "Fiscal", cereriActive: 9 },
  { id: "f5", name: "George Radu", dept: "Infrastructura", cereriActive: 3 },
];

export const departamente = [
  "Urbanism",
  "Constructii",
  "Fiscal",
  "Mediu",
  "Infrastructura",
  "Sanatate",
  "Publicitate",
  "Utilitati",
];

export const kanbanColumns: CerereStatus[] = [
  "depusa",
  "verificare",
  "info_supl",
  "procesare",
  "aprobata",
  "respinsa",
];

// ─── Mock Data ────────────────────────────────────────

export const initialCereri: Cerere[] = [
  {
    id: "c1",
    numar: "#1853",
    titlu: "Certificat de urbanism S+P+2E",
    cetatean: "Andrei Marinescu",
    tip: "Urbanism",
    departament: "Urbanism",
    dataDepunere: "4 Mar 2026",
    dataLimita: "18 Mar 2026",
    status: "depusa",
    prioritate: "urgenta",
    functionar: "-",
    descriere:
      "Solicitare certificat de urbanism pentru constructie S+P+2E pe str. Aviatorilor nr. 15.",
    zileInStatus: 0,
    ultimaActivitate: "4 Mar 2026, 09:15",
    slaZileRamase: 14,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      {
        timestamp: "4 Mar 2026, 09:15",
        action: "Cerere depusa",
        actor: "Andrei Marinescu",
        details: "Depunere online cu 4 documente atasate",
      },
    ],
  },
  {
    id: "c2",
    numar: "#1852",
    titlu: "Autorizatie de construire bloc P+4E",
    cetatean: "Maria Popescu",
    tip: "Constructii",
    departament: "Constructii",
    dataDepunere: "3 Mar 2026",
    dataLimita: "2 Apr 2026",
    status: "verificare",
    prioritate: "ridicata",
    functionar: "Ion Petrescu",
    descriere: "Autorizatie construire bloc de locuinte, P+4E, zona rezidentiala Nord.",
    zileInStatus: 1,
    ultimaActivitate: "3 Mar 2026, 14:30",
    slaZileRamase: 29,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "3 Mar 2026, 10:00", action: "Cerere depusa", actor: "Maria Popescu" },
      {
        timestamp: "3 Mar 2026, 14:30",
        action: "Alocata functionar",
        actor: "Sistem",
        details: "Auto-alocare catre Ion Petrescu",
      },
    ],
  },
  {
    id: "c3",
    numar: "#1851",
    titlu: "Certificat fiscal vanzare",
    cetatean: "George Ionescu",
    tip: "Fiscal",
    departament: "Fiscal",
    dataDepunere: "3 Mar 2026",
    dataLimita: "10 Mar 2026",
    status: "aprobata",
    prioritate: "scazuta",
    functionar: "Ana Moldovan",
    descriere: "Certificat fiscal necesar pentru vanzare proprietate.",
    zileInStatus: 0,
    ultimaActivitate: "4 Mar 2026, 08:00",
    slaZileRamase: 6,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "3 Mar 2026, 09:00", action: "Cerere depusa", actor: "George Ionescu" },
      { timestamp: "4 Mar 2026, 08:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c4",
    numar: "#1850",
    titlu: "Aviz de mediu spatiu comercial",
    cetatean: "Laura Dumitrescu",
    tip: "Mediu",
    departament: "Mediu",
    dataDepunere: "2 Mar 2026",
    dataLimita: "16 Mar 2026",
    status: "info_supl",
    prioritate: "medie",
    functionar: "Maria Ionescu",
    descriere: "Solicitare aviz de mediu pentru spatiu comercial. Lipsa studiu de impact.",
    zileInStatus: 2,
    ultimaActivitate: "2 Mar 2026, 16:00",
    slaZileRamase: 12,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "2 Mar 2026, 09:30", action: "Cerere depusa", actor: "Laura Dumitrescu" },
      {
        timestamp: "2 Mar 2026, 16:00",
        action: "Info suplimentare solicitate",
        actor: "Maria Ionescu",
      },
    ],
  },
  {
    id: "c5",
    numar: "#1849",
    titlu: "Autorizatie demolare constructie C1",
    cetatean: "Vasile Radu",
    tip: "Constructii",
    departament: "Constructii",
    dataDepunere: "2 Mar 2026",
    dataLimita: "16 Mar 2026",
    status: "procesare",
    prioritate: "medie",
    functionar: "Ion Petrescu",
    descriere: "Demolare constructie veche C1 pe str. Libertatii nr. 42.",
    zileInStatus: 2,
    ultimaActivitate: "3 Mar 2026, 10:00",
    slaZileRamase: 12,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "2 Mar 2026, 10:00", action: "Cerere depusa", actor: "Vasile Radu" },
      { timestamp: "3 Mar 2026, 10:00", action: "Procesare in curs", actor: "Ion Petrescu" },
    ],
  },
  {
    id: "c6",
    numar: "#1848",
    titlu: "Certificat fiscal succesiune",
    cetatean: "Ana Sandu",
    tip: "Fiscal",
    departament: "Fiscal",
    dataDepunere: "1 Mar 2026",
    dataLimita: "8 Mar 2026",
    status: "aprobata",
    prioritate: "scazuta",
    functionar: "Ana Moldovan",
    descriere: "Certificat fiscal pentru succesiune.",
    zileInStatus: 1,
    ultimaActivitate: "3 Mar 2026, 09:00",
    slaZileRamase: 4,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "1 Mar 2026, 10:00", action: "Cerere depusa", actor: "Ana Sandu" },
      { timestamp: "3 Mar 2026, 09:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c7",
    numar: "#1847",
    titlu: "Reclamatie drum deteriorat",
    cetatean: "Mihai Vlad",
    tip: "Infrastructura",
    departament: "Infrastructura",
    dataDepunere: "1 Mar 2026",
    dataLimita: "15 Mar 2026",
    status: "depusa",
    prioritate: "ridicata",
    functionar: "-",
    descriere: "Drum deteriorat pe str. Florilor, necesita reparatii urgente.",
    zileInStatus: 3,
    ultimaActivitate: "1 Mar 2026, 08:00",
    slaZileRamase: 11,
    blocata: true,
    motivBlocare: "Nealocata >48h — niciun functionar disponibil in departament",
    noteAdmin: [],
    escaladata: false,
    auditTrail: [{ timestamp: "1 Mar 2026, 08:00", action: "Cerere depusa", actor: "Mihai Vlad" }],
  },
  {
    id: "c8",
    numar: "#1846",
    titlu: "Aviz sanitar alimentar",
    cetatean: "Cristina Barbu",
    tip: "Sanatate",
    departament: "Sanatate",
    dataDepunere: "28 Feb 2026",
    dataLimita: "7 Mar 2026",
    status: "respinsa",
    prioritate: "scazuta",
    functionar: "Maria Ionescu",
    descriere: "Aviz sanitar alimentar respins — documentatie incompleta.",
    zileInStatus: 2,
    ultimaActivitate: "2 Mar 2026, 11:00",
    slaZileRamase: 3,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "28 Feb 2026, 09:00", action: "Cerere depusa", actor: "Cristina Barbu" },
      { timestamp: "2 Mar 2026, 11:00", action: "Respinsa", actor: "Maria Ionescu" },
    ],
  },
  {
    id: "c9",
    numar: "#1845",
    titlu: "Certificat urbanism extindere",
    cetatean: "Dan Enescu",
    tip: "Urbanism",
    departament: "Urbanism",
    dataDepunere: "28 Feb 2026",
    dataLimita: "14 Mar 2026",
    status: "aprobata",
    prioritate: "medie",
    functionar: "Elena Dragomir",
    descriere: "Certificat urbanism extindere spatiu comercial.",
    zileInStatus: 1,
    ultimaActivitate: "3 Mar 2026, 15:00",
    slaZileRamase: 10,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "28 Feb 2026, 10:00", action: "Cerere depusa", actor: "Dan Enescu" },
      { timestamp: "3 Mar 2026, 15:00", action: "Aprobata", actor: "Elena Dragomir" },
    ],
  },
  {
    id: "c10",
    numar: "#1844",
    titlu: "Autorizatie panou publicitar",
    cetatean: "SC Media SRL",
    tip: "Publicitate",
    departament: "Publicitate",
    dataDepunere: "27 Feb 2026",
    dataLimita: "13 Mar 2026",
    status: "verificare",
    prioritate: "scazuta",
    functionar: "Ion Petrescu",
    descriere: "Amplasare panou publicitar zona centrala.",
    zileInStatus: 5,
    ultimaActivitate: "27 Feb 2026, 11:00",
    slaZileRamase: 9,
    blocata: true,
    motivBlocare: "Fara activitate >5 zile — posibil blocat la functionar",
    noteAdmin: ["Verificat — Ion P. in concediu medical"],
    escaladata: false,
    auditTrail: [
      { timestamp: "27 Feb 2026, 09:00", action: "Cerere depusa", actor: "SC Media SRL" },
      { timestamp: "27 Feb 2026, 11:00", action: "Alocata functionar", actor: "Sistem" },
    ],
  },
  {
    id: "c11",
    numar: "#1843",
    titlu: "Bransament apa potabila",
    cetatean: "Florin Neagu",
    tip: "Utilitati",
    departament: "Utilitati",
    dataDepunere: "27 Feb 2026",
    dataLimita: "6 Mar 2026",
    status: "depusa",
    prioritate: "urgenta",
    functionar: "-",
    descriere: "Bransament apa potabila str. Teiului nr. 8.",
    zileInStatus: 5,
    ultimaActivitate: "27 Feb 2026, 14:00",
    slaZileRamase: 2,
    blocata: true,
    motivBlocare: "SLA aproape expirat + nealocata",
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "27 Feb 2026, 14:00", action: "Cerere depusa", actor: "Florin Neagu" },
    ],
  },
  {
    id: "c12",
    numar: "#1842",
    titlu: "Certificat fiscal credit ipotecar",
    cetatean: "Elena Munteanu",
    tip: "Fiscal",
    departament: "Fiscal",
    dataDepunere: "26 Feb 2026",
    dataLimita: "5 Mar 2026",
    status: "aprobata",
    prioritate: "scazuta",
    functionar: "Ana Moldovan",
    descriere: "Certificat fiscal necesar pentru credit ipotecar.",
    zileInStatus: 3,
    ultimaActivitate: "1 Mar 2026, 10:00",
    slaZileRamase: 1,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "26 Feb 2026, 10:00", action: "Cerere depusa", actor: "Elena Munteanu" },
      { timestamp: "1 Mar 2026, 10:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c13",
    numar: "#1841",
    titlu: "Autorizatie construire garaj",
    cetatean: "Radu Stanescu",
    tip: "Constructii",
    departament: "Constructii",
    dataDepunere: "25 Feb 2026",
    dataLimita: "11 Mar 2026",
    status: "procesare",
    prioritate: "medie",
    functionar: "Ion Petrescu",
    descriere: "Construire garaj adiacent casei existente.",
    zileInStatus: 4,
    ultimaActivitate: "28 Feb 2026, 16:00",
    slaZileRamase: 7,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "25 Feb 2026, 09:00", action: "Cerere depusa", actor: "Radu Stanescu" },
      { timestamp: "28 Feb 2026, 16:00", action: "Procesare in curs", actor: "Ion Petrescu" },
    ],
  },
  {
    id: "c14",
    numar: "#1840",
    titlu: "Aviz defrisare arbori",
    cetatean: "Comuna Veche SRL",
    tip: "Mediu",
    departament: "Mediu",
    dataDepunere: "24 Feb 2026",
    dataLimita: "3 Mar 2026",
    status: "info_supl",
    prioritate: "ridicata",
    functionar: "Maria Ionescu",
    descriere: "Solicitare defrisare 15 arbori. Necesita aviz suplimentar Directia Silvica.",
    zileInStatus: 8,
    ultimaActivitate: "24 Feb 2026, 15:00",
    slaZileRamase: -1,
    blocata: true,
    motivBlocare: "SLA DEPASIT — asteptare raspuns institutie externa",
    noteAdmin: [
      "24 Feb: Solicitat aviz Directia Silvica",
      "1 Mar: Fara raspuns, retrimis solicitare",
    ],
    escaladata: true,
    auditTrail: [
      { timestamp: "24 Feb 2026, 09:00", action: "Cerere depusa", actor: "Comuna Veche SRL" },
      {
        timestamp: "24 Feb 2026, 15:00",
        action: "Info suplimentare solicitate",
        actor: "Maria Ionescu",
      },
    ],
  },
  {
    id: "c15",
    numar: "#1839",
    titlu: "Racord gaze naturale",
    cetatean: "Ion Dumitrache",
    tip: "Utilitati",
    departament: "Utilitati",
    dataDepunere: "23 Feb 2026",
    dataLimita: "9 Mar 2026",
    status: "verificare",
    prioritate: "medie",
    functionar: "George Radu",
    descriere: "Racordare la reteaua de gaze naturale.",
    zileInStatus: 3,
    ultimaActivitate: "1 Mar 2026, 10:00",
    slaZileRamase: 5,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "23 Feb 2026, 10:00", action: "Cerere depusa", actor: "Ion Dumitrache" },
      { timestamp: "1 Mar 2026, 10:00", action: "Verificare in curs", actor: "George Radu" },
    ],
  },
  {
    id: "c16",
    numar: "#1838",
    titlu: "Certificat fiscal mostenire",
    cetatean: "Petru Vasiliu",
    tip: "Fiscal",
    departament: "Fiscal",
    dataDepunere: "22 Feb 2026",
    dataLimita: "1 Mar 2026",
    status: "aprobata",
    prioritate: "scazuta",
    functionar: "Ana Moldovan",
    descriere: "Certificat fiscal pentru procedura de mostenire.",
    zileInStatus: 5,
    ultimaActivitate: "27 Feb 2026, 14:00",
    slaZileRamase: 0,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "22 Feb 2026, 09:00", action: "Cerere depusa", actor: "Petru Vasiliu" },
      { timestamp: "27 Feb 2026, 14:00", action: "Aprobata", actor: "Ana Moldovan" },
    ],
  },
  {
    id: "c17",
    numar: "#1837",
    titlu: "Autorizatie construire mansarda",
    cetatean: "Diana Ene",
    tip: "Constructii",
    departament: "Constructii",
    dataDepunere: "21 Feb 2026",
    dataLimita: "7 Mar 2026",
    status: "procesare",
    prioritate: "ridicata",
    functionar: "Elena Dragomir",
    descriere: "Supraetajare cu mansarda locuinta existenta.",
    zileInStatus: 6,
    ultimaActivitate: "26 Feb 2026, 14:00",
    slaZileRamase: 3,
    blocata: false,
    noteAdmin: [],
    escaladata: false,
    auditTrail: [
      { timestamp: "21 Feb 2026, 09:00", action: "Cerere depusa", actor: "Diana Ene" },
      { timestamp: "26 Feb 2026, 14:00", action: "Procesare in curs", actor: "Elena Dragomir" },
    ],
  },
  {
    id: "c18",
    numar: "#1836",
    titlu: "Aviz iluminat public",
    cetatean: "Asociatia de Proprietari 12",
    tip: "Infrastructura",
    departament: "Infrastructura",
    dataDepunere: "20 Feb 2026",
    dataLimita: "6 Mar 2026",
    status: "info_supl",
    prioritate: "medie",
    functionar: "George Radu",
    descriere: "Extindere iluminat public pe aleea Parcului. Asteptare buget alocat.",
    zileInStatus: 7,
    ultimaActivitate: "25 Feb 2026, 09:00",
    slaZileRamase: 2,
    blocata: true,
    motivBlocare: "Blocat — asteptare aprobare buget de la Primar",
    noteAdmin: ["Necesita aprobare buget inainte de a continua"],
    escaladata: true,
    auditTrail: [
      {
        timestamp: "20 Feb 2026, 09:00",
        action: "Cerere depusa",
        actor: "Asociatia de Proprietari 12",
      },
      {
        timestamp: "25 Feb 2026, 09:00",
        action: "Info suplimentare — buget necesar",
        actor: "George Radu",
      },
    ],
  },
];

export const trendData = [
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

// ─── Shared Tooltip ───────────────────────────────────

export const ChartTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(20,20,36,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            {p.dataKey === "depuse"
              ? "Depuse"
              : p.dataKey === "rezolvate"
                ? "Rezolvate"
                : p.dataKey === "cereri"
                  ? "Total"
                  : "Active"}
            :
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stats helper ─────────────────────────────────────

export interface CereriStats {
  total: number;
  active: number;
  aprobate: number;
  respinse: number;
  blocate: number;
  nealocate: number;
  slaBreach: number;
  slaWarning: number;
  rataAprobare: number;
  slaCompliance: number;
  byStatus: Record<string, number>;
  byDept: Record<string, number>;
  byFunctionar: Record<string, number>;
}

export function computeStats(cereri: Cerere[]): CereriStats {
  const total = cereri.length;
  const active = cereri.filter((c) => !["aprobata", "respinsa"].includes(c.status)).length;
  const aprobate = cereri.filter((c) => c.status === "aprobata").length;
  const respinse = cereri.filter((c) => c.status === "respinsa").length;
  const blocate = cereri.filter(
    (c) => c.blocata && !["aprobata", "respinsa"].includes(c.status)
  ).length;
  const nealocate = cereri.filter(
    (c) => c.functionar === "-" && !["aprobata", "respinsa"].includes(c.status)
  ).length;
  const slaBreach = cereri.filter(
    (c) => c.slaZileRamase <= 0 && !["aprobata", "respinsa"].includes(c.status)
  ).length;
  const slaWarning = cereri.filter(
    (c) =>
      c.slaZileRamase > 0 && c.slaZileRamase <= 3 && !["aprobata", "respinsa"].includes(c.status)
  ).length;
  const rataAprobare = total > 0 ? Math.round((aprobate / (aprobate + respinse || 1)) * 100) : 0;
  const slaCompliance = total > 0 ? Math.round(((total - slaBreach) / total) * 100) : 100;
  const byStatus: Record<string, number> = {};
  const byDept: Record<string, number> = {};
  const byFunctionar: Record<string, number> = {};
  cereri.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byDept[c.departament] = (byDept[c.departament] || 0) + 1;
    if (c.functionar !== "-") byFunctionar[c.functionar] = (byFunctionar[c.functionar] || 0) + 1;
  });
  return {
    total,
    active,
    aprobate,
    respinse,
    blocate,
    nealocate,
    slaBreach,
    slaWarning,
    rataAprobare,
    slaCompliance,
    byStatus,
    byDept,
    byFunctionar,
  };
}

export function computeAlerts(cereri: Cerere[]): Cerere[] {
  return cereri
    .filter(
      (c) =>
        (c.blocata ||
          c.slaZileRamase <= 2 ||
          (c.zileInStatus >= 5 && !["aprobata", "respinsa"].includes(c.status)) ||
          (c.functionar === "-" && c.zileInStatus >= 1)) &&
        !["aprobata", "respinsa"].includes(c.status)
    )
    .sort((a, b) => a.slaZileRamase - b.slaZileRamase);
}
