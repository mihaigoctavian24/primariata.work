"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface PrimarieStatus {
  name: string;
  status: "active" | "inactive";
  users: number;
  cereri: number;
  tier: "Premium" | "Standard" | "Basic";
}

interface PrimariiStatusListProps {
  primarii: PrimarieStatus[];
}

export function PrimariiStatusList({ primarii }: PrimariiStatusListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="col-span-4 rounded-2xl p-5"
      style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground text-[0.95rem] font-semibold">Status Primării</h3>
        <Link
          href="/admin/primariata/primarii"
          className="flex items-center text-[0.72rem] text-emerald-400 transition-colors hover:text-emerald-300"
        >
          Vezi toate <ArrowUpRight className="ml-0.5 h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {primarii.map((p, i) => (
          <div
            key={i}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
            style={{
              background: "var(--surface-raised, var(--muted))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className={`h-2 w-2 rounded-full ${p.status === "active" ? "bg-emerald-400" : "bg-gray-600"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-[0.8rem]">{p.name}</div>
              <div className="text-muted-foreground text-[0.65rem]">
                {p.users} utilizatori · {p.cereri} cereri/lună
              </div>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
              style={{
                background:
                  p.tier === "Premium"
                    ? "rgba(139,92,246,0.1)"
                    : p.tier === "Standard"
                      ? "rgba(6,182,212,0.1)"
                      : "rgba(107,114,128,0.1)",
                color:
                  p.tier === "Premium" ? "#8b5cf6" : p.tier === "Standard" ? "#06b6d4" : "#6b7280",
                border: `1px solid ${p.tier === "Premium" ? "rgba(139,92,246,0.15)" : p.tier === "Standard" ? "rgba(6,182,212,0.15)" : "rgba(107,114,128,0.15)"}`,
              }}
            >
              {p.tier}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
