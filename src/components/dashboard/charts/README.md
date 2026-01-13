# Dashboard Charts - Integration Guide

## Overview

Three new chart components for the dashboard revamp, built with **Recharts** and **Framer Motion** animations.

## Components

### 1. StatusTimelineChart

**Purpose**: Display active cereri with progress bars and ETA

**Usage**:

```tsx
import { StatusTimelineChart } from "@/components/dashboard/charts";

<StatusTimelineChart
  data={cereriTimelineData}
  isLoading={isLoading}
  onCerereClick={(cerereId) => router.push(`/cereri/${cerereId}`)}
/>;
```

**API Endpoint**: `GET /api/dashboard/cereri-timeline`

**Features**:

- Horizontal progress bars with percentage
- ETA days remaining display
- Status badges (Depusă, În Verificare, etc.)
- Click handlers for navigation
- Animated entry transitions

---

### 2. PlatiOverviewChart

**Purpose**: Show monthly payment trends with bar chart

**Usage**:

```tsx
import { PlatiOverviewChart } from "@/components/dashboard/charts";

<PlatiOverviewChart data={platiMonthlyData} isLoading={isLoading} months={6} />;
```

**API Endpoint**: `GET /api/dashboard/plati-monthly?months=6`

**Features**:

- Bar chart with monthly aggregation
- Romanian month labels (Ian, Feb, Mar, etc.)
- Summary cards (Total An, Luna Curentă, În Așteptare)
- Success vs pending breakdown in tooltip
- Responsive design

---

### 3. ServiceBreakdownChart

**Purpose**: Display cereri distribution by type with donut chart

**Usage**:

```tsx
import { ServiceBreakdownChart } from "@/components/dashboard/charts";

<ServiceBreakdownChart
  data={serviceBreakdownData}
  isLoading={isLoading}
  onSegmentClick={(tipCerereId) => filterByCerereType(tipCerereId)}
/>;
```

**API Endpoint**: `GET /api/dashboard/service-breakdown`

**Features**:

- Donut chart with color-coded segments
- Percentage breakdown
- Top 5 services list below chart
- Interactive hover states
- Click handlers for filtering

---

## Integration Example

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  StatusTimelineChart,
  PlatiOverviewChart,
  ServiceBreakdownChart,
} from "@/components/dashboard/charts";
import type { CerereTimeline, MonthlyPaymentData, ServiceBreakdownData } from "@/types/dashboard";

export function DashboardChartsSection() {
  const [cereriData, setCereriData] = useState<CerereTimeline[]>([]);
  const [platiData, setPlatiData] = useState<MonthlyPaymentData | null>(null);
  const [breakdownData, setBreakdownData] = useState<ServiceBreakdownData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch all chart data in parallel
        const [cereriRes, platiRes, breakdownRes] = await Promise.all([
          fetch("/api/dashboard/cereri-timeline"),
          fetch("/api/dashboard/plati-monthly?months=6"),
          fetch("/api/dashboard/service-breakdown"),
        ]);

        const [cereriJson, platiJson, breakdownJson] = await Promise.all([
          cereriRes.json(),
          platiRes.json(),
          breakdownRes.json(),
        ]);

        if (cereriJson.success) setCereriData(cereriJson.data);
        if (platiJson.success) setPlatiData(platiJson.data);
        if (breakdownJson.success) setBreakdownData(breakdownJson.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <StatusTimelineChart
          data={cereriData}
          isLoading={isLoading}
          onCerereClick={(id) => console.log("Navigate to cerere:", id)}
        />
      </div>

      <div>
        <ServiceBreakdownChart
          data={breakdownData}
          isLoading={isLoading}
          onSegmentClick={(id) => console.log("Filter by type:", id)}
        />
      </div>

      <div className="lg:col-span-3">
        <PlatiOverviewChart data={platiData} isLoading={isLoading} months={6} />
      </div>
    </div>
  );
}
```

---

## Styling

All charts use:

- Tailwind CSS with design system tokens
- Dark mode support via `dark:` variants
- Responsive breakpoints
- Border opacity: `border-border/40` (subtle 40% gray)
- Card backgrounds: `bg-card`
- Muted text: `text-muted-foreground`

---

## Prerequisites

Before using these charts, ensure:

1. ✅ Database migration applied: `20260109003629_dashboard_revamp_tables.sql`
2. ✅ Dependencies installed: `recharts`, `framer-motion`, `date-fns`
3. ✅ API endpoints working: `/api/dashboard/*`
4. ✅ Types imported: `@/types/dashboard`

---

## Testing

To test charts with mock data:

```tsx
const mockCereriData: CerereTimeline[] = [
  {
    id: "1",
    numar_cerere: "CR-2025-001",
    tip_cerere: { nume: "Autorizație de Construcție" },
    status: "in_verificare",
    progress: {
      percentage: 40,
      current_step: "in_verificare",
      eta_days: 8,
      last_activity: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockPlatiData: MonthlyPaymentData = {
  monthly: [
    {
      month: "2025-01",
      month_label: "Ian 2025",
      total_suma: 1500,
      total_plati: 3,
      success_count: 2,
      pending_count: 1,
    },
  ],
  summary: {
    total_year: 1500,
    total_month_current: 1500,
    upcoming_payments: 1,
  },
};

const mockBreakdownData: ServiceBreakdownData = {
  breakdown: [
    {
      tip_cerere_id: "1",
      tip_cerere_nume: "Autorizație Construcție",
      categorie: "urbanism",
      count: 5,
      percentage: 50,
      color: "#3b82f6",
    },
  ],
  total: 10,
};
```

---

## Next Steps

1. Apply database migration to Supabase
2. Integrate charts into main dashboard page
3. Add loading states and error boundaries
4. Implement click handlers for navigation
5. Test with real user data
6. Add chart customization options (date ranges, filters)

---

## Notes

- All animations use Framer Motion with 0.3-0.8s durations
- Charts are fully responsive (mobile, tablet, desktop)
- Empty states included for when no data available
- Romanian language labels throughout
- Type-safe with full TypeScript support
