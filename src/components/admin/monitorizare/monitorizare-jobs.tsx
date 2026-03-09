"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { Timer, CheckCircle2, RotateCcw, XCircle, Play, Eye } from "lucide-react";

import { scheduledJobs, jobStatusConfig } from "./monitorizare-data";

// ─── Component ────────────────────────────────────────

export function MonitorizareJobs() {
  return (
    <motion.div
      key="jobs"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* KPIs */}
      <div className="mb-5 grid grid-cols-4 gap-3">
        {[
          { label: "Total Jobs", value: scheduledJobs.length, color: "#3b82f6", icon: Timer },
          {
            label: "Succes",
            value: scheduledJobs.filter((j) => j.status === "success").length,
            color: "#10b981",
            icon: CheckCircle2,
          },
          {
            label: "Rulează",
            value: scheduledJobs.filter((j) => j.status === "running").length,
            color: "#3b82f6",
            icon: RotateCcw,
          },
          {
            label: "Eșuate",
            value: scheduledJobs.filter((j) => j.status === "failed").length,
            color: "#ef4444",
            icon: XCircle,
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: `${m.color}06`, border: `1px solid ${m.color}12` }}
          >
            <m.icon className="h-5 w-5" style={{ color: m.color }} />
            <div>
              <div
                className="text-white"
                style={{ fontSize: "1.3rem", fontWeight: 700, lineHeight: 1 }}
              >
                {m.value}
              </div>
              <div className="text-gray-500" style={{ fontSize: "0.72rem" }}>
                {m.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-blue-400" />
            <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Jobs Programate
            </h3>
          </div>
        </div>
        <div
          className="grid grid-cols-12 gap-2 border-b border-white/[0.04] px-5 py-2.5"
          style={{
            fontSize: "0.65rem",
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <div className="col-span-3">Nume</div>
          <div className="col-span-2">Program</div>
          <div className="col-span-2">Ultima Rulare</div>
          <div className="col-span-2">Următoarea</div>
          <div className="col-span-1">Durată</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Acțiuni</div>
        </div>
        {scheduledJobs.map((job, i) => {
          const jc = jobStatusConfig[job.status];
          const JobIcon = jc.icon;
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i }}
              className="grid grid-cols-12 items-center gap-2 px-5 py-3 transition-all hover:bg-white/[0.015]"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
            >
              <div className="col-span-3 truncate text-white" style={{ fontSize: "0.85rem" }}>
                {job.name}
              </div>
              <div className="col-span-2 text-gray-400" style={{ fontSize: "0.78rem" }}>
                {job.schedule}
              </div>
              <div className="col-span-2 text-gray-500" style={{ fontSize: "0.75rem" }}>
                {job.lastRun}
              </div>
              <div className="col-span-2 text-gray-500" style={{ fontSize: "0.75rem" }}>
                {job.nextRun}
              </div>
              <div className="col-span-1 text-gray-400" style={{ fontSize: "0.78rem" }}>
                {job.duration}
              </div>
              <div className="col-span-1">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5"
                  style={{
                    fontSize: "0.65rem",
                    color: jc.color,
                    background: `${jc.color}12`,
                    fontWeight: 600,
                  }}
                >
                  <JobIcon
                    className={`h-3 w-3 ${job.status === "running" ? "animate-spin" : ""}`}
                  />{" "}
                  {jc.label}
                </span>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <button
                  onClick={() => toast.success(`▶️ Job "${job.name}" — rulare manuală`)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-emerald-400"
                  title="Rulează manual"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => toast(`🔍 Log-uri job: ${job.name}`)}
                  className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/5 hover:text-white"
                  title="Vezi log-uri"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
