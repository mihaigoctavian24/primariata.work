"use client";

import type { NotificationPrefsFormValues } from "@/lib/validations/admin-settings";

interface NotificationsTabProps {
  initialData: NotificationPrefsFormValues;
}

export function NotificationsTab({ initialData }: NotificationsTabProps): React.JSX.Element {
  void initialData;
  return (
    <div className="border-border/40 bg-card rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Notificari</h2>
    </div>
  );
}
