"use client";

import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { X } from "lucide-react";

// ─── Props ────────────────────────────────────────────

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────

export function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-5"
            style={{
              background: "linear-gradient(180deg, #1a1a2e, #141424)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
                Eveniment Nou
              </h3>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1 text-gray-400 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Titlu eveniment"
                className="rounded-xl bg-transparent px-3 py-2.5 text-white outline-none placeholder:text-gray-600"
                style={{
                  fontSize: "0.9rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="rounded-xl px-3 py-2.5 text-white outline-none"
                  style={{
                    fontSize: "0.85rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    colorScheme: "dark",
                  }}
                />
                <input
                  type="time"
                  className="rounded-xl px-3 py-2.5 text-white outline-none"
                  style={{
                    fontSize: "0.85rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    colorScheme: "dark",
                  }}
                />
              </div>
              <input
                placeholder="Locație (opțional)"
                className="rounded-xl bg-transparent px-3 py-2.5 text-white outline-none placeholder:text-gray-600"
                style={{
                  fontSize: "0.9rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <button
                onClick={() => {
                  onClose();
                  toast.success("Eveniment adăugat!");
                }}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
              >
                Salvează
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
