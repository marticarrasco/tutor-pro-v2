"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"

interface RevenueData {
  month: string
  revenue: number
  sessions: number
}

interface RevenueChartProps {
  data: RevenueData[];
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

export const RevenueChart = ({ data, period, onPeriodChange }: RevenueChartProps) => {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#4F46E5", // Indigo
    },
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Your earnings over time</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
