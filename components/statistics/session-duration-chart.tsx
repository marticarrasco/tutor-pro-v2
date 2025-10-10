"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"

interface SessionDurationChartProps {
  data: number[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

interface DurationData {
  duration: string
  durationValue: number
  count: number
}

function buildDistribution(values: number[]): DurationData[] {
  if (values.length === 0) {
    return []
  }

  // Count frequency of each duration
  const frequencyMap = new Map<number, number>()
  values.forEach((duration) => {
    frequencyMap.set(duration, (frequencyMap.get(duration) || 0) + 1)
  })

  // Convert to array and sort by duration
  const distribution = Array.from(frequencyMap.entries())
    .map(([duration, count]) => ({
      duration: `${duration}`,
      durationValue: duration,
      count,
    }))
    .sort((a, b) => a.durationValue - b.durationValue)

  return distribution
}

function calculateSummary(values: number[]) {
  if (values.length === 0) {
    return { average: 0, median: 0, max: 0 }
  }

  const sum = values.reduce((total, value) => total + value, 0)
  const average = sum / values.length
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 !== 0 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
  const max = sorted[sorted.length - 1]

  return {
    average,
    median,
    max,
  }
}

export function SessionDurationChart({ data, period, onPeriodChange }: SessionDurationChartProps) {
  const distribution = buildDistribution(data)
  const summary = calculateSummary(data)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Session Duration Distribution</CardTitle>
            <CardDescription>How long your lessons typically last</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {distribution.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed sessions for the selected period.
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                count: {
                  label: "Sessions",
                  color: "#F97316",
                },
              }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={distribution} margin={{ top: 8, right: 16, left: 16, bottom: 24 }}>
                  <XAxis 
                    dataKey="duration" 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--muted-foreground))" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    interval={Math.ceil(distribution.length / 15)}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    axisLine={false} 
                    tickLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value} session${Number(value) === 1 ? "" : "s"}`, "Frequency"]}
                    labelFormatter={(label) => `${label} minutes`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{summary.average.toFixed(0)} min</div>
                <div className="text-sm text-muted-foreground">Average duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.median.toFixed(0)} min</div>
                <div className="text-sm text-muted-foreground">Median duration</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.max.toFixed(0)} min</div>
                <div className="text-sm text-muted-foreground">Longest session</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
