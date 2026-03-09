"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserPlus, User, Mail, Send, X } from "lucide-react";

import type { UserRole } from "./utilizatori-data";
import { roleConfig, departments } from "./utilizatori-data";

// ─── Props ────────────────────────────────────────────

interface UtilizatoriInviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (form: { name: string; email: string; role: UserRole; department: string }) => void;
}

// ─── Component ────────────────────────────────────────

export function UtilizatoriInviteModal({ open, onClose, onInvite }: UtilizatoriInviteModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "functionar" as UserRole,
    department: "",
  });

  const handleSubmit = () => {
    onInvite(form);
    setForm({ name: "", email: "", role: "functionar", department: "" });
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "#12121e", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))",
                  }}
                >
                  <UserPlus className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                    Invită Utilizator Nou
                  </h3>
                  <p className="text-gray-600" style={{ fontSize: "0.72rem" }}>
                    Se va trimite email cu link de activare
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg p-1.5 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.78rem" }}>
                  Nume complet
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="ex. Ion Popescu"
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-700"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.78rem" }}>
                  Email
                </label>
                <div
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Mail className="h-4 w-4 text-gray-600" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@primarias1.ro"
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-700"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.78rem" }}>
                  Rol atribuit
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["cetatean", "functionar", "primar"] as UserRole[]).map((r) => {
                    const cfg = roleConfig[r];
                    const Icon = cfg.icon;
                    const isSelR = form.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setForm({ ...form, role: r })}
                        className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-all ${isSelR ? "ring-1" : ""}`}
                        style={{
                          background: isSelR ? `${cfg.color}15` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isSelR ? cfg.color + "30" : "rgba(255,255,255,0.06)"}`,
                          ...(isSelR ? { ringColor: cfg.color } : {}),
                        }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: isSelR ? cfg.color : "#6b7280" }}
                        />
                        <span
                          style={{ fontSize: "0.78rem", color: isSelR ? cfg.color : "#9ca3af" }}
                        >
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-gray-600" style={{ fontSize: "0.68rem" }}>
                  {roleConfig[form.role].description}
                </p>
              </div>
              {form.role === "functionar" && (
                <div>
                  <label className="mb-1.5 block text-gray-400" style={{ fontSize: "0.78rem" }}>
                    Departament
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full cursor-pointer rounded-xl px-3 py-2.5 text-white outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="">Selectează departament...</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
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
                onClick={handleSubmit}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-white"
                style={{
                  background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                  fontSize: "0.85rem",
                }}
              >
                <Send className="h-4 w-4" /> Trimite Invitație
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
