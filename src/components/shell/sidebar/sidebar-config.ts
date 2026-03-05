/**
 * Sidebar Navigation Configuration
 *
 * Role-based nav config system. Each role defines its own sections/items/badges.
 * The Sidebar component renders generically from config.
 *
 * IMPORTANT: Uses string icon names (not component references) so config can be
 * passed from Server Components to Client Components without serialization errors.
 * Icon resolution happens client-side in SidebarNavItem via the ICON_MAP.
 */

export type IconName =
  | "LayoutDashboard"
  | "Activity"
  | "Users"
  | "FileText"
  | "FolderOpen"
  | "CreditCard"
  | "CalendarDays"
  | "Settings"
  | "Bell"
  | "User";

export interface NavItem {
  icon: IconName;
  label: string;
  href: string;
  badge?: number | "dynamic";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface SidebarConfig {
  role: string;
  roleLabel: string;
  basePath: string;
  sections: NavSection[];
}

export function getAdminSidebarConfig(basePath: string): SidebarConfig {
  return {
    role: "admin",
    roleLabel: "Admin Primarie",
    basePath,
    sections: [
      {
        title: "Principal",
        items: [
          { icon: "LayoutDashboard", label: "Dashboard", href: `${basePath}/primariata` },
          { icon: "Activity", label: "Monitorizare", href: `${basePath}/monitorizare` },
        ],
      },
      {
        title: "Administrare",
        items: [
          { icon: "Users", label: "Utilizatori", href: `${basePath}/users`, badge: "dynamic" },
          {
            icon: "FileText",
            label: "Supervizare Cereri",
            href: `${basePath}/cereri`,
            badge: "dynamic",
          },
        ],
      },
      {
        title: "Gestiune",
        items: [
          { icon: "FolderOpen", label: "Documente", href: `${basePath}/documente` },
          { icon: "CreditCard", label: "Financiar", href: `${basePath}/financiar` },
          { icon: "CalendarDays", label: "Calendar", href: `${basePath}/calendar` },
        ],
      },
      {
        title: "Sistem",
        items: [{ icon: "Settings", label: "Configurare", href: `${basePath}/settings` }],
      },
    ],
  };
}

export function getCitizenSidebarConfig(basePath: string): SidebarConfig {
  return {
    role: "cetatean",
    roleLabel: "Cetatean",
    basePath,
    sections: [
      {
        title: "Principal",
        items: [
          { icon: "LayoutDashboard", label: "Dashboard", href: basePath },
          { icon: "FileText", label: "Cereri", href: `${basePath}/cereri`, badge: "dynamic" },
          { icon: "FolderOpen", label: "Documente", href: `${basePath}/documente` },
          { icon: "CreditCard", label: "Plati", href: `${basePath}/plati` },
        ],
      },
      {
        title: "Setari",
        items: [
          { icon: "User", label: "Profil", href: `${basePath}/profil` },
          { icon: "Settings", label: "Setari", href: `${basePath}/setari` },
          { icon: "Bell", label: "Notificari", href: `${basePath}/notificari` },
        ],
      },
    ],
  };
}
