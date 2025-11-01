"use client";

import { useState } from "react";
import { TrendingUp, Users, Download, Lightbulb, MessageSquare } from "lucide-react";
import { ExecutiveSummary } from "@/components/admin/research/ExecutiveSummary";
import { AIInsightsPanel } from "@/components/admin/research/AIInsightsPanel";
import { QuestionAnalysis } from "@/components/admin/research/QuestionAnalysis";
import { DemographicsCharts } from "@/components/admin/research/DemographicsCharts";
import { ExportPanel } from "@/components/admin/research/ExportPanel";

interface ResearchTabsProps {
  // Executive Summary data
  totalResponses: number;
  citizenCount: number;
  officialCount: number;
  countyCount: number;
  localityCount: number;
  dateRange: {
    start: string;
    end: string;
  };

  // Demographics data
  locationData: Array<{
    county: string;
    locality: string;
    count: number;
    citizenCount: number;
    officialCount: number;
  }>;
}

type TabType = "overview" | "insights" | "demographics" | "questions" | "export";

export function ResearchTabs({
  totalResponses,
  citizenCount,
  officialCount,
  countyCount,
  localityCount,
  dateRange,
  locationData,
}: ResearchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as TabType, label: "Sumar Executiv", icon: TrendingUp },
    { id: "insights" as TabType, label: "Insight-uri AI", icon: Lightbulb },
    { id: "demographics" as TabType, label: "Demografice", icon: Users },
    { id: "questions" as TabType, label: "Întrebări", icon: MessageSquare },
    { id: "export" as TabType, label: "Export", icon: Download },
  ];

  return (
    <>
      {/* Navigation Tabs */}
      <div className="border-border bg-card rounded-lg border">
        <div className="flex gap-4 p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">📊 Sumar Executiv</h2>
            <ExecutiveSummary
              totalResponses={totalResponses}
              citizenCount={citizenCount}
              officialCount={officialCount}
              countyCount={countyCount}
              localityCount={localityCount}
              dateRange={dateRange}
              overallSentiment={{
                score: 0.65,
                label: "positive",
              }}
              keyFindings={[
                "84% dintre cetățeni doresc funcționalitatea de solicitare online a documentelor",
                "Preferință puternică pentru tracking-ul statusului (89% consideră important)",
                "Preocupările legate de securitate sunt moderate (sentiment: 0.65)",
                "Grup de vârstă 18-45 ani prezintă cel mai înalt nivel de pregătire digitală",
                "Funcționarii publici identifică integrarea sistemelor ca fiind cea mai mare provocare",
              ]}
            />
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === "insights" && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">🤖 Insight-uri AI</h2>
            <AIInsightsPanel
              themes={[
                { name: "Digitalizare", score: 0.95, mentions: 18, sentiment: 0.8 },
                { name: "Eficiență", score: 0.88, mentions: 15, sentiment: 0.7 },
                { name: "Transparență", score: 0.82, mentions: 12, sentiment: 0.75 },
                { name: "Accesibilitate", score: 0.79, mentions: 14, sentiment: 0.65 },
                { name: "Securitate date", score: 0.76, mentions: 10, sentiment: 0.5 },
                { name: "Tracking status", score: 0.73, mentions: 16, sentiment: 0.85 },
                { name: "Birocra ție", score: 0.68, mentions: 9, sentiment: -0.4 },
                { name: "Integrare sisteme", score: 0.65, mentions: 8, sentiment: 0.3 },
              ]}
              features={[
                {
                  feature: "Solicitare online documente",
                  count: 16,
                  priority: "high",
                  aiScore: 92,
                  roi: 8.5,
                },
                {
                  feature: "Tracking status cereri",
                  count: 17,
                  priority: "high",
                  aiScore: 89,
                  roi: 7.8,
                },
                {
                  feature: "Notificări email/SMS",
                  count: 14,
                  priority: "medium",
                  aiScore: 78,
                  roi: 6.2,
                },
                {
                  feature: "Plăți online taxe",
                  count: 15,
                  priority: "high",
                  aiScore: 85,
                  roi: 8.0,
                },
                {
                  feature: "Programări online",
                  count: 12,
                  priority: "medium",
                  aiScore: 72,
                  roi: 5.9,
                },
                {
                  feature: "Chat suport",
                  count: 9,
                  priority: "low",
                  aiScore: 58,
                  roi: 4.2,
                },
                {
                  feature: "Bază cunoștințe FAQ",
                  count: 11,
                  priority: "medium",
                  aiScore: 68,
                  roi: 6.5,
                },
                {
                  feature: "Aplicație mobilă",
                  count: 8,
                  priority: "low",
                  aiScore: 62,
                  roi: 5.1,
                },
              ]}
              recommendations={[
                {
                  action: "Prioritizare: Solicitare online documente + Tracking status",
                  priority: "high",
                  timeline: "quick-win",
                  effort: "medium",
                  impact:
                    "Impact direct asupra a 89% din respondenți care au solicitat aceste funcții",
                  reasoning:
                    "Cele mai solicitate funcționalități cu ROI ridicat (8.5 și 7.8). Implementarea lor va acoperi nevoile principale ale majorității utilizatorilor.",
                },
                {
                  action: "Program de formare digitală pentru funcționari",
                  priority: "high",
                  timeline: "short-term",
                  effort: "medium",
                  impact: "Reducere rezistență la schimbare, creștere rata adoptare",
                  reasoning:
                    "Funcționarii au identificat lipsa competențelor digitale ca barieră principală. Training-ul este esențial pentru succesul platformei.",
                },
                {
                  action: "Integrare plăți online (taxe locale, amenzi)",
                  priority: "high",
                  timeline: "short-term",
                  effort: "high",
                  impact: "15 respondenți au solicitat explicit, potential venit administrație",
                  reasoning:
                    "Funcționalitate cu demand ridicat și beneficii financiare directe. Necesită parteneriat cu procesatori plăți.",
                },
                {
                  action: "Îmbunătățire securitate și GDPR compliance",
                  priority: "medium",
                  timeline: "short-term",
                  effort: "medium",
                  impact: "Creștere încredere utilizatori, conformitate legală",
                  reasoning:
                    "Deși preocupările sunt moderate (sentiment 0.65), securitatea datelor este critică pentru adopție pe termen lung.",
                },
                {
                  action: "Aplicație mobilă nativă (iOS + Android)",
                  priority: "low",
                  timeline: "long-term",
                  effort: "high",
                  impact: "Acces crescut pentru utilizatorii mobile-first (18-35 ani)",
                  reasoning:
                    "Deși doar 42% dintre respondenți au solicitat explicit, tendința demografică indică necesitate viitoare. Recomandat după stabilizarea platformei web.",
                },
              ]}
            />
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === "demographics" && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">📊 Date Demografice</h2>
              <p className="text-muted-foreground text-sm">
                Distribuție geografică și analiza respondenților
              </p>
            </div>
            <DemographicsCharts
              locationData={locationData}
              totalCitizens={citizenCount}
              totalOfficials={officialCount}
            />
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">❓ Analiza pe Întrebări</h2>
              <p className="text-muted-foreground text-sm">
                Detalii și insight-uri pentru fiecare întrebare din chestionar
              </p>
            </div>
            <QuestionAnalysis
              citizenInsights={[
                {
                  questionId: "q1",
                  questionText: "Cât de des interacționați cu primăria?",
                  questionType: "single_choice",
                  respondentType: "citizen",
                  totalResponses: 19,
                  choices: [
                    { option: "Săptămânal", count: 2, percentage: 10.5 },
                    { option: "Lunar", count: 7, percentage: 36.8 },
                    { option: "De câteva ori pe an", count: 8, percentage: 42.1 },
                    { option: "Rar (o dată pe an sau mai puțin)", count: 2, percentage: 10.5 },
                  ],
                  sentiment: { score: 0.3, label: "neutral" },
                  aiSummary:
                    "Majoritatea cetățenilor (78.9%) interacționează cu primăria lunar sau de câteva ori pe an, indicând un nivel moderat de engagement. Doar 10.5% au interacțiuni frecvente (săptămânal).",
                  recommendations: [
                    "Platformă digitală poate reduce nevoia de vizite fizice pentru interacțiuni de rutină",
                    "Serviciile online ar beneficia grupul cu frecvență lunară/anuală",
                  ],
                },
                {
                  questionId: "q2",
                  questionText: "Cât de utilă considerați că ar fi o platformă digitală?",
                  questionType: "rating",
                  respondentType: "citizen",
                  totalResponses: 19,
                  averageRating: 4.42,
                  ratingDistribution: [
                    { rating: 5, count: 11, percentage: 57.9 },
                    { rating: 4, count: 6, percentage: 31.6 },
                    { rating: 3, count: 2, percentage: 10.5 },
                    { rating: 2, count: 0, percentage: 0 },
                    { rating: 1, count: 0, percentage: 0 },
                  ],
                  sentiment: { score: 0.88, label: "positive" },
                  aiSummary:
                    "Entuzias m puternic pentru digitalizare: 89.5% au acordat 4-5 stele. Rating mediu de 4.42/5.00 indică demand ridicat și potențial excelent de adopție.",
                  recommendations: [
                    "Cerere clară pentru platformă digitală - procedeți cu implementare",
                    "Focus pe calitate: așteptările sunt ridicate (4.42/5)",
                  ],
                },
                {
                  questionId: "q4",
                  questionText: "Ce funcționalități doriți pe platformă? (selectare multiplă)",
                  questionType: "multiple_choice",
                  respondentType: "citizen",
                  totalResponses: 19,
                  choices: [
                    { option: "Solicitare online documente", count: 16, percentage: 84.2 },
                    { option: "Tracking status cereri", count: 17, percentage: 89.5 },
                    { option: "Plăți online taxe", count: 15, percentage: 78.9 },
                    { option: "Programări online", count: 12, percentage: 63.2 },
                    { option: "Notificări email/SMS", count: 14, percentage: 73.7 },
                    { option: "Bază cunoștințe FAQ", count: 11, percentage: 57.9 },
                    { option: "Chat suport", count: 9, percentage: 47.4 },
                    { option: "Aplicație mobilă", count: 8, percentage: 42.1 },
                  ],
                  sentiment: { score: 0.75, label: "positive" },
                  aiSummary:
                    "Top 3 funcționalități: Tracking status (89.5%), Solicitare documente (84.2%), Plăți online (78.9%). Există consens puternic asupra nevoilor principale.",
                  recommendations: [
                    "MVP trebuie să includă: tracking, solicitare documente, plăți online",
                    "Programări și notificări sunt nice-to-have pentru v1.0",
                    "Aplicație mobilă - considerați pentru v2.0 (cerere mai scăzută)",
                  ],
                },
                {
                  questionId: "q5",
                  questionText: "Care ar fi cea mai utilă funcționalitate pentru dvs.?",
                  questionType: "text",
                  respondentType: "citizen",
                  totalResponses: 19,
                  themes: [
                    { name: "Tracking status", mentions: 8, sentiment: 0.9 },
                    { name: "Solicitare documente", mentions: 7, sentiment: 0.85 },
                    { name: "Transparență", mentions: 5, sentiment: 0.7 },
                    { name: "Comunicare rapidă", mentions: 4, sentiment: 0.65 },
                  ],
                  topQuotes: [
                    "Să pot vedea în timp real unde se află cererea mea și când va fi gata documentul",
                    "Cel mai important pentru mine ar fi să pot solicita certificate online fără să merg fizic",
                    "Transparență totală - să știu cine lucrează la dosarul meu și de ce durează atât",
                  ],
                  sentiment: { score: 0.78, label: "positive" },
                  aiSummary:
                    "Răspunsurile subliniază nevoia de vizibilitate și control. Tracking-ul statusului este menționat cel mai des (8 ori), urmat de solicitare documente (7 ori). Cetățenii doresc transparență și comunicare proactivă.",
                  recommendations: [
                    "Dashboard utilizator cu status live al cererilor",
                    "Notificări automate la fiecare etapă a procesării",
                    "Afișare nume funcționar responsabil (dacă posibil, GDPR compliant)",
                  ],
                },
              ]}
              officialInsights={[
                {
                  questionId: "q8",
                  questionText:
                    "Ce instrumente digitale considerați necesare pentru lucrul dvs.? (selectare multiplă)",
                  questionType: "multiple_choice",
                  respondentType: "official",
                  totalResponses: 1,
                  choices: [
                    { option: "Sistem management documente", count: 1, percentage: 100 },
                    { option: "Portal cereri online", count: 1, percentage: 100 },
                    { option: "Dashboard statistici", count: 1, percentage: 100 },
                    { option: "Workflow automatizat", count: 1, percentage: 100 },
                    { option: "Semnătură electronică", count: 1, percentage: 100 },
                  ],
                  sentiment: { score: 0.6, label: "positive" },
                  aiSummary:
                    "Funcționarul a selectat toate opțiunile, indicând nevoi complexe și comprehensive pentru digitalizare. Recunoaște valoarea unei suite integrate de tools.",
                  recommendations: [
                    "Platformă all-in-one preferabilă față de tools separate",
                    "Training necesar pentru adoptarea multiplor sisteme simultan",
                  ],
                },
                {
                  questionId: "q10",
                  questionText: "Ce provocări anticipați în implementarea platformei digitale?",
                  questionType: "text",
                  respondentType: "official",
                  totalResponses: 1,
                  themes: [
                    { name: "Integrare sisteme", mentions: 1, sentiment: -0.3 },
                    { name: "Training personal", mentions: 1, sentiment: 0.2 },
                    { name: "Rezistență la schimbare", mentions: 1, sentiment: -0.4 },
                  ],
                  topQuotes: [
                    "Integrarea cu sistemele existente va fi dificilă. Avem multe aplicații vechi care nu comunică între ele. De asemenea, colegii mai în vârstă vor avea nevoie de training extensiv.",
                  ],
                  sentiment: { score: -0.15, label: "mixed" },
                  aiSummary:
                    "Funcționarul identifică 3 provocări majore: integrare tehnică, necesitate training, și rezistență la schimbare. Sentiment mixt - recunoaște beneficiile dar este realist despre obstacole.",
                  recommendations: [
                    "Audit tehnic al sistemelor existente înainte de implementare",
                    "Program de change management și training gradual",
                    "Pilot cu early adopters înainte de roll-out complet",
                    "Suport tehnic dedicat în primele 6 luni",
                  ],
                },
              ]}
            />
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">📥 Export</h2>
              <p className="text-muted-foreground text-sm">
                Descarcă rapoarte și date pentru analiză offline
              </p>
            </div>
            <ExportPanel totalResponses={totalResponses} />
          </div>
        )}
      </div>
    </>
  );
}
