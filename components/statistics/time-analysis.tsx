"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"

interface TimeData {
  day: string
  hours: number
  sessions: number
}

interface TimeAnalysisProps {
  weeklyData: TimeData[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

import { useTranslations } from 'next-intl'

export function TimeAnalysis({ weeklyData, period, onPeriodChange }: TimeAnalysisProps) {
  const t = useTranslations('StatisticsPage.timeAnalysis')
  const chartConfig = {
    hours: {
      label: t('hours'),
      color: "#8B5CF6",
    },
  } satisfies Record<string, { label: string; color: string }>

  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0)
  const avgHoursPerDay = weeklyData.length > 0 ? totalHours / weeklyData.length : 0
  const peakDay = weeklyData.length > 0 ? weeklyData.reduce((max, day) => (day.hours > max.hours ? day : max), weeklyData[0]) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`${Number(value).toFixed(1)} ${t('hours')}`, t('hoursTaught')]}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={chartConfig.hours.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.hours.color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">{t('totalHours')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{avgHoursPerDay.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">{t('avgHoursPerDay')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{peakDay ? `${peakDay.hours.toFixed(1)}h` : "-"}</div>
            <div className="text-sm text-muted-foreground">{t('peakDay')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
