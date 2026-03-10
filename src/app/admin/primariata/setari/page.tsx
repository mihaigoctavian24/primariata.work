import { Suspense } from "react";
import { SaSettingsContent } from "../_components/sa-settings-content";
import { SaSettingsSkeleton } from "../_components/sa-settings-skeleton";

export default function SuperAdminSettingsPage() {
  return (
    <Suspense fallback={<SaSettingsSkeleton />}>
      <SaSettingsContent />
    </Suspense>
  );
}
