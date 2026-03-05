import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Activity,
  Users,
  FileText,
  FolderOpen,
  CreditCard,
  CalendarDays,
  Settings,
  Bell,
  User,
  UserPlus,
  Sun,
  LogOut,
  HelpCircle,
  FilePlus,
} from "lucide-react";

/**
 * Command Palette Configuration
 *
 * Static commands per role for the Cmd+K palette.
 * Navigation items mirror sidebar-config.ts; actions provide quick operations.
 */

export interface CommandItem {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  action: "navigate" | "function";
  href?: string;
  fn?: string;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export function getCommandsForRole(role: string, basePath: string): CommandGroup[] {
  if (role === "admin") {
    return getAdminCommands(basePath);
  }
  return getCitizenCommands(basePath);
}

function getAdminCommands(basePath: string): CommandGroup[] {
  return [
    {
      heading: "Pagini",
      items: [
        {
          id: "nav-dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          action: "navigate",
          href: `${basePath}/primariata`,
        },
        {
          id: "nav-monitorizare",
          icon: Activity,
          label: "Monitorizare",
          action: "navigate",
          href: `${basePath}/monitorizare`,
        },
        {
          id: "nav-utilizatori",
          icon: Users,
          label: "Utilizatori",
          action: "navigate",
          href: `${basePath}/users`,
        },
        {
          id: "nav-cereri",
          icon: FileText,
          label: "Cereri",
          action: "navigate",
          href: `${basePath}/cereri`,
        },
        {
          id: "nav-documente",
          icon: FolderOpen,
          label: "Documente",
          action: "navigate",
          href: `${basePath}/documente`,
        },
        {
          id: "nav-financiar",
          icon: CreditCard,
          label: "Financiar",
          action: "navigate",
          href: `${basePath}/financiar`,
        },
        {
          id: "nav-calendar",
          icon: CalendarDays,
          label: "Calendar",
          action: "navigate",
          href: `${basePath}/calendar`,
        },
        {
          id: "nav-configurare",
          icon: Settings,
          label: "Configurare",
          action: "navigate",
          href: `${basePath}/settings`,
        },
      ],
    },
    {
      heading: "Actiuni",
      items: [
        {
          id: "fn-invite",
          icon: UserPlus,
          label: "Invita utilizator",
          action: "function",
          fn: "invite-user",
        },
        {
          id: "fn-theme",
          icon: Sun,
          label: "Comuta tema",
          shortcut: "T",
          action: "function",
          fn: "toggle-theme",
        },
        { id: "fn-logout", icon: LogOut, label: "Deconectare", action: "function", fn: "logout" },
        { id: "fn-help", icon: HelpCircle, label: "Ajutor", action: "function", fn: "help" },
      ],
    },
  ];
}

function getCitizenCommands(basePath: string): CommandGroup[] {
  return [
    {
      heading: "Pagini",
      items: [
        {
          id: "nav-dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
          action: "navigate",
          href: `${basePath}/dashboard`,
        },
        {
          id: "nav-cereri",
          icon: FileText,
          label: "Cereri",
          action: "navigate",
          href: `${basePath}/cereri`,
        },
        {
          id: "nav-documente",
          icon: FolderOpen,
          label: "Documente",
          action: "navigate",
          href: `${basePath}/documente`,
        },
        {
          id: "nav-plati",
          icon: CreditCard,
          label: "Plati",
          action: "navigate",
          href: `${basePath}/plati`,
        },
        {
          id: "nav-profil",
          icon: User,
          label: "Profil",
          action: "navigate",
          href: `${basePath}/profil`,
        },
        {
          id: "nav-setari",
          icon: Settings,
          label: "Setari",
          action: "navigate",
          href: `${basePath}/setari`,
        },
        {
          id: "nav-notificari",
          icon: Bell,
          label: "Notificari",
          action: "navigate",
          href: `${basePath}/notificari`,
        },
      ],
    },
    {
      heading: "Actiuni",
      items: [
        {
          id: "fn-cerere-noua",
          icon: FilePlus,
          label: "Cerere noua",
          action: "navigate",
          href: `${basePath}/cereri/nou`,
        },
        {
          id: "fn-theme",
          icon: Sun,
          label: "Comuta tema",
          shortcut: "T",
          action: "function",
          fn: "toggle-theme",
        },
        { id: "fn-logout", icon: LogOut, label: "Deconectare", action: "function", fn: "logout" },
        { id: "fn-help", icon: HelpCircle, label: "Ajutor", action: "function", fn: "help" },
      ],
    },
  ];
}
