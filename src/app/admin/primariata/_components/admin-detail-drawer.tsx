"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  X,
  MapPin,
  Shield,
  Calendar,
  LogIn,
  Mail,
  UserCog,
  Edit3,
  ShieldCheck,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { PrimarieAdmin, adminStatusConfig, PerformanceBadge } from "./admins-shared";
import { GlassTooltip } from "./glass-tooltip";
import { suspendAdmin, activateAdmin } from "@/actions/super-admin-write";

interface AdminDetailDrawerProps {
  selectedAdmin: PrimarieAdmin | null;
  onClose: () => void;
}

const months = ["Oct", "Nov", "Dec", "Ian", "Feb", "Mar"];

export function AdminDetailDrawer({ selectedAdmin, onClose }: AdminDetailDrawerProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSuspend() {
    if (!selectedAdmin) return;
    setIsPending(true);
    try {
      const result = await suspendAdmin(selectedAdmin.id);
      if (result.success) {
        toast.success("Admin suspendat cu succes");
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
    if (!selectedAdmin) return;
    setIsPending(true);
    try {
      const result = await activateAdmin(selectedAdmin.id);
      if (result.success) {
        toast.success("Admin activat cu succes");
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
      {selectedAdmin && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full overflow-y-auto"
            style={{
              width: 440,
              background: "rgba(14,14,28,0.95)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/[0.04] text-gray-400 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Profile Header */}
              <div className="mt-4 mb-6 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    background:
                      selectedAdmin.status === "active"
                        ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                        : selectedAdmin.status === "pending"
                          ? "linear-gradient(135deg, #f59e0b, #f97316)"
                          : "linear-gradient(135deg, #6b7280, #4b5563)",
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  {selectedAdmin.avatar}
                </div>
                <div className="min-w-0">
                  <h2
                    className="truncate text-white"
                    style={{ fontSize: "1.15rem", fontWeight: 700 }}
                  >
                    {selectedAdmin.name}
                  </h2>
                  <div className="truncate text-gray-500" style={{ fontSize: "0.75rem" }}>
                    {selectedAdmin.email}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {(() => {
                      const st = adminStatusConfig[selectedAdmin.status];
                      const StIcon = st.icon;
                      return (
                        <span
                          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
                          style={{
                            background: st.bg,
                            fontSize: "0.65rem",
                            color: st.color,
                            border: `1px solid ${st.color}15`,
                          }}
                        >
                          <StIcon className="h-2.5 w-2.5" /> {st.label}
                        </span>
                      );
                    })()}
                    {selectedAdmin.twoFA && (
                      <span
                        className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5"
                        style={{
                          background: "rgba(16,185,129,0.08)",
                          fontSize: "0.6rem",
                          color: "#10b981",
                        }}
                      >
                        <ShieldCheck className="h-2.5 w-2.5" /> 2FA Activ
                      </span>
                    )}
                    <PerformanceBadge score={selectedAdmin.satisfactionScore} />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="mb-3 text-gray-400"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  Informații
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: Building2, label: "Primărie", value: selectedAdmin.primarie },
                    { icon: MapPin, label: "Județ", value: selectedAdmin.judet },
                    { icon: Shield, label: "Rol", value: selectedAdmin.role },
                    { icon: Calendar, label: "Invitat", value: selectedAdmin.invitedAt },
                    { icon: LogIn, label: "Ultimul login", value: selectedAdmin.lastLogin },
                    { icon: Mail, label: "Telefon", value: selectedAdmin.phone },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex flex-wrap items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                        <span
                          className="shrink-0 text-gray-500"
                          style={{ fontSize: "0.72rem", minWidth: 80 }}
                        >
                          {item.label}
                        </span>
                        <span
                          className="min-w-0 truncate text-gray-300"
                          style={{ fontSize: "0.78rem" }}
                        >
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Metrics */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="mb-3 text-gray-400"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  Performanță & Activitate
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Users Gestionați",
                      value: selectedAdmin.usersManaged,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Cereri Supervizate",
                      value: selectedAdmin.cereriSupervised,
                      color: "#06b6d4",
                    },
                    {
                      label: "Acțiuni/Lună",
                      value: selectedAdmin.actionsThisMonth,
                      color: "#10b981",
                    },
                    {
                      label: "Login-uri(30z)",
                      value: selectedAdmin.loginCount30d,
                      color: "#f59e0b",
                    },
                    {
                      label: "Tickete Rez.",
                      value: selectedAdmin.ticketsResolved,
                      color: "#ec4899",
                    },
                    {
                      label: "Timp Răspuns",
                      value: selectedAdmin.avgResponseTime,
                      color: "#06b6d4",
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg p-2 text-center"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div
                        className="text-white"
                        style={{ fontSize: "1rem", fontWeight: 700, color: m.color }}
                      >
                        {m.value}
                      </div>
                      <div className="mt-0.5 text-gray-600" style={{ fontSize: "0.58rem" }}>
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Trend Mini Chart */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="mb-3 text-gray-400"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  Trend Activitate (6 luni)
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart
                    data={selectedAdmin.activityTrend.map((v, i) => ({
                      month: months[i] || "",
                      actions: v,
                    }))}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6b7280", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#4b5563", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<GlassTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    />
                    <Bar
                      dataKey="actions"
                      name="Acțiuni"
                      fill="rgba(16,185,129,0.5)"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Satisfaction Score */}
              <div
                className="mb-4 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-400" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    Scor Satisfacție
                  </span>
                  <span className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {selectedAdmin.satisfactionScore.toFixed(1)}/5.0
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(selectedAdmin.satisfactionScore / 5) * 100}%`,
                      background:
                        selectedAdmin.satisfactionScore >= 4.5
                          ? "linear-gradient(90deg, #10b981, #06b6d4)"
                          : selectedAdmin.satisfactionScore >= 3.5
                            ? "linear-gradient(90deg, #06b6d4, #3b82f6)"
                            : selectedAdmin.satisfactionScore >= 2.5
                              ? "linear-gradient(90deg, #f59e0b, #f97316)"
                              : "linear-gradient(90deg, #ef4444, #dc2626)",
                    }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toast(`Impersonare: ${selectedAdmin.name}`)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-emerald-400 transition-all hover:bg-emerald-500/10"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.1)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <UserCog className="h-4 w-4" /> Impersonare
                </button>
                <button
                  onClick={() => toast(`Editare: ${selectedAdmin.name}`)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-gray-300 transition-all hover:bg-white/[0.06]"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                  }}
                >
                  <Edit3 className="h-4 w-4" /> Editare
                </button>
                {selectedAdmin.status === "active" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleSuspend();
                    }}
                    disabled={isPending}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-red-400 transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.1)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <PowerOff className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleActivate();
                    }}
                    disabled={isPending}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-emerald-400 transition-all hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.1)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    <Power className="h-4 w-4" />
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
