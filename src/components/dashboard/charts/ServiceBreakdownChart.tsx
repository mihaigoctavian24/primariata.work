"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon, AlertCircle } from "lucide-react";
import type { ServiceBreakdownChartProps } from "@/types/dashboard";

/**
 * Service Breakdown Chart - Donut Chart
 *
 * Displays cereri distribution by service type with:
 * - Donut chart visualization
 * - Percentage breakdown
 * - Color-coded segments
 * - Interactive legends
 * - Click handlers for segments
 */
export function ServiceBreakdownChart({
  data,
  isLoading = false,
  onSegmentClick,
}: ServiceBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || !data.breakdown || data.breakdown.length === 0) {
    return (
      <div className="border-border/40 bg-card flex h-[400px] flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
        <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
        <div>
          <p className="text-foreground text-lg font-medium">Nicio cerere înregistrată</p>
          <p className="text-muted-foreground text-sm">
            Statisticile vor apărea după depunerea cererilor
          </p>
        </div>
      </div>
    );
  }

  const { breakdown, total } = data;

  // Prepare data for Recharts
  const chartData = breakdown.map((item) => ({
    name: item.tip_cerere_nume,
    value: item.count,
    percentage: item.percentage,
    color: item.color,
    id: item.tip_cerere_id,
    categorie: item.categorie,
  }));

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-border/40 bg-card chart-card space-y-2 rounded-lg border p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Distribuție Tipuri Cereri</h3>
          <p className="text-muted-foreground text-sm">
            Total: {total} {total === 1 ? "cerere" : "cereri"}
          </p>
        </div>
        <PieChartIcon className="text-primary h-5 w-5" />
      </div>

      {/* Donut Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
              animationBegin={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(data) => onSegmentClick?.(data.id)}
              className={onSegmentClick ? "cursor-pointer" : ""}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  className="transition-opacity duration-200"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown List */}
      <div className="border-border space-y-2 border-t pt-2">
        {breakdown.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.tip_cerere_id}
            initial={mounted ? { opacity: 0, x: -10 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSegmentClick?.(item.tip_cerere_id)}
            className={`group hover:bg-muted/50 flex items-center justify-between rounded-md p-2 transition-colors ${onSegmentClick ? "cursor-pointer" : ""} `}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-foreground text-sm">{item.tip_cerere_nume}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary text-sm font-medium">{item.percentage}%</span>
              <span className="text-muted-foreground text-xs">
                {item.count} {item.count === 1 ? "cerere" : "cereri"}
              </span>
            </div>
          </motion.div>
        ))}
        {breakdown.length > 5 && (
          <p className="text-muted-foreground pt-2 text-center text-xs">
            +{breakdown.length - 5} tipuri suplimentare
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Custom tooltip for donut chart
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: {
      name: string;
      value: number;
      percentage: number;
      color: string;
      id: string;
      categorie?: string;
    };
  }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="border-border bg-card rounded-lg border p-3 shadow-lg">
      <p className="text-foreground mb-2 text-sm font-semibold">{data.name}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Număr cereri:</span>
          <span className="text-foreground font-medium">{data.value}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Procent:</span>
          <span className="text-primary font-medium">{data.percentage}%</span>
        </div>
        {data.categorie && (
          <div className="border-border mt-2 border-t pt-2">
            <span className="text-muted-foreground">Categorie: </span>
            <span className="text-foreground font-medium capitalize">{data.categorie}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function ChartSkeleton() {
  return (
    <div className="border-border/40 bg-card space-y-2 rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-5 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-32 animate-pulse rounded" />
        </div>
      </div>

      <div className="flex h-[200px] items-center justify-center">
        <div className="bg-muted h-40 w-40 animate-pulse rounded-full" />
      </div>

      <div className="border-border space-y-2 border-t pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-3 w-3 animate-pulse rounded-sm" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted h-4 w-12 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
