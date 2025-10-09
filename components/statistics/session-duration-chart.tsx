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

interface HistogramBin {
  range: string
  count: number
}

const BIN_SIZE = 30

function buildHistogram(values: number[]): HistogramBin[] {
  if (values.length === 0) {
    return []
  }

  const maxDuration = Math.max(...values)
  const binCount = Math.max(1, Math.ceil(maxDuration / BIN_SIZE))
  const bins = Array.from({ length: binCount }, (_, index) => ({
    min: index * BIN_SIZE,
    max: (index + 1) * BIN_SIZE,
    count: 0,
  }))

  values.forEach((duration) => {
    const index = Math.min(Math.floor(duration / BIN_SIZE), binCount - 1)
    bins[index].count += 1
  })

  return bins.map((bin, index) => {
    const isLast = index === bins.length - 1
    let rangeLabel: string
    if (bins.length === 1) {
      rangeLabel = `0-${BIN_SIZE} min`
    } else if (isLast) {
      rangeLabel = `${bin.min}+ min`
    } else {
      rangeLabel = `${bin.min}-${bin.max} min`
    }

    return {
      range: rangeLabel,
      count: bin.count,
    }
  })
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
  const histogram = buildHistogram(data)
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
        {histogram.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No completed sessions for the selected period.
          </div>
        ) : (
          <>
            <ChartContainer
              config={{
                count: {
                  label: "Sessions",
                  color: "hsl(var(--chart-5))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={histogram} margin={{ top: 8, right: 16, left: 16, bottom: 24 }}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value} session${Number(value) === 1 ? "" : "s"}`, "Sessions"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-5))" />
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
