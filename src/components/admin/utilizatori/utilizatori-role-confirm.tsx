"use client";

import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ArrowRight, Crown, CheckCircle2 } from "lucide-react";

import type { PlatformUser, UserRole } from "./utilizatori-data";
import { roleConfig } from "./utilizatori-data";

// ─── Props ────────────────────────────────────────────

interface UtilizatoriRoleConfirmProps {
  data: { userId: string; newRole: UserRole } | null;
  users: PlatformUser[];
  onConfirm: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriRoleConfirm({
  data,
  users,
  onConfirm,
  onClose,
}: UtilizatoriRoleConfirmProps) {
  if (!data) return null;

  const user = users.find((u) => u.id === data.userId);
  if (!user) return null;

  const currentRc = roleConfig[user.role];
  const newRc = roleConfig[data.newRole];
  const CurrentIcon = currentRc.icon;
  const NewIcon = newRc.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
              Confirmare Schimbare Rol
            </h3>
          </div>
          <p className="mb-4 text-gray-400" style={{ fontSize: "0.85rem" }}>
            Ești sigur că vrei să schimbi rolul utilizatorului{" "}
            <span className="text-white" style={{ fontWeight: 600 }}>
              {user.name}
            </span>
            ?
          </p>
          <div
            className="mb-5 flex items-center justify-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ fontSize: "0.78rem", color: currentRc.color, background: currentRc.bg }}
            >
              <CurrentIcon className="h-3.5 w-3.5" /> {currentRc.label}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-600" />
            <span
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ fontSize: "0.78rem", color: newRc.color, background: newRc.bg }}
            >
              <NewIcon className="h-3.5 w-3.5" /> {newRc.label}
            </span>
          </div>
          {data.newRole === "primar" && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.1)",
              }}
            >
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-300/80" style={{ fontSize: "0.72rem" }}>
                Atenție: Atribuirea rolului de Primar conferă permisiuni extinse de aprobare și
                supervizare.
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl px-4 py-2 text-gray-400 transition-all hover:text-white"
              style={{ fontSize: "0.85rem" }}
            >
              Anulează
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-white"
              style={{
                background: `linear-gradient(135deg, ${newRc.color}, ${newRc.color}cc)`,
                fontSize: "0.85rem",
              }}
            >
              <CheckCircle2 className="h-4 w-4" /> Confirmă
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
