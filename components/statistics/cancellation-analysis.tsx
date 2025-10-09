"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"
import { CancellationData } from "@/types/statistics"

interface CancellationAnalysisProps {
  data: CancellationData
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

const CANCEL_COLORS: Record<string, string> = {
  student: "hsl(var(--chart-1))",
  teacher: "hsl(var(--chart-2))",
  other: "hsl(var(--chart-4))",
}

export function CancellationAnalysis({ data, period, onPeriodChange }: CancellationAnalysisProps) {
  const totalCancelled = data.byWho.reduce((sum, item) => sum + item.value, 0)
  const studentChartHeight = Math.max(200, Math.min(420, data.byStudent.length * 48))

  const pieData = data.byWho.length > 0 ? data.byWho : []

  const chartConfig = {
    cancellations: {
      label: "Cancellations",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cancellation Analysis</CardTitle>
            <CardDescription>Understand who cancels sessions and how it affects students</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Overall cancellation rate</div>
            <div className="text-3xl font-bold">{data.overallRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total cancellations</div>
            <div className="text-3xl font-bold">{totalCancelled}</div>
          </div>
        </div>
        {pieData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No cancellation data for the selected period.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry) => {
                      const key = entry.name.toLowerCase()
                      return <Cell key={entry.name} fill={CANCEL_COLORS[key] || CANCEL_COLORS.other} />
                    })}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name, payload) => {
                      const percentage = payload?.payload?.percentage ?? 0
                      return [`${value} (${Number(percentage).toFixed(1)}%)`, name as string]
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div>
              <h3 className="text-sm font-medium mb-3">Cancellation rate by student</h3>
              {data.byStudent.length === 0 ? (
                <div className="text-sm text-muted-foreground">No student cancellations in this period.</div>
              ) : (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={studentChartHeight}>
                    <BarChart
                      data={data.byStudent}
                      layout="vertical"
                      margin={{ top: 8, right: 16, left: 120, bottom: 8 }}
                    >
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={140} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, "Cancellation rate"]}
                        labelFormatter={(label, payload) => {
                          const totalSessions = payload?.[0]?.payload?.totalSessions || 0
                          const cancelledSessions = payload?.[0]?.payload?.cancelledSessions || 0
                          return `${label} • ${cancelledSessions}/${totalSessions} cancelled`
                        }}
                      />
                      <Bar dataKey="cancellationRate" fill={chartConfig.cancellations.color} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
