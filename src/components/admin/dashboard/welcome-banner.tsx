"use client";

import { motion } from "motion/react";
import { Shield, Sparkles } from "lucide-react";
import { ProgressRing } from "@/components/admin";
import type { WelcomeBannerData } from "@/lib/admin-dashboard-types";

function WelcomeBanner({
  adminName,
  primarieName,
  judetName,
  uptimePercent,
  cereriResolutionPercent,
  slaCompliancePercent,
  pendingRegistrations,
  onlineFunctionari,
  alertCount,
}: WelcomeBannerData) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "var(--accent-gradient)",
        boxShadow: "0 8px 32px var(--accent-shadow)",
      }}
    >
      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 h-72 w-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 65%)",
          transform: "translate(30%, -50%)",
        }}
      />
      <motion.div
        animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 65%)",
          transform: "translate(0%, 50%)",
        }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* Shield icon in frosted glass */}
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
        >
          <Shield className="h-7 w-7 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">
              Bine ai revenit, {adminName.split(" ")[0]}!
            </h2>
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <p className="mt-0.5 text-sm text-white/60">
            {pendingRegistrations > 0 && `${pendingRegistrations} conturi in asteptare`}
            {pendingRegistrations > 0 && onlineFunctionari > 0 && " · "}
            {onlineFunctionari > 0 && `${onlineFunctionari} functionari online`}
            {(pendingRegistrations > 0 || onlineFunctionari > 0) && alertCount > 0 && " · "}
            {alertCount > 0 && `${alertCount} alerte de sistem`}
            {pendingRegistrations === 0 &&
              onlineFunctionari === 0 &&
              alertCount === 0 &&
              `${primarieName}, ${judetName}`}
          </p>
        </div>

        {/* Progress rings - hidden on mobile */}
        <div className="hidden items-center gap-3 md:flex">
          <ProgressRing value={uptimePercent} label="Uptime" size={56} color="#10b981" />
          <ProgressRing
            value={cereriResolutionPercent}
            label="Rez. Cereri"
            size={56}
            color="#3b82f6"
          />
          <ProgressRing value={slaCompliancePercent} label="SLA" size={56} color="#f59e0b" />
        </div>
      </div>
    </motion.div>
  );
}

export { WelcomeBanner };
