"use client";

import { useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Maximize2, FileImage, FileCode } from "lucide-react";
import { exportChartAsPNG, exportChartAsSVG, CHART_COLORS } from "@/lib/chart-utils";
import { useChartInteractions } from "@/hooks/useChartInteractions";

export type ChartType = "line" | "bar" | "area" | "pie" | "donut";

export interface ChartDataPoint {
  label?: string;
  name?: string;
  value?: number;
  count?: number;
  date?: string;
  [key: string]: string | number | undefined;
}

export interface InteractiveChartProps {
  type: ChartType;
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  isLoading?: boolean;
  className?: string;
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  enableZoom?: boolean;
  enableExport?: boolean;
  comparisonMode?: boolean;
  comparisonData?: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}

export function InteractiveChart({
  type,
  data,
  title,
  description,
  height = 300,
  isLoading,
  className,
  onDataPointClick,
  enableZoom = false,
  enableExport = true,
  comparisonMode = false,
  comparisonData,
  dataKey = "value",
  xAxisKey = "name",
  colors = CHART_COLORS.primary,
  showLegend = true,
  showGrid = true,
  animate = true,
}: InteractiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { zoomRange, resetZoom } = useChartInteractions({
    onPointClick: (point) => {
      const index = data.findIndex((d) => d[xAxisKey] === point.label);
      const dataPoint = data[index];
      if (index !== -1 && dataPoint && onDataPointClick) {
        onDataPointClick(dataPoint, index);
      }
    },
    enableTooltip: true,
  });

  const handleExport = async (format: "png" | "svg") => {
    if (!chartRef.current) return;

    setIsExporting(true);
    try {
      const filename = `${title?.toLowerCase().replace(/\s+/g, "-") || "chart"}`;
      if (format === "png") {
        await exportChartAsPNG(chartRef.current, { filename });
      } else {
        exportChartAsSVG(chartRef.current, { filename });
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLegendClick = (dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) {
        next.delete(dataKey);
      } else {
        next.add(dataKey);
      }
      return next;
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="border-border bg-card rounded-lg border p-3 shadow-lg">
        <p className="mb-1 font-semibold">{label || payload[0]?.name}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    const handlePieClick = (_: unknown, index: number) => {
      if (onDataPointClick && data[index]) {
        onDataPointClick(data[index], index);
      }
    };

    switch (type) {
      case "pie":
      case "donut":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={type === "donut" ? 90 : 100}
              innerRadius={type === "donut" ? 60 : 0}
              fill="#8884d8"
              dataKey={dataKey}
              onClick={handlePieClick}
              animationBegin={0}
              animationDuration={animate ? 800 : 0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend onClick={(e) => handleLegendClick(e.value)} />}
          </PieChart>
        );

      case "bar":
        return (
          <BarChart data={data} onClick={handlePieClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend onClick={(e) => handleLegendClick(e.value)} />}
            <Bar
              dataKey={dataKey}
              fill={colors[0]}
              radius={[8, 8, 0, 0]}
              className="cursor-pointer transition-opacity hover:opacity-80"
              animationBegin={0}
              animationDuration={animate ? 800 : 0}
              hide={hiddenSeries.has(dataKey)}
            />
            {comparisonMode && comparisonData && (
              <Bar
                dataKey="comparison"
                data={comparisonData}
                fill={colors[1]}
                radius={[8, 8, 0, 0]}
                animationBegin={0}
                animationDuration={animate ? 800 : 0}
                hide={hiddenSeries.has("comparison")}
              />
            )}
            {enableZoom && <Brush dataKey={xAxisKey} height={30} stroke={colors[0]} />}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend onClick={(e) => handleLegendClick(e.value)} />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={3}
              activeDot={{ r: 8 }}
              dot={{ r: 4 }}
              animationBegin={0}
              animationDuration={animate ? 800 : 0}
              hide={hiddenSeries.has(dataKey)}
            />
            {comparisonMode && comparisonData && (
              <Line
                type="monotone"
                dataKey="comparison"
                data={comparisonData}
                stroke={colors[1]}
                strokeWidth={3}
                strokeDasharray="5 5"
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
                animationBegin={0}
                animationDuration={animate ? 800 : 0}
                hide={hiddenSeries.has("comparison")}
              />
            )}
            {enableZoom && <Brush dataKey={xAxisKey} height={30} stroke={colors[0]} />}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis dataKey={xAxisKey} fontSize={12} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend onClick={(e) => handleLegendClick(e.value)} />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
              strokeWidth={2}
              animationBegin={0}
              animationDuration={animate ? 800 : 0}
              hide={hiddenSeries.has(dataKey)}
            />
            {comparisonMode && comparisonData && (
              <Area
                type="monotone"
                dataKey="comparison"
                data={comparisonData}
                stroke={colors[1]}
                fill={colors[1]}
                fillOpacity={0.2}
                strokeWidth={2}
                animationBegin={0}
                animationDuration={animate ? 800 : 0}
                hide={hiddenSeries.has("comparison")}
              />
            )}
            {enableZoom && <Brush dataKey={xAxisKey} height={30} stroke={colors[0]} />}
          </AreaChart>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle className="text-lg font-bold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div
            className="bg-muted flex animate-pulse items-center justify-center rounded-lg"
            style={{ height: `${height}px` }}
          >
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          {title && <CardTitle className="text-lg font-bold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {enableExport && (
          <div className="flex items-center gap-2">
            {enableZoom && zoomRange && (
              <Button variant="outline" size="icon" onClick={resetZoom} title="Reset zoom">
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={isExporting} title="Export chart">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleExport("png")}
                  disabled={isExporting}
                  className="cursor-pointer"
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Export ca PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("svg")}
                  disabled={isExporting}
                  className="cursor-pointer"
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  Export ca SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={height}>
            {renderChart() || <div>No chart available</div>}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

InteractiveChart.displayName = "InteractiveChart";
