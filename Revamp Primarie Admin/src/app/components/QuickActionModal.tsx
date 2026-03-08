import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UserPlus, Users, FileInput, CheckCircle2, Loader2, Copy, Mail } from "lucide-react";
import { toast } from "sonner";

type ModalType = "invite" | "manage" | "register" | null;

interface QuickActionModalProps {
  type: ModalType;
  onClose: () => void;
}

export function QuickActionModal({ type, onClose }: QuickActionModalProps) {
  const [step, setStep] = useState<"form" | "loading" | "success">("form");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("functionar");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (type === "invite" && !email) return;
    if (type === "register" && !name) return;
    setStep("loading");
    setTimeout(() => {
      setStep("success");
      if (type === "invite") {
        toast.success(`Invitație trimisă către ${email}`);
      } else if (type === "register") {
        toast.success(`${name} a fost înregistrat cu succes`);
      }
    }, 1500);
  };

  const getTitle = () => {
    switch (type) {
      case "invite": return "Invită Staff Nou";
      case "manage": return "Gestionare Utilizatori";
      case "register": return "Înregistrare Nouă";
      default: return "";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "invite": return UserPlus;
      case "manage": return Users;
      case "register": return FileInput;
      default: return UserPlus;
    }
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #1a1a2e 0%, #141424 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(236,72,153,0.15)" }}>
                  <Icon className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>{getTitle()}</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <AnimatePresence mode="wait">
                {step === "form" && (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {type === "invite" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Email</label>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            <Mail className="w-4 h-4 text-gray-500" />
                            <input
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="email@primarie.ro"
                              className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none"
                              style={{ fontSize: "0.9rem" }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Rol</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "functionar", label: "Funcționar" },
                              { value: "admin", label: "Admin" },
                              { value: "viewer", label: "Viewer" },
                            ].map((r) => (
                              <button
                                key={r.value}
                                onClick={() => setRole(r.value)}
                                className={`px-3 py-2 rounded-xl cursor-pointer transition-all ${
                                  role === r.value ? "text-white" : "text-gray-400 hover:text-gray-200"
                                }`}
                                style={
                                  role === r.value
                                    ? { background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(236,72,153,0.3)" }
                                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }
                                }
                              >
                                <span style={{ fontSize: "0.82rem" }}>{r.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {type === "manage" && (
                      <div className="flex flex-col gap-2">
                        {[
                          { name: "Elena Dumitrescu", role: "Administrator", status: "online" },
                          { name: "Ion Popescu", role: "Funcționar", status: "online" },
                          { name: "Maria Ionescu", role: "Administrator", status: "offline" },
                        ].map((user) => (
                          <div
                            key={user.name}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all"
                            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            <div className="relative">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", fontSize: "0.8rem", fontWeight: 600 }}
                              >
                                {user.name[0]}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1a1a2e] ${
                                user.status === "online" ? "bg-emerald-400" : "bg-gray-600"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="text-white" style={{ fontSize: "0.85rem" }}>{user.name}</div>
                              <div className="text-gray-500" style={{ fontSize: "0.75rem" }}>{user.role}</div>
                            </div>
                            <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white cursor-pointer transition-all">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {type === "register" && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Nume complet</label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nume Prenume"
                            className="w-full px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none"
                            style={{ fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Tip cerere</label>
                          <select
                            className="w-full px-3 py-2.5 rounded-xl text-white outline-none appearance-none cursor-pointer"
                            style={{ fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                          >
                            <option value="certificat">Certificat de urbanism</option>
                            <option value="autorizatie">Autorizație de construire</option>
                            <option value="fiscal">Certificat fiscal</option>
                            <option value="altele">Altele</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                {step === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-10 h-10 text-pink-400" />
                    </motion.div>
                    <p className="text-gray-400 mt-3" style={{ fontSize: "0.9rem" }}>Se procesează...</p>
                  </motion.div>
                )}
                {step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)" }}>
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                    </motion.div>
                    <p className="text-white mt-3" style={{ fontSize: "1rem", fontWeight: 600 }}>Succes!</p>
                    <p className="text-gray-400 mt-1" style={{ fontSize: "0.85rem" }}>Acțiunea a fost efectuată cu succes.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step === "form" && type !== "manage" && (
              <div className="flex items-center gap-3 px-5 py-4 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
                >
                  {type === "invite" ? "Trimite Invitația" : "Înregistrează"}
                </button>
              </div>
            )}
            {step === "success" && (
              <div className="flex items-center justify-center px-5 py-4 border-t border-white/5">
                <button
                  onClick={() => { setStep("form"); onClose(); }}
                  className="px-6 py-2.5 rounded-xl text-white cursor-pointer transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
                >
                  Închide
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
