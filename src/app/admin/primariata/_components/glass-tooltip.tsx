"use client";

import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-xl border border-emerald-500/20 px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.08)] backdrop-blur-md"
      style={{ background: "var(--popover)" }}
    >
      <div className="text-foreground mb-1.5 text-xs font-semibold">{label}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.name} className="mb-0.5 flex items-center gap-2 text-[0.78rem]">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ background: p.color, boxShadow: `0 0 6px ${p.color}60` }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-semibold">
            {p.name === "Revenue" || p.name === "MRR"
              ? `${p.value.toLocaleString()} RON`
              : p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
