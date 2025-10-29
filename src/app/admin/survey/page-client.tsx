"use client";

import { useState, lazy, Suspense } from "react";
import { Users, FileText, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useMetricsData } from "@/hooks/useMetricsData";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

// Lazy load heavy components
const MetricDetailsModal = lazy(() =>
  import("@/components/dashboard/MetricDetailsModal").then((mod) => ({
    default: mod.MetricDetailsModal,
  }))
);

type MetricType =
  | "totalResponses"
  | "completedResponses"
  | "citizenResponses"
  | "officialResponses";

interface MetricConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorScheme: "blue" | "green" | "purple" | "orange";
  format?: "number" | "percentage" | "currency";
}

const METRIC_CONFIGS: Record<MetricType, MetricConfig> = {
  totalResponses: {
    title: "Total Răspunsuri",
    description: "Răspunsuri primite în ultimele 7 zile",
    icon: <Users className="h-4 w-4" />,
    colorScheme: "blue",
    format: "number",
  },
  completedResponses: {
    title: "Completate",
    description: "Chestionare finalizate",
    icon: <CheckCircle className="h-4 w-4" />,
    colorScheme: "green",
    format: "number",
  },
  citizenResponses: {
    title: "Cetățeni",
    description: "Răspunsuri de la cetățeni",
    icon: <Users className="h-4 w-4" />,
    colorScheme: "purple",
    format: "number",
  },
  officialResponses: {
    title: "Funcționari",
    description: "Răspunsuri de la funcționari publici",
    icon: <FileText className="h-4 w-4" />,
    colorScheme: "orange",
    format: "number",
  },
};

export function AdminSurveyMetrics() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useMetricsData();

  const handleMetricClick = (metric: MetricType) => {
    setSelectedMetric(metric);
    setModalOpen(true);
  };

  const handleExport = () => {
    if (!selectedMetric || !data) return;

    const metricData = data[selectedMetric];
    const config = METRIC_CONFIGS[selectedMetric];

    // Create CSV content
    const csvContent = [
      ["Metric", "Value"],
      ["Name", config.title],
      ["Current Value", metricData.current.toString()],
      ["Previous Value", metricData.previous.toString()],
      ["Trend", metricData.trend],
      [""],
      ["Historical Data"],
      ["Date", "Value"],
      ...metricData.historicalData.map((d) => [d.date, d.value.toString()]),
      [""],
      ["Breakdown"],
      ["Category", "Value", "Percentage"],
      ...metricData.breakdown.map((b) => [
        b.name,
        b.value.toString(),
        `${b.percentage.toFixed(1)}%`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMetric}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isError) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
        <p className="text-destructive font-medium">
          Failed to load metrics: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {(Object.keys(METRIC_CONFIGS) as MetricType[]).map((metricType) => {
          const config = METRIC_CONFIGS[metricType];
          const metricData = data?.[metricType];

          return (
            <motion.div key={metricType} variants={staggerItem}>
              <MetricCard
                title={config.title}
                value={metricData?.current || 0}
                previousValue={metricData?.previous}
                trend={metricData?.trend}
                sparklineData={metricData?.sparklineData}
                onClick={() => handleMetricClick(metricType)}
                icon={config.icon}
                colorScheme={config.colorScheme}
                isLoading={isLoading}
                description={config.description}
                format={config.format}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Metric Details Modal - Lazy Loaded */}
      {selectedMetric && data && (
        <Suspense fallback={<div className="bg-background/80 fixed inset-0 backdrop-blur-sm" />}>
          <MetricDetailsModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title={METRIC_CONFIGS[selectedMetric].title}
            currentValue={data[selectedMetric].current}
            previousValue={data[selectedMetric].previous}
            trend={data[selectedMetric].trend}
            colorScheme={METRIC_CONFIGS[selectedMetric].colorScheme}
            icon={METRIC_CONFIGS[selectedMetric].icon}
            historicalData={data[selectedMetric].historicalData}
            breakdown={data[selectedMetric].breakdown}
            description={METRIC_CONFIGS[selectedMetric].description}
            onExport={handleExport}
            format={METRIC_CONFIGS[selectedMetric].format}
          />
        </Suspense>
      )}
    </>
  );
}
