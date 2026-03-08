"use client";

type RoleKey = "cetatean" | "functionar" | "primar" | "admin";

const roleClasses: Record<RoleKey, string> = {
  cetatean: "bg-blue-500/15 text-blue-500",
  functionar: "bg-emerald-500/15 text-emerald-500",
  primar: "bg-amber-500/15 text-amber-500",
  admin: "bg-violet-500/15 text-violet-500",
};

const roleLabels: Record<RoleKey, string> = {
  cetatean: "Cetățean",
  functionar: "Funcționar",
  primar: "Primar",
  admin: "Admin",
};

interface RoleColorBadgeProps {
  role: RoleKey;
  className?: string;
}

function RoleColorBadge({ role, className = "" }: RoleColorBadgeProps): React.ReactElement {
  const classes = roleClasses[role] ?? "bg-gray-500/15 text-gray-400";
  const label = roleLabels[role] ?? role;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${classes} ${className}`}
    >
      {label}
    </span>
  );
}

export { RoleColorBadge };
export type { RoleColorBadgeProps, RoleKey };
