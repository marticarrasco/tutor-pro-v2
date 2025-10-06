"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface TimeData {
  day: string
  hours: number
  sessions: number
}

interface TimeAnalysisProps {
  weeklyData: TimeData[]
}

export function TimeAnalysis({ weeklyData }: TimeAnalysisProps) {
  const chartConfig = {
    hours: {
      label: "Hours",
      color: "hsl(var(--chart-1))",
    },
  }

  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const avgHoursPerDay = totalHours / weeklyData.length
  const peakDay = weeklyData.reduce((max, day) => (day.hours > max.hours ? day : max), weeklyData[0])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Time Distribution</CardTitle>
        <CardDescription>Hours taught per day over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${Number(value).toFixed(1)} hours`, "Hours Taught"]}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="var(--color-hours)"
                strokeWidth={2}
                dot={{ fill: "var(--color-hours)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{avgHoursPerDay.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Daily Average</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{peakDay?.day || "N/A"}</div>
            <div className="text-sm text-muted-foreground">Peak Day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
