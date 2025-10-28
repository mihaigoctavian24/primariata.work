"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SurveyChartsProps {
  respondentTypeData: Array<{ name: string; value: number }>;
  locationData: Array<{ name: string; count: number }>;
  timeSeriesData: Array<{ date: string; count: number }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function SurveyCharts({
  respondentTypeData,
  locationData,
  timeSeriesData,
}: SurveyChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Respondent Type Distribution */}
      <Card className="via-card to-card border-none bg-gradient-to-br from-purple-500/10 shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 to-transparent">
          <CardTitle className="text-lg font-bold">Distribuție Tip Respondent</CardTitle>
          <CardDescription>Raport cetățeni vs funcționari publici</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={respondentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {respondentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Locations */}
      <Card className="via-card to-card border-none bg-gradient-to-br from-blue-500/10 shadow-lg transition-all hover:shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardTitle className="text-lg font-bold">Top 10 Localități</CardTitle>
          <CardDescription>Cele mai active localități</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Series - Responses over time */}
      <Card className="via-card to-card border-none bg-gradient-to-br from-green-500/10 shadow-lg transition-all hover:shadow-xl md:col-span-2">
        <CardHeader className="border-b bg-gradient-to-r from-green-500/5 to-transparent">
          <CardTitle className="text-lg font-bold">Evoluție Răspunsuri în Timp</CardTitle>
          <CardDescription>Număr de răspunsuri primite pe zile</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
