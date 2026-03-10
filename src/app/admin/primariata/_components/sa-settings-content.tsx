"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Settings,
  Shield,
  Zap,
  Globe,
  Server,
  Mail,
  MessageSquare,
  Brain,
  Key,
  Eye,
  EyeOff,
  Save,
  ToggleLeft,
  ToggleRight,
  Clock,
  Upload,
  Gauge,
  RefreshCcw,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────

type SettingsTab = "system" | "integrations" | "features";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  color: string;
}

// ─── Main Component ──────────────────────────────────

export function SaSettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("system");

  // System config
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxUpload, setMaxUpload] = useState("50");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [rateLimit, setRateLimit] = useState("100");

  // Integration keys (mock)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const integrations = [
    {
      id: "certsign",
      name: "certSIGN",
      description: "Semnătură electronică calificată",
      icon: Shield,
      color: "#10b981",
      key: "cs_live_k8f2...x9m4",
      status: "active",
    },
    {
      id: "ghiseul",
      name: "Ghișeul.ro",
      description: "Plăți online la stat",
      icon: Globe,
      color: "#3b82f6",
      key: "gh_prod_p3r7...w2n5",
      status: "active",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Serviciu trimitere email",
      icon: Mail,
      color: "#06b6d4",
      key: "SG.f8k2...m4p9",
      status: "active",
    },
    {
      id: "twilio",
      name: "Twilio",
      description: "SMS & notificări telefonice",
      icon: MessageSquare,
      color: "#8b5cf6",
      key: "AC_tw_n2k5...r8q1",
      status: "inactive",
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "AI Analysis — GPT-4o-mini",
      icon: Brain,
      color: "#f59e0b",
      key: "sk-proj-x7m2...k4n8",
      status: "active",
    },
  ];

  // Feature flags
  const [features, setFeatures] = useState<FeatureFlag[]>([
    {
      id: "survey",
      name: "Survey Platform",
      description: "Platformă sondaje cetățeni & funcționari",
      enabled: true,
      icon: MessageSquare,
      color: "#3b82f6",
    },
    {
      id: "ai",
      name: "AI Analysis",
      description: "Analiză inteligentă cereri cu GPT-4o-mini",
      enabled: true,
      icon: Brain,
      color: "#f59e0b",
    },
    {
      id: "gamification",
      name: "Gamification",
      description: "Sistem puncte, badge-uri & leaderboard funcționari",
      enabled: true,
      icon: Zap,
      color: "#ec4899",
    },
    {
      id: "mobile",
      name: "Mobile App API",
      description: "REST API pentru aplicația mobilă cetățeni",
      enabled: false,
      icon: Globe,
      color: "#06b6d4",
    },
    {
      id: "analytics",
      name: "Advanced Analytics",
      description: "Dashboard-uri avansate cu drill-down & export",
      enabled: true,
      icon: Gauge,
      color: "#8b5cf6",
    },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
    const feat = features.find((f) => f.id === id);
    toast.success(`${feat?.name} — ${!feat?.enabled ? "activat" : "dezactivat"} global`);
  };

  const tabs = [
    { id: "system" as SettingsTab, label: "Configurare Sistem", icon: Server },
    { id: "integrations" as SettingsTab, label: "Integrări API", icon: Key },
    { id: "features" as SettingsTab, label: "Feature Flags", icon: Zap },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-foreground flex items-center gap-2"
          style={{ fontSize: "1.6rem", fontWeight: 700 }}
        >
          <Settings className="text-muted-foreground h-6 w-6" /> Setări Platformă
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-muted-foreground mt-1"
          style={{ fontSize: "0.83rem" }}
        >
          Configurare sistem, credențiale integrări & feature flags globale
        </motion.p>
      </div>

      {/* Tabs */}
      <div
        className="mb-6 flex w-fit gap-1 rounded-xl p-1"
        style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 transition-all ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {isActive && (
                <motion.div
                  layoutId="settingsTab"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.06))",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 h-3.5 w-3.5 ${isActive ? "text-emerald-400" : ""}`} />
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* SYSTEM TAB */}
      {activeTab === "system" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-5"
        >
          {/* Maintenance Mode */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--muted)",
              border: `1px solid ${maintenanceMode ? "rgba(239,68,68,0.15)" : "var(--border-subtle)"}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: maintenanceMode ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.08)",
                  }}
                >
                  <Server
                    className="h-5 w-5"
                    style={{ color: maintenanceMode ? "#ef4444" : "#10b981" }}
                  />
                </div>
                <div>
                  <div className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    Maintenance Mode
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                    Dezactivează accesul public la platformă
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  toast(
                    maintenanceMode ? "Maintenance mode dezactivat" : "Maintenance mode activat"
                  );
                }}
                className="cursor-pointer"
              >
                {maintenanceMode ? (
                  <ToggleRight className="h-10 w-10 text-red-400" />
                ) : (
                  <ToggleLeft className="text-muted-foreground h-10 w-10" />
                )}
              </button>
            </div>
            {maintenanceMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 rounded-lg px-3 py-2 text-red-400"
                style={{ background: "rgba(239,68,68,0.06)", fontSize: "0.75rem" }}
              >
                Platforma este în modul mentenanță — utilizatorii nu au acces.
              </motion.div>
            )}
          </div>

          {/* Config Fields */}
          {[
            {
              id: "maxUpload",
              label: "Dimensiune maximă upload",
              value: maxUpload,
              setValue: setMaxUpload,
              unit: "MB",
              icon: Upload,
              description: "Limita de dimensiune per fișier încărcat",
            },
            {
              id: "sessionTimeout",
              label: "Session Timeout",
              value: sessionTimeout,
              setValue: setSessionTimeout,
              unit: "minute",
              icon: Clock,
              description: "Durata de inactivitate până la delogare",
            },
            {
              id: "rateLimit",
              label: "Rate Limiting",
              value: rateLimit,
              setValue: setRateLimit,
              unit: "req/min/IP",
              icon: Gauge,
              description: "Numărul maxim de cereri API per minut per IP",
            },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.id}
                className="rounded-2xl p-5"
                style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="text-muted-foreground h-4 w-4" />
                  <div>
                    <div
                      className="text-foreground"
                      style={{ fontSize: "0.9rem", fontWeight: 600 }}
                    >
                      {field.label}
                    </div>
                    <div className="text-muted-foreground" style={{ fontSize: "0.68rem" }}>
                      {field.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                    className="text-foreground w-32 rounded-xl px-3 py-2 outline-none"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.85rem",
                    }}
                  />
                  <span className="text-muted-foreground" style={{ fontSize: "0.78rem" }}>
                    {field.unit}
                  </span>
                </div>
              </div>
            );
          })}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success("Setări salvate cu succes")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-white"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            <Save className="h-4 w-4" /> Salvează Configurarea
          </motion.button>
        </motion.div>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === "integrations" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-4"
        >
          {integrations.map((intg, i) => {
            const Icon = intg.icon;
            const isVisible = showKeys[intg.id];
            return (
              <motion.div
                key={intg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-5"
                style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${intg.color}15`, border: `1px solid ${intg.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: intg.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-foreground"
                        style={{ fontSize: "0.9rem", fontWeight: 600 }}
                      >
                        {intg.name}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          background:
                            intg.status === "active"
                              ? "rgba(16,185,129,0.08)"
                              : "rgba(107,114,128,0.08)",
                          color: intg.status === "active" ? "#10b981" : "#6b7280",
                          border: `1px solid ${intg.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)"}`,
                        }}
                      >
                        {intg.status === "active" ? "Activ" : "Inactiv"}
                      </span>
                    </div>
                    <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                      {intg.description}
                    </div>
                  </div>
                  <button
                    onClick={() => toast(`Testare conexiune ${intg.name}...`)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-3 py-1.5 transition-all"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.72rem",
                    }}
                  >
                    <RefreshCcw className="mr-1 inline h-3 w-3" /> Test
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <Key className="text-muted-foreground h-3.5 w-3.5" />
                    <span
                      className="text-foreground flex-1 font-mono"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {isVisible ? intg.key.replace("...", "abcdef1234567890") : intg.key}
                    </span>
                    <button
                      onClick={() =>
                        setShowKeys((prev) => ({ ...prev, [intg.id]: !prev[intg.id] }))
                      }
                      className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      {isVisible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => toast(`Editare cheie ${intg.name}`)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-3 py-2 transition-all"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.78rem",
                    }}
                  >
                    Editare
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* FEATURES TAB */}
      {activeTab === "features" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-4"
        >
          <div
            className="mb-2 rounded-xl px-4 py-3"
            style={{
              background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.1)",
            }}
          >
            <div className="text-emerald-400" style={{ fontSize: "0.78rem" }}>
              Feature flags-urile controlează disponibilitatea funcționalităților la nivel global.
              Dezactivarea unui flag afectează toate primăriile.
            </div>
          </div>
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl p-5"
                style={{
                  background: "var(--muted)",
                  border: `1px solid ${feat.enabled ? "var(--border-subtle)" : "var(--border-subtle)"}`,
                  opacity: feat.enabled ? 1 : 0.6,
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: feat.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-foreground" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {feat.name}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
                    {feat.description}
                  </div>
                </div>
                <button onClick={() => toggleFeature(feat.id)} className="cursor-pointer">
                  {feat.enabled ? (
                    <ToggleRight className="h-10 w-10 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="text-muted-foreground h-10 w-10" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
