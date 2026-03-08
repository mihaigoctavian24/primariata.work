import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Settings, User, Bell, Shield, Palette, Globe, Save,
  Camera, Mail, Phone, MapPin, Building2, Check,
  Server, Database,
} from "lucide-react";

const tabs = [
  { id: "profil", icon: User, label: "Profil Admin" },
  { id: "primarie", icon: Building2, label: "Configurare Primărie" },
  { id: "notificari", icon: Bell, label: "Notificări" },
  { id: "securitate", icon: Shield, label: "Securitate" },
  { id: "aspect", icon: Palette, label: "Aspect" },
];

export function SetariPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [name, setName] = useState("Elena Dumitrescu");
  const [email, setEmail] = useState("elena.dumitrescu@primarias1.ro");
  const [phone, setPhone] = useState("+40 721 234 567");
  const [primarieName, setPrimarieName] = useState("Primăria Sector 1 București");
  const [primarieJudet, setPrimarieJudet] = useState("București");
  const [primarieLocalitate, setPrimarieLocalitate] = useState("Sector 1 B");
  const [primarieCUI, setPrimarieCUI] = useState("RO 12345678");
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifCereri, setNotifCereri] = useState(true);
  const [notifPlati, setNotifPlati] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [accentColor, setAccentColor] = useState("#ec4899");

  const handleSave = () => {
    toast.success("✅ Setări salvate cu succes!");
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full cursor-pointer transition-all"
      style={{ background: value ? "linear-gradient(135deg, #ec4899, #8b5cf6)" : "rgba(255,255,255,0.1)" }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          <Settings className="w-6 h-6 text-gray-400" /> Setări
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
          Gestionează profilul, notificările și preferințele
        </motion.p>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="col-span-3 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl cursor-pointer transition-all text-left ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(139,92,246,0.06))", border: "1px solid rgba(236,72,153,0.12)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-pink-400" : ""}`} />
                <span className="relative z-10" style={{ fontSize: "0.88rem" }}>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-9 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {activeTab === "profil" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", fontSize: "1.8rem", fontWeight: 700 }}>ED</div>
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 600 }}>{name}</div>
                  <div className="text-gray-500" style={{ fontSize: "0.85rem" }}>Administrator · Primăria Sector 1 B</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Nume complet</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <User className="w-4 h-4 text-gray-600" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Mail className="w-4 h-4 text-gray-600" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Telefon</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Phone className="w-4 h-4 text-gray-600" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Instituție</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <input value="Primăria Sector 1 B" readOnly className="flex-1 bg-transparent text-gray-500 outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer text-white" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                <Save className="w-4 h-4" /> <span style={{ fontSize: "0.88rem" }}>Salvează</span>
              </motion.button>
            </div>
          )}

          {activeTab === "primarie" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Configurare Primărie</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Nume Primărie</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Building2 className="w-4 h-4 text-gray-600" />
                    <input value={primarieName} onChange={(e) => setPrimarieName(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Judet</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <input value={primarieJudet} onChange={(e) => setPrimarieJudet(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Localitate</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <input value={primarieLocalitate} onChange={(e) => setPrimarieLocalitate(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>CUI</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Database className="w-4 h-4 text-gray-600" />
                    <input value={primarieCUI} onChange={(e) => setPrimarieCUI(e.target.value)} className="flex-1 bg-transparent text-white outline-none" style={{ fontSize: "0.88rem" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Aprobare Automată</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Check className="w-4 h-4 text-gray-600" />
                    <Toggle value={autoApprove} onChange={setAutoApprove} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Mod de Mențenanță</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Server className="w-4 h-4 text-gray-600" />
                    <Toggle value={maintenanceMode} onChange={setMaintenanceMode} />
                  </div>
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer text-white" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                <Save className="w-4 h-4" /> <span style={{ fontSize: "0.88rem" }}>Salvează</span>
              </motion.button>
            </div>
          )}

          {activeTab === "notificari" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Canale de Notificare</h3>
              {[
                { label: "Email", desc: "Primește notificări pe email", value: notifEmail, setter: setNotifEmail },
                { label: "Push", desc: "Notificări push în browser", value: notifPush, setter: setNotifPush },
                { label: "SMS", desc: "Notificări prin SMS (cost adițional)", value: notifSMS, setter: setNotifSMS },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white" style={{ fontSize: "0.9rem" }}>{item.label}</div>
                    <div className="text-gray-600" style={{ fontSize: "0.78rem" }}>{item.desc}</div>
                  </div>
                  <Toggle value={item.value} onChange={item.setter} />
                </div>
              ))}

              <h3 className="text-white mt-3" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Tipuri de Notificări</h3>
              {[
                { label: "Cereri noi", desc: "Când se depune o cerere nouă", value: notifCereri, setter: setNotifCereri },
                { label: "Plăți", desc: "Confirmări de plăți și taxe", value: notifPlati, setter: setNotifPlati },
                { label: "Sistem", desc: "Actualizări de sistem și mentenanță", value: notifSystem, setter: setNotifSystem },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                  <div>
                    <div className="text-white" style={{ fontSize: "0.9rem" }}>{item.label}</div>
                    <div className="text-gray-600" style={{ fontSize: "0.78rem" }}>{item.desc}</div>
                  </div>
                  <Toggle value={item.value} onChange={item.setter} />
                </div>
              ))}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer text-white mt-2" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                <Save className="w-4 h-4" /> <span style={{ fontSize: "0.88rem" }}>Salvează</span>
              </motion.button>
            </div>
          )}

          {activeTab === "securitate" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Securitate Cont</h3>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div className="text-white" style={{ fontSize: "0.9rem" }}>Autentificare în doi pași (2FA)</div>
                  <div className="text-gray-600" style={{ fontSize: "0.78rem" }}>Securitate adițională la autentificare</div>
                </div>
                <Toggle value={twoFA} onChange={setTwoFA} />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5" style={{ fontSize: "0.8rem" }}>Schimbă parola</label>
                <div className="flex flex-col gap-2">
                  <input type="password" placeholder="Parola curentă" className="px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.88rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                  <input type="password" placeholder="Parola nouă" className="px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.88rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                  <input type="password" placeholder="Confirmă parola nouă" className="px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.88rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer text-white" style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
                <Shield className="w-4 h-4" /> <span style={{ fontSize: "0.88rem" }}>Actualizează</span>
              </motion.button>
            </div>
          )}

          {activeTab === "aspect" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>Personalizare</h3>
              <div>
                <label className="block text-gray-400 mb-2" style={{ fontSize: "0.8rem" }}>Culoare accent</label>
                <div className="flex gap-2">
                  {["#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"].map((color) => (
                    <button
                      key={color}
                      onClick={() => { setAccentColor(color); toast.success("🎨 Culoare schimbată!"); }}
                      className="w-10 h-10 rounded-xl cursor-pointer transition-all hover:scale-110 flex items-center justify-center"
                      style={{ background: color, boxShadow: accentColor === color ? `0 0 20px ${color}60` : "none", border: accentColor === color ? "2px solid white" : "2px solid transparent" }}
                    >
                      {accentColor === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-2" style={{ fontSize: "0.8rem" }}>Limba</label>
                <select className="px-3 py-2.5 rounded-xl text-white outline-none cursor-pointer" style={{ fontSize: "0.88rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", appearance: "none" }}>
                  <option value="ro">🇷🇴 Română</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}