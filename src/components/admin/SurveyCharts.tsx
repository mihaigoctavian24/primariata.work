"use client";

import { useState, useMemo, useCallback } from "react";
import { InteractiveChart, ChartDataPoint } from "@/components/dashboard/InteractiveChart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown } from "lucide-react";
import { sortData, CHART_COLORS } from "@/lib/chart-utils";
import { toast } from "sonner";

interface SurveyChartsProps {
  respondentTypeData: Array<{ name: string; value: number }>;
  locationData: Array<{ name: string; count: number }>;
  timeSeriesData: Array<{ date: string; count: number }>;
  onFilterChange?: (filter: {
    respondentType?: string;
    location?: string;
    dateRange?: { start: Date; end: Date };
  }) => void;
}

type SortDirection = "asc" | "desc";
type TopLocationCount = 10 | 20 | 50;

export function SurveyCharts({
  respondentTypeData,
  locationData,
  timeSeriesData,
  onFilterChange,
}: SurveyChartsProps) {
  // State for bar chart controls
  const [locationSortKey, setLocationSortKey] = useState<"name" | "count">("count");
  const [locationSortDirection, setLocationSortDirection] = useState<SortDirection>("desc");
  const [topLocationCount, setTopLocationCount] = useState<TopLocationCount>(10);

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<{
    respondentType?: string;
    location?: string;
  }>({});

  // Sort and filter location data
  const sortedLocationData = useMemo(() => {
    const sorted = sortData(locationData, locationSortKey, locationSortDirection);
    return sorted.slice(0, topLocationCount);
  }, [locationData, locationSortKey, locationSortDirection, topLocationCount]);

  // Convert data to chart format
  const pieChartData: ChartDataPoint[] = useMemo(
    () =>
      respondentTypeData.map((item) => ({
        name: item.name,
        value: item.value,
      })),
    [respondentTypeData]
  );

  const barChartData: ChartDataPoint[] = useMemo(
    () =>
      sortedLocationData.map((item) => ({
        name: item.name,
        count: item.count,
      })),
    [sortedLocationData]
  );

  const lineChartData: ChartDataPoint[] = useMemo(
    () =>
      timeSeriesData.map((item) => ({
        date: item.date,
        count: item.count,
      })),
    [timeSeriesData]
  );

  // Handle pie chart click (filter by respondent type)
  const handleRespondentTypeClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (dataPoint: ChartDataPoint, _index: number) => {
      const respondentType = dataPoint.name || "";

      // Toggle filter
      const newFilter =
        activeFilters.respondentType === respondentType ? undefined : respondentType;

      const updatedFilters = {
        ...activeFilters,
        respondentType: newFilter,
      };

      setActiveFilters(updatedFilters);

      if (onFilterChange) {
        onFilterChange(updatedFilters);
      }

      if (newFilter) {
        toast.success(`Filtrat după tip respondent: ${newFilter}`);
      } else {
        toast.info("Filtru tip respondent șters");
      }
    },
    [activeFilters, onFilterChange]
  );

  // Handle bar chart click (filter by location)
  const handleLocationClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (dataPoint: ChartDataPoint, _index: number) => {
      const location = dataPoint.name || "";

      // Toggle filter
      const newFilter = activeFilters.location === location ? undefined : location;

      const updatedFilters = {
        ...activeFilters,
        location: newFilter,
      };

      setActiveFilters(updatedFilters);

      if (onFilterChange) {
        onFilterChange(updatedFilters);
      }

      if (newFilter) {
        toast.success(`Filtrat după localitate: ${newFilter}`);
      } else {
        toast.info("Filtru localitate șters");
      }
    },
    [activeFilters, onFilterChange]
  );

  // Handle line chart click (filter by date)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDateClick = useCallback((dataPoint: ChartDataPoint, _index: number) => {
    const date = dataPoint.date;
    if (!date) return;

    toast.info(`Data selectată: ${date}`);
  }, []);

  // Toggle sort direction
  const toggleSortDirection = () => {
    setLocationSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
    toast.info("Toate filtrele au fost șterse");
  };

  const hasActiveFilters = activeFilters.respondentType || activeFilters.location;

  return (
    <div className="space-y-6">
      {/* Active Filters Banner */}
      {hasActiveFilters && (
        <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Filtre active:</span>
            {activeFilters.respondentType && (
              <span className="rounded-md bg-purple-500/20 px-2 py-1 text-xs font-medium">
                Tip: {activeFilters.respondentType}
              </span>
            )}
            {activeFilters.location && (
              <span className="rounded-md bg-blue-500/20 px-2 py-1 text-xs font-medium">
                Localitate: {activeFilters.location}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Șterge toate
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Respondent Type Distribution */}
        <InteractiveChart
          type="pie"
          data={pieChartData}
          title="Distribuție Tip Respondent"
          description="Click pe un segment pentru a filtra (raport cetățeni vs funcționari publici)"
          height={300}
          dataKey="value"
          xAxisKey="name"
          colors={CHART_COLORS.primary}
          enableExport={true}
          enableZoom={false}
          showLegend={true}
          showGrid={false}
          animate={true}
          onDataPointClick={handleRespondentTypeClick}
          className="border-border bg-card border shadow-sm transition-all hover:shadow-md"
        />

        {/* Bar Chart - Top Locations */}
        <div className="space-y-4">
          {/* Controls */}
          <div className="border-border bg-card flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm">
            <div className="flex-1 space-y-2">
              <Label htmlFor="sort-key" className="text-xs">
                Sortare după
              </Label>
              <Select
                value={locationSortKey}
                onValueChange={(value) => setLocationSortKey(value as "name" | "count")}
              >
                <SelectTrigger id="sort-key" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nume</SelectItem>
                  <SelectItem value="count">Număr răspunsuri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={toggleSortDirection}
              title={`Sortare ${locationSortDirection === "asc" ? "crescătoare" : "descrescătoare"}`}
            >
              {locationSortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>

            <div className="flex-1 space-y-2">
              <Label htmlFor="top-count" className="text-xs">
                Afișează top
              </Label>
              <Select
                value={topLocationCount.toString()}
                onValueChange={(value) => setTopLocationCount(Number(value) as TopLocationCount)}
              >
                <SelectTrigger id="top-count" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart */}
          <InteractiveChart
            type="bar"
            data={barChartData}
            title={`Top ${topLocationCount} Localități`}
            description="Click pe o bară pentru a filtra (cele mai active localități)"
            height={300}
            dataKey="count"
            xAxisKey="name"
            colors={[CHART_COLORS.primary[1] || "#3b82f6"]}
            enableExport={true}
            enableZoom={false}
            showLegend={false}
            showGrid={true}
            animate={true}
            onDataPointClick={handleLocationClick}
            className="border-border bg-card border shadow-sm transition-all hover:shadow-md"
          />
        </div>
      </div>

      {/* Line Chart - Time Series (Full Width) */}
      <InteractiveChart
        type="line"
        data={lineChartData}
        title="Evoluție Răspunsuri în Timp"
        description="Număr de răspunsuri primite pe zile (folosește brush-ul pentru zoom)"
        height={300}
        dataKey="count"
        xAxisKey="date"
        colors={[CHART_COLORS.primary[2] || "#2563eb"]}
        enableExport={true}
        enableZoom={true}
        showLegend={true}
        showGrid={true}
        animate={true}
        onDataPointClick={handleDateClick}
        className="border-border bg-card border shadow-sm transition-all hover:shadow-md"
      />
    </div>
  );
}
