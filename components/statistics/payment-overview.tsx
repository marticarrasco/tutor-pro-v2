"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"

interface PaymentData {
  name: string
  value: number
  amount: number
  [key: string]: string | number
}

interface PaymentOverviewProps {
  paymentData: PaymentData[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

const COLORS = {
  paid: "#22C55E", // Green
  unpaid: "#EF4444", // Red
}

export const PaymentOverview: React.FC<PaymentOverviewProps> = ({ paymentData, period, onPeriodChange }) => {
  const chartConfig = {
    paid: {
      label: "Paid",
      color: COLORS.paid,
    },
    unpaid: {
      label: "Unpaid",
      color: COLORS.unpaid,
    },
  };

  const totalAmount = paymentData.reduce((sum, item) => sum + item.amount, 0);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Overview of paid vs unpaid sessions</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="amount"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === "Paid" ? COLORS.paid : COLORS.unpaid} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {paymentData.map((item) => (
            <div key={item.name} className="text-center">
              <div className="text-2xl font-bold">${item.amount.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                {item.name} ({item.value} sessions)
              </div>
              <div className="text-xs text-muted-foreground">
                {totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
