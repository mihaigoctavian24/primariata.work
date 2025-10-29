"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { modalContent, fadeIn } from "@/lib/animations";
import { ColorScheme } from "./MetricCard";

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BreakdownItem {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface MetricDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentValue: number;
  previousValue?: number;
  trend?: "up" | "down" | "stable";
  colorScheme?: ColorScheme;
  icon?: ReactNode;
  historicalData?: TimeSeriesDataPoint[];
  breakdown?: BreakdownItem[];
  description?: string;
  onExport?: () => void;
  format?: "number" | "percentage" | "currency";
  prefix?: string;
  suffix?: string;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function MetricDetailsModal({
  open,
  onOpenChange,
  title,
  currentValue,
  previousValue,
  trend,
  icon,
  historicalData = [],
  breakdown = [],
  description,
  onExport,
  format = "number",
  prefix = "",
  suffix = "",
}: MetricDetailsModalProps) {
  // Calculate percentage change
  const percentageChange =
    previousValue && previousValue !== 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

  // Determine trend icon
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  // Format value
  const formatValue = (value: number) => {
    let displaySuffix = suffix;
    let displayPrefix = prefix;
    if (format === "percentage") {
      displaySuffix = "%";
    } else if (format === "currency") {
      displayPrefix = "RON ";
    }
    return `${displayPrefix}${value}${displaySuffix}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: "transform, opacity" }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {icon && <div className="bg-primary/10 text-primary rounded-lg p-3">{icon}</div>}
                  <div>
                    <DialogTitle className="text-2xl">{title}</DialogTitle>
                    {description && (
                      <DialogDescription className="mt-1">{description}</DialogDescription>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Current Metrics */}
                <motion.div
                  variants={fadeIn}
                  className="bg-card rounded-lg border p-6"
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Current Value</p>
                      <p className="mt-2 text-4xl font-bold">{formatValue(currentValue)}</p>
                    </div>
                    {previousValue !== undefined && percentageChange !== 0 && (
                      <Badge
                        variant={
                          trend === "up"
                            ? "default"
                            : trend === "down"
                              ? "destructive"
                              : "secondary"
                        }
                        className="gap-2 text-base"
                      >
                        <TrendIcon className="h-4 w-4" />
                        <span>{Math.abs(percentageChange).toFixed(1)}%</span>
                      </Badge>
                    )}
                  </div>
                  {previousValue !== undefined && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Previous: {formatValue(previousValue)}
                    </p>
                  )}
                </motion.div>

                {/* Historical Data Chart */}
                {historicalData.length > 0 && (
                  <motion.div
                    variants={fadeIn}
                    className="bg-card rounded-lg border p-6"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold">Historical Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" tick={{ fill: "currentColor" }} />
                        <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                          formatter={(value: number) => [formatValue(value), "Value"]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          activeDot={{ r: 6 }}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Breakdown Section */}
                {breakdown.length > 0 && (
                  <motion.div
                    variants={fadeIn}
                    className="bg-card rounded-lg border p-6"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="mb-4 text-lg font-semibold">Breakdown by Category</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Bar Chart */}
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={breakdown}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: "currentColor" }}
                          />
                          <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [formatValue(value), "Count"]}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Pie Chart */}
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={breakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percentage }) =>
                              `${name}: ${percentage ? percentage.toFixed(1) : 0}%`
                            }
                            animationDuration={1000}
                          >
                            {breakdown.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [formatValue(value), "Count"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Breakdown List */}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {breakdown.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  item.color || CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground text-sm">
                              {item.percentage ? `${item.percentage.toFixed(1)}%` : ""}
                            </span>
                            <span className="font-semibold">{formatValue(item.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Export Button */}
                {onExport && (
                  <motion.div
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    className="flex justify-end"
                  >
                    <Button onClick={onExport} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Data
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

MetricDetailsModal.displayName = "MetricDetailsModal";
