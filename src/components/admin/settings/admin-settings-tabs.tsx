"use client";

import { useState } from "react";
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
    avatar_url: string | null;
  };
  primarie: {
    id: string;
    email: string | null;
    telefon: string | null;
    adresa: string | null;
    program_lucru: string | null;
    nume_oficial: string;
    logo_url: string | null;
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

// ============================================================================
// Component
// ============================================================================

export function AdminSettingsTabs({ data }: AdminSettingsTabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>("profil");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Sidebar tabs (vertical on desktop, horizontal scroll on mobile) */}
      <nav className="lg:col-span-3">
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:items-start lg:overflow-x-visible">
          {TABS.map((tab) => {
            const Icon: ComponentType<{ className?: string }> = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative inline-flex w-auto items-center gap-2.5 rounded-xl px-3 py-2 font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:bg-white/[0.03] hover:text-gray-200"
                )}
                style={{ fontSize: "0.82rem" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.08))",
                      border: "1px solid rgba(236,72,153,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-[17px] w-[17px] shrink-0 transition-colors",
                    isActive && "text-pink-400"
                  )}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Tab content panel */}
      <div className="lg:col-span-9">
        {/* AnimatePresence for visual transition only */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.1 }}
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
                  avatar_url: data.user.avatar_url,
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
                  logo_url: data.primarie.logo_url,
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
