import { Suspense } from "react";
import { CalendarContent } from "@/components/admin/calendar/calendar-content";
import { CalendarSkeleton } from "@/components/admin/calendar/calendar-skeleton";

/**
 * Admin Calendar Page
 *
 * Auth + role enforcement is handled by middleware (user_primarii.rol check).
 * No DB calls needed — CalendarContent uses Zustand/localStorage for persistence.
 */
export default function CalendarPage(): React.JSX.Element {
  return (
    <div className="block h-full w-full">
      <Suspense
        fallback={
          <div className="block h-full w-full">
            <CalendarSkeleton />
          </div>
        }
      >
        <CalendarContent />
      </Suspense>
    </div>
  );
}
