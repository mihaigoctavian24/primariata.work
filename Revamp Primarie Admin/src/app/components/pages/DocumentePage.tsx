import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  FolderOpen, File, FileText, FileSpreadsheet, FileImage,
  Upload, Search, Grid3X3, List, Download, Trash2,
  Star, StarOff, Clock, MoreHorizontal, Eye, FolderPlus,
  ChevronRight, HardDrive,
} from "lucide-react";

interface Doc {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "img" | "folder";
  size: string;
  modified: string;
  starred: boolean;
  folder?: string;
}

const iconMap = {
  pdf: { icon: FileText, color: "#ef4444" },
  doc: { icon: File, color: "#3b82f6" },
  xls: { icon: FileSpreadsheet, color: "#10b981" },
  img: { icon: FileImage, color: "#f59e0b" },
  folder: { icon: FolderOpen, color: "#8b5cf6" },
};

const initialDocs: Doc[] = [
  { id: "f1", name: "Certificare Fiscale", type: "folder", size: "12 fișiere", modified: "azi", starred: true },
  { id: "f2", name: "Autorizații Construire", type: "folder", size: "8 fișiere", modified: "ieri", starred: false },
  { id: "f3", name: "Urbanism", type: "folder", size: "15 fișiere", modified: "3 Mar", starred: true },
  { id: "d1", name: "Certificat_Fiscal_4521.pdf", type: "pdf", size: "245 KB", modified: "4 Mar 2026", starred: false, folder: "Certificare Fiscale" },
  { id: "d2", name: "Autorizatie_Construire_1842.pdf", type: "pdf", size: "1.2 MB", modified: "3 Mar 2026", starred: true, folder: "Autorizații Construire" },
  { id: "d3", name: "Plan_Urbanistic_Zonal.doc", type: "doc", size: "890 KB", modified: "3 Mar 2026", starred: false, folder: "Urbanism" },
  { id: "d4", name: "Raport_Buget_Q1_2026.xls", type: "xls", size: "156 KB", modified: "2 Mar 2026", starred: false },
  { id: "d5", name: "Schita_amplasament.png", type: "img", size: "3.4 MB", modified: "2 Mar 2026", starred: false, folder: "Urbanism" },
  { id: "d6", name: "Certificat_Urbanism_1845.pdf", type: "pdf", size: "312 KB", modified: "1 Mar 2026", starred: true },
  { id: "d7", name: "Contract_servicii_publice.doc", type: "doc", size: "450 KB", modified: "28 Feb 2026", starred: false },
  { id: "d8", name: "Aviz_Mediu_Final.pdf", type: "pdf", size: "678 KB", modified: "27 Feb 2026", starred: false },
  { id: "d9", name: "Statistici_Cereri_Feb.xls", type: "xls", size: "89 KB", modified: "27 Feb 2026", starred: false },
];

