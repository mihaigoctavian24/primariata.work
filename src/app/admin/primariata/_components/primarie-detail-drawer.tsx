"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  X,
  MapPin,
  Wifi,
  Star,
  Clock,
  Zap,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Edit3,
  PowerOff,
  Power,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Primarie, statusConfig, tierConfig } from "./primarii-shared";
import { suspendPrimarie, activatePrimarie, startImpersonation } from "@/actions/super-admin-write";
import { getPrimarieDetail } from "@/actions/super-admin-stats";
import type { PrimarieDetail } from "@/actions/super-admin-stats";

interface PrimarieDetailDrawerProps {
  selectedPrimarie: Primarie | null;
  onClose: () => void;
}

const months = ["Oct", "Nov", "Dec", "Ian", "Feb", "Mar"];

export function PrimarieDetailDrawer({ selectedPrimarie, onClose }: PrimarieDetailDrawerProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [detail, setDetail] = useState<PrimarieDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selectedPrimarie) {
      setDetail(null);
      return;
    }
    setIsLoadingDetail(true);
    getPrimarieDetail(selectedPrimarie.id)
      .then((result) => {
        if (result.success && result.data) setDetail(result.data);
      })
      .finally(() => setIsLoadingDetail(false));
  }, [selectedPrimarie?.id]);

  async function handleImpersonate(): Promise<void> {
    if (!selectedPrimarie) return;
    setIsImpersonating(true);
    try {
      const result = await startImpersonation(selectedPrimarie.id);
      if (result.success && result.redirectUrl) {
        onClose();
        router.push(result.redirectUrl);
      } else {
        toast.error(result.error ?? "A apărut o eroare");
      }
    } finally {
      setIsImpersonating(false);
    }
  }

  async function handleSuspend() {
    if (!selectedPrimarie) return;
    setIsPending(true);
    try {
      const result = await suspendPrimarie(selectedPrimarie.id);
      if (result.success) {
        toast.success("Primărie suspendată cu succes");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error ?? "A apărut o eroare");
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleActivate() {
    if (!selectedPrimarie) return;
    setIsPending(true);
    try {
      const result = await activatePrimarie(selectedPrimarie.id);
      if (result.success) {
        toast.success("Primărie activată cu succes");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error ?? "A apărut o eroare");
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AnimatePresence>
      {selectedPrimarie && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-[460px] overflow-y-auto"
            style={{
              background: "var(--popover)",
              borderLeft: "1px solid var(--border-subtle)",
            }}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-foreground" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Detalii Primărie
                </h3>
                <button
                  onClick={onClose}
                  className="bg-muted hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Primărie Header Card */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))",
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-foreground truncate"
                      style={{ fontSize: "0.95rem", fontWeight: 600 }}
                    >
                      {selectedPrimarie.name}
                    </div>
                    <div
                      className="text-muted-foreground flex items-center gap-1 truncate"
                      style={{ fontSize: "0.72rem" }}
                    >
                      <MapPin className="h-3 w-3 shrink-0" /> {selectedPrimarie.localitate}, Jud.{" "}
                      {selectedPrimarie.judet}
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1"
                    style={{
                      background: tierConfig[selectedPrimarie.tier].bg,
                      color: tierConfig[selectedPrimarie.tier].color,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      border: `1px solid ${tierConfig[selectedPrimarie.tier].border}`,
                    }}
                  >
                    {selectedPrimarie.tier}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className="rounded-lg px-2 py-2 text-center"
                    style={{ background: "var(--background)" }}
                  >
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: statusConfig[selectedPrimarie.status].color,
                        fontWeight: 600,
                      }}
                    >
                      {statusConfig[selectedPrimarie.status].label}
                    </div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontSize: "0.58rem" }}>
                      Status
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-2 py-2 text-center"
                    style={{ background: "var(--background)" }}
                  >
                    <div
                      className="text-foreground"
                      style={{ fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      {selectedPrimarie.createdAt}
                    </div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontSize: "0.58rem" }}>
                      Creat la
                    </div>
                  </div>
                  <div
                    className="rounded-lg px-2 py-2 text-center"
                    style={{ background: "var(--background)" }}
                  >
                    <div
                      className="text-foreground truncate"
                      style={{ fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      {selectedPrimarie.lastActivity}
                    </div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontSize: "0.58rem" }}>
                      Ultima activ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Health & Performance */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-muted-foreground mb-3"
                  style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  Health & Performance
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Uptime",
                      value:
                        selectedPrimarie.status === "active"
                          ? `${selectedPrimarie.uptime}%`
                          : "Offline",
                      icon: Wifi,
                      color:
                        selectedPrimarie.uptime >= 99.9
                          ? "#10b981"
                          : selectedPrimarie.uptime >= 99.5
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                    {
                      label: "Satisfacție",
                      value:
                        selectedPrimarie.status === "active"
                          ? `${selectedPrimarie.satisfactionScore}★`
                          : "N/A",
                      icon: Star,
                      color:
                        selectedPrimarie.satisfactionScore >= 4.5
                          ? "#10b981"
                          : selectedPrimarie.satisfactionScore >= 3.5
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                    {
                      label: "Timp Răspuns Mediu",
                      value: selectedPrimarie.avgResponseTime,
                      icon: Clock,
                      color: "#06b6d4",
                    },
                    {
                      label: "Features Active",
                      value: `${selectedPrimarie.features.length}`,
                      icon: Zap,
                      color: "#8b5cf6",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                        style={{ background: "var(--background)" }}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
                        <div>
                          <div
                            className="text-muted-foreground truncate"
                            style={{ fontSize: "0.62rem" }}
                          >
                            {stat.label}
                          </div>
                          <div
                            className="text-foreground"
                            style={{ fontSize: "0.85rem", fontWeight: 600 }}
                          >
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cereri Trend Sparkline Large */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-muted-foreground mb-3"
                  style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  Cereri — Trend 6 luni
                </div>
                <div className="flex items-end gap-3">
                  {selectedPrimarie.cereriTrend.map((val, idx) => {
                    const maxVal = Math.max(...selectedPrimarie.cereriTrend, 1);
                    const h = Math.max(4, (val / maxVal) * 80);
                    return (
                      <div key={months[idx]} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-muted-foreground" style={{ fontSize: "0.6rem" }}>
                          {val}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: h }}
                          transition={{ duration: 0.6, delay: idx * 0.08 }}
                          className="w-full rounded-t"
                          style={{
                            background:
                              idx === selectedPrimarie.cereriTrend.length - 1
                                ? "linear-gradient(180deg, #10b981, #06b6d4)"
                                : "rgba(16,185,129,0.25)",
                            minHeight: 4,
                          }}
                        />
                        <span className="text-muted-foreground" style={{ fontSize: "0.58rem" }}>
                          {months[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-muted-foreground mb-3"
                  style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  Statistici
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Utilizatori",
                      value: isLoadingDetail ? (
                        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                      ) : (
                        (detail?.usersCount ?? selectedPrimarie.usersCount)
                      ),
                      icon: Users,
                      color: "#06b6d4",
                    },
                    {
                      label: "Cereri/Lună",
                      value: selectedPrimarie.cereriMonth,
                      icon: FileText,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Cereri Total",
                      value: selectedPrimarie.cereriTotal,
                      icon: TrendingUp,
                      color: "#10b981",
                    },
                    {
                      label: "Revenue/lună",
                      value: `${selectedPrimarie.revenue > 0 ? selectedPrimarie.revenue : "—"}${selectedPrimarie.revenue > 0 ? " RON" : ""}`,
                      icon: DollarSign,
                      color: "#f59e0b",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{ background: "var(--background)" }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: stat.color }} />
                        <div>
                          <div className="text-muted-foreground" style={{ fontSize: "0.62rem" }}>
                            {stat.label}
                          </div>
                          <div
                            className="text-foreground"
                            style={{ fontSize: "0.82rem", fontWeight: 600 }}
                          >
                            {typeof stat.value === "number"
                              ? stat.value.toLocaleString()
                              : stat.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-muted-foreground mb-2"
                  style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  Admin Primărie
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {(detail?.adminName ?? selectedPrimarie.adminName)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    {isLoadingDetail ? (
                      <div className="space-y-1.5">
                        <div className="bg-muted h-3.5 w-28 animate-pulse rounded" />
                        <div className="bg-muted h-3 w-36 animate-pulse rounded" />
                      </div>
                    ) : (
                      <>
                        <div className="text-foreground truncate" style={{ fontSize: "0.82rem" }}>
                          {detail?.adminName ?? selectedPrimarie.adminName}
                        </div>
                        <div
                          className="text-muted-foreground truncate"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {detail?.adminEmail ?? selectedPrimarie.adminEmail}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cereri pe Status */}
              {detail?.cereriByStatus && detail.cereriByStatus.length > 0 && (
                <div
                  className="mb-4 rounded-xl p-4"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="text-muted-foreground mb-3"
                    style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                  >
                    Cereri pe Status
                  </div>
                  <div className="space-y-2">
                    {detail.cereriByStatus.map(({ status, count }) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
                          {status}
                        </span>
                        <span
                          className="text-foreground font-medium"
                          style={{ fontSize: "0.82rem" }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "var(--muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-muted-foreground mb-3"
                  style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  Feature Flags Active
                </div>
                {selectedPrimarie.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPrimarie.features.map((f) => (
                      <span
                        key={f}
                        className="rounded-lg px-2.5 py-1 text-emerald-400"
                        style={{
                          background: "rgba(16,185,129,0.08)",
                          border: "1px solid rgba(16,185,129,0.12)",
                          fontSize: "0.72rem",
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground" style={{ fontSize: "0.78rem" }}>
                    Niciun feature activat
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleImpersonate}
                  disabled={isImpersonating}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  {isImpersonating ? "Se procesează..." : "Impersonează Primărie"}
                </button>
                <button
                  onClick={() => toast(`Editare ${selectedPrimarie.name}`)}
                  className="text-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-all"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                  }}
                >
                  <Edit3 className="h-4 w-4" /> Editare Setări
                </button>
                {selectedPrimarie.status === "active" ? (
                  <button
                    onClick={handleSuspend}
                    disabled={isPending}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-red-400 transition-all hover:bg-red-500/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.04)",
                      border: "1px solid rgba(239,68,68,0.08)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <PowerOff className="h-4 w-4" />{" "}
                    {isPending ? "Se procesează..." : "Dezactivare Primărie"}
                  </button>
                ) : (
                  <button
                    onClick={handleActivate}
                    disabled={isPending}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-emerald-400 transition-all hover:bg-emerald-500/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "rgba(16,185,129,0.04)",
                      border: "1px solid rgba(16,185,129,0.08)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <Power className="h-4 w-4" />{" "}
                    {isPending ? "Se procesează..." : "Activare Primărie"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
