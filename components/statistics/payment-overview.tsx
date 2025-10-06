"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface PaymentData {
  name: string
  value: number
  amount: number
}

interface PaymentOverviewProps {
  paymentData: PaymentData[]
}

const COLORS = {
  paid: "hsl(var(--chart-1))",
  unpaid: "hsl(var(--chart-2))",
}

export function PaymentOverview({ paymentData }: PaymentOverviewProps) {
  const chartConfig = {
    paid: {
      label: "Paid",
      color: COLORS.paid,
    },
    unpaid: {
      label: "Unpaid",
      color: COLORS.unpaid,
    },
  }

  const totalAmount = paymentData.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>Overview of paid vs unpaid sessions</CardDescription>
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
  )
}
