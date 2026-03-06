"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Building2, Bell, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileTab } from "@/components/admin/settings/profile-tab";
import { PrimarieTab } from "@/components/admin/settings/primarie-tab";
import { NotificationsTab } from "@/components/admin/settings/notifications-tab";
import { SecurityTab } from "@/components/admin/settings/security-tab";
import { AppearanceTab } from "@/components/admin/settings/appearance-tab";
import type { ComponentType } from "react";

// ============================================================================
// Types
// ============================================================================

interface SettingsPageData {
  user: {
    id: string;
    email: string;
    nume: string;
    prenume: string;
    telefon: string | null;
  };
  primarie: {
    id: string;
    email: string | null;
    telefon: string | null;
    adresa: string | null;
    program_lucru: string | null;
    nume_oficial: string;
    config: {
      maintenance_mode: boolean;
      auto_approve: boolean;
      accent_preset: string;
      cui: string;
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    };
  };
  notificationPrefs: {
    email: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
    push: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
    sms: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
  };
}

interface AdminSettingsTabsProps {
  data: SettingsPageData;
}

// ============================================================================
// Tab Configuration
// ============================================================================

const TABS = [
  { id: "profil", label: "Profil Admin", icon: User },
  { id: "primarie", label: "Configurare Primarie", icon: Building2 },
  { id: "notificari", label: "Notificari", icon: Bell },
  { id: "securitate", label: "Securitate", icon: Shield },
  { id: "aspect", label: "Aspect", icon: Palette },
] as const;

type TabId = (typeof TABS)[number]["id"];

const VALID_TAB_IDS = new Set<string>(TABS.map((t) => t.id));

// ============================================================================
// Component
// ============================================================================

export function AdminSettingsTabs({ data }: AdminSettingsTabsProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = useMemo((): TabId => {
    const param = searchParams.get("tab");
    if (param && VALID_TAB_IDS.has(param)) return param as TabId;
    return "profil";
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tabId: TabId): void => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Sidebar tabs (vertical on desktop, horizontal scroll on mobile) */}
      <nav className="lg:col-span-3">
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-x-visible">
          {TABS.map((tab) => {
            const Icon: ComponentType<{ className?: string }> = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  "lg:w-full",
                  isActive
                    ? "text-accent-700 dark:text-accent-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="bg-accent-500/12 border-accent-500/20 absolute inset-0 rounded-lg border"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab content panel */}
      <div className="lg:col-span-9">
        {/* AnimatePresence for visual transition only */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Render active tab content only -- forms are simple enough that remounting is fine
                since they use defaultValues from server data */}
            {activeTab === "profil" && (
              <ProfileTab
                initialData={{
                  nume: data.user.nume,
                  prenume: data.user.prenume,
                  email: data.user.email,
                  telefon: data.user.telefon ?? "",
                  primarie_name: data.primarie.nume_oficial,
                  rol: "admin",
                }}
              />
            )}
            {activeTab === "primarie" && (
              <PrimarieTab
                primarieId={data.primarie.id}
                initialData={{
                  email: data.primarie.email ?? "",
                  telefon: data.primarie.telefon ?? "",
                  adresa: data.primarie.adresa ?? "",
                  program_lucru: data.primarie.program_lucru ?? "",
                  nume_oficial: data.primarie.nume_oficial,
                  config: data.primarie.config,
                }}
              />
            )}
            {activeTab === "notificari" && (
              <NotificationsTab initialData={data.notificationPrefs} />
            )}
            {activeTab === "securitate" && <SecurityTab />}
            {activeTab === "aspect" && (
              <AppearanceTab
                primarieId={data.primarie.id}
                currentPreset={data.primarie.config.accent_preset}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
