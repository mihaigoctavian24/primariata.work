import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { NotificationCenter, type Notification } from "./NotificationCenter";
import { QuickActionModal } from "./QuickActionModal";

const initialNotifications: Notification[] = [
  { id: "n1", type: "success", title: "Cerere Aprobată", message: "Cererea #1842 a fost aprobată de administrator.", time: "acum 5 min", read: false },
  { id: "n2", type: "warning", title: "Deadline Aproape", message: "Cererea #1839 expiră în 2 zile — necesită atenție.", time: "acum 15 min", read: false },
  { id: "n3", type: "info", title: "Document Nou", message: "Certificat fiscal generat automat pentru contribuabilul #4521.", time: "acum 30 min", read: false },
  { id: "n4", type: "action", title: "Staff Nou", message: "Ion Popescu a acceptat invitația de funcționar.", time: "acum 1 oră", read: true },
  { id: "n5", type: "success", title: "Plată Primită", message: "Taxă locală 250 RON achitată — Contribuabil #3892.", time: "acum 2 ore", read: true },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [modalType, setModalType] = useState<"invite" | "manage" | "register" | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCmdOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newNotif: Notification = {
        id: `n-live-${Date.now()}`,
        type: "info",
        title: "Cerere Nouă",
        message: "O cerere nouă (#1853) a fost depusă de un cetățean.",
        time: "chiar acum",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      toast("📋 Cerere nouă depusă!", { description: "Cererea #1853 a fost depusă de un cetățean." });
    }, 12000);
    return () => clearTimeout(timeout);
  }, []);

  const handleCommandAction = (id: string) => {
    switch (id) {
      case "invite": setModalType("invite"); break;
      case "notif": setNotifOpen(true); break;
      case "theme":
        setDarkMode(!darkMode);
        toast(darkMode ? "☀️ Tema Light activată" : "🌙 Tema Dark activată");
        break;
      case "manage": setModalType("manage"); break;
      case "dash": navigate("/"); break;
      case "cereri": navigate("/cereri"); break;
      case "docs": navigate("/documente"); break;
      case "plati": navigate("/plati"); break;
      case "settings": navigate("/setari"); break;
      case "users": navigate("/utilizatori"); break;
      case "monitor": navigate("/monitorizare"); break;
      case "calendar": navigate("/calendar"); break;
      default: toast(`Navigare → ${id}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#09090f", fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" } }} />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onAction={handleCommandAction} />
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} setNotifications={setNotifications} />
      <QuickActionModal type={modalType} onClose={() => setModalType(null)} />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onCommandPalette={() => setCmdOpen(true)} />

      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col min-h-screen"
      >
        <TopBar
          darkMode={darkMode}
          onToggleDark={() => { setDarkMode(!darkMode); toast(darkMode ? "☀️ Light mode" : "🌙 Dark mode"); }}
          onNotifications={() => setNotifOpen(true)}
          onCommandPalette={() => setCmdOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}