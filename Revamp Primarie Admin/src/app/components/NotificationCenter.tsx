import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Bell, CheckCircle2, AlertTriangle, FileText,
  UserPlus, CreditCard, Clock, Check, Trash2,
} from "lucide-react";

export interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "action";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: FileText,
  action: UserPlus,
};

const colorMap = {
  success: "#10b981",
  warning: "#f59e0b",
  info: "#3b82f6",
  action: "#8b5cf6",
};

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function NotificationCenter({ open, onClose, notifications, setNotifications }: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md z-[95] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #13132a 0%, #0d0d1a 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-400" />
                <h2 className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Notificări</h2>
                {unreadCount > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ fontSize: "0.7rem", background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 px-5 py-3">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filter === f
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                  style={
                    filter === f
                      ? { background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.2)", fontSize: "0.82rem" }
                      : { fontSize: "0.82rem" }
                  }
                >
                  {f === "all" ? "Toate" : "Necitite"}
                </button>
              ))}
              <button
                onClick={markAllRead}
                className="ml-auto text-pink-400 hover:text-pink-300 cursor-pointer transition-colors"
                style={{ fontSize: "0.78rem" }}
              >
                Marchează toate citite
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((notif) => {
                  const Icon = iconMap[notif.type];
                  const color = colorMap[notif.type];
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0 }}
                      className={`group relative flex gap-3 px-3 py-3 rounded-xl mb-1.5 cursor-pointer transition-all ${
                        notif.read ? "opacity-60" : ""
                      }`}
                      style={{
                        background: notif.read ? "transparent" : `${color}08`,
                        border: notif.read ? "1px solid transparent" : `1px solid ${color}15`,
                      }}
                      onClick={() => markAsRead(notif.id)}
                    >
                      {!notif.read && (
                        <div className="absolute top-3 left-0 w-1 h-8 rounded-r" style={{ background: color }} />
                      )}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white truncate" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                            {notif.title}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.78rem" }}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-gray-600" style={{ fontSize: "0.7rem" }}>
                          <Clock className="w-3 h-3" />
                          {notif.time}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                            className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-emerald-400 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-600">
                  <Bell className="w-10 h-10 mb-3 opacity-30" />
                  <p style={{ fontSize: "0.9rem" }}>Nicio notificare</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