export function DocumentePage() {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  const toggleStar = (id: string) => {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, starred: !d.starred } : d));
    toast.success("⭐ Actualizat!");
  };

  const deleteDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("🗑️ Fișier șters");
  };

  const filtered = docs.filter((d) => {
    if (search) return d.name.toLowerCase().includes(search.toLowerCase());
    if (currentFolder) return d.folder === currentFolder || (d.type === "folder" && d.name === currentFolder);
    return true;
  });

  const folders = filtered.filter((d) => d.type === "folder");
  const files = filtered.filter((d) => d.type !== "folder");

  const totalSize = "24.7 MB";
  const totalFiles = docs.filter((d) => d.type !== "folder").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <FolderOpen className="w-6 h-6 text-violet-400" /> Documente
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            {totalFiles} fișiere · {totalSize} utilizat
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-gray-300 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <FolderPlus className="w-4 h-4" />
            <span style={{ fontSize: "0.82rem" }}>Folder Nou</span>
          </motion.button>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-white" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 4px 15px rgba(139,92,246,0.25)" }}>
            <Upload className="w-4 h-4" />
            <span style={{ fontSize: "0.82rem" }}>Încarcă</span>
          </motion.button>
        </div>
      </div>

      {/* Breadcrumb */}
      {currentFolder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mb-4 text-gray-500" style={{ fontSize: "0.82rem" }}>
          <button onClick={() => setCurrentFolder(null)} className="hover:text-white cursor-pointer transition-colors">Documente</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">{currentFolder}</span>
        </motion.div>
      )}

      {/* Storage Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-4 mb-5 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <HardDrive className="w-4 h-4 text-gray-500" />
        <div className="flex-1">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: "24.7%" }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #ec4899)" }} />
          </div>
        </div>
        <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>24.7 MB / 100 MB</span>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Search className="w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Caută documente..." className="flex-1 bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.85rem" }} />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
          <button onClick={() => setView("grid")} className={`p-2 rounded-md cursor-pointer transition-all ${view === "grid" ? "bg-white/10 text-white" : "text-gray-500"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 rounded-md cursor-pointer transition-all ${view === "list" ? "bg-white/10 text-white" : "text-gray-500"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); toast.success("📎 Fișier încărcat cu succes!"); }}
        className={`rounded-2xl transition-all ${dragOver ? "ring-2 ring-violet-400/50" : ""}`}
      >
        {/* Folders */}
        {!currentFolder && folders.length > 0 && (
          <div className="mb-4">
            <div className="text-gray-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Foldere</div>
            <div className={`grid ${view === "grid" ? "grid-cols-3" : "grid-cols-1"} gap-2`}>
              {folders.map((folder) => {
                const cfg = iconMap[folder.type];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={folder.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentFolder(folder.name)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer group transition-all"
                    style={{ background: `${cfg.color}06`, border: `1px solid ${cfg.color}12` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate" style={{ fontSize: "0.88rem" }}>{folder.name}</div>
                      <div className="text-gray-600" style={{ fontSize: "0.72rem" }}>{folder.size}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <div className="text-gray-600 mb-2" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Fișiere</div>
          <div className={`grid ${view === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-2`}>
            <AnimatePresence mode="popLayout">
              {files.map((doc) => {
                const cfg = iconMap[doc.type];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: view === "grid" ? -3 : 0 }}
                    className={`group rounded-xl cursor-pointer transition-all ${view === "grid" ? "p-4 flex flex-col" : "px-4 py-3 flex items-center gap-3"}`}
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {view === "grid" ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${cfg.color}12` }}>
                            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); toggleStar(doc.id); }} className="p-1 rounded hover:bg-white/10 cursor-pointer transition-all">
                              {doc.starred ? <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5 text-gray-600" />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); toast.success("⬇️ Se descarcă..."); }} className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-white cursor-pointer transition-all">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }} className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 cursor-pointer transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-white truncate mb-1" style={{ fontSize: "0.82rem" }}>{doc.name}</div>
                        <div className="flex items-center justify-between text-gray-600" style={{ fontSize: "0.7rem" }}>
                          <span>{doc.size}</span>
                          <span>{doc.modified}</span>
                        </div>
                        {doc.starred && <Star className="absolute top-2 right-2 w-3 h-3 text-amber-400 fill-amber-400" />}
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}12` }}>
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white truncate" style={{ fontSize: "0.85rem" }}>{doc.name}</div>
                        </div>
                        <span className="text-gray-600 shrink-0" style={{ fontSize: "0.75rem" }}>{doc.size}</span>
                        <span className="text-gray-600 shrink-0 w-20 text-right" style={{ fontSize: "0.75rem" }}>{doc.modified}</span>
                        {doc.starred && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); toast.success("⬇️ Se descarcă..."); }} className="p-1 rounded hover:bg-white/10 text-gray-600 hover:text-white cursor-pointer transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }} className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 cursor-pointer transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty Drop hint */}
        {files.length === 0 && folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-700 rounded-2xl border-2 border-dashed border-white/[0.06]">
            <Upload className="w-10 h-10 mb-3 opacity-30" />
            <p style={{ fontSize: "0.9rem" }}>Trage fișiere aici sau caută</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
