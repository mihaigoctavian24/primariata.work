import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, FileText, UserPlus, CreditCard, CheckCircle2, Clock } from "lucide-react";

interface FeedItem {
  id: string;
  icon: "file" | "user" | "payment" | "approve";
  text: string;
  time: string;
  color: string;
}

const iconMap = {
  file: FileText,
  user: UserPlus,
  payment: CreditCard,
  approve: CheckCircle2,
};

const feedPool: Omit<FeedItem, "id" | "time">[] = [
  { icon: "file", text: "Cerere nouă depusă — Certificat Fiscal", color: "#3b82f6" },
  { icon: "user", text: "Utilizator nou înregistrat: Andrei M.", color: "#8b5cf6" },
  { icon: "payment", text: "Plată procesată — 250 RON taxă locală", color: "#10b981" },
  { icon: "approve", text: "Cerere #1847 aprobată de funcționar", color: "#f59e0b" },
  { icon: "file", text: "Document nou încărcat — Acord vecinătate", color: "#06b6d4" },
  { icon: "user", text: "Funcționar Maria I. s-a conectat", color: "#ec4899" },
  { icon: "payment", text: "Taxă de 120 RON achitată online", color: "#10b981" },
  { icon: "approve", text: "Cerere #1852 trecută în verificare", color: "#f59e0b" },
  { icon: "file", text: "Certificat de urbanism generat automat", color: "#3b82f6" },
  { icon: "user", text: "Admin Elena D. a modificat setările", color: "#ec4899" },
];

export function LiveActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const counter = useRef(0);
  const poolIndex = useRef(0);

  useEffect(() => {
    // Add initial items
    const initial: FeedItem[] = [];
    for (let i = 0; i < 4; i++) {
      initial.push({
        ...feedPool[i],
        id: `feed-${counter.current++}`,
        time: `acum ${(4 - i) * 2} min`,
      });
    }
    poolIndex.current = 4;
    setItems(initial);

    // Add new items periodically
    const interval = setInterval(() => {
      const item = feedPool[poolIndex.current % feedPool.length];
      poolIndex.current++;
      setItems((prev) => {
        const newItems = [
          { ...item, id: `feed-${counter.current++}`, time: "chiar acum" },
          ...prev,
        ];
        return newItems.slice(0, 8);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-2xl p-5 h-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Activitate Live</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -30, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-white/3 transition-all"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${item.color}15` }}>
                  <Icon className="w-3 h-3" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate" style={{ fontSize: "0.78rem" }}>{item.text}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                    <Clock className="w-2.5 h-2.5" />
                    {item.time}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
