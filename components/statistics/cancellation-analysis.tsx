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
  student: "#8B5CF6",
  teacher: "#10B981",
  other: "#EC4899",
}

import { useTranslations } from 'next-intl'

export function CancellationAnalysis({ data, period, onPeriodChange }: CancellationAnalysisProps) {
  const t = useTranslations('StatisticsPage.cancellationData')
  const totalCancelled = data.byWho.reduce((sum, item) => sum + item.value, 0)
  const studentChartHeight = Math.max(200, Math.min(420, data.byStudent.length * 48))

  const pieData = data.byWho.length > 0 ? data.byWho : []

  const chartConfig = {
    cancellations: {
      label: t('cancellations'),
      color: "#8B5CF6",
    },
  } satisfies Record<string, { label: string; color: string }>

  const getTranslatedName = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName === 'student') return t('byStudent')
    if (lowerName === 'teacher') return t('byTeacher')
    return name
  }

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
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">{t('overallRate')}</div>
            <div className="text-3xl font-bold">{data.overallRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{t('totalCancelled')}</div>
            <div className="text-3xl font-bold">{totalCancelled}</div>
          </div>
        </div>
        {pieData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('noData')}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData as any[]}
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
                      return [`${value} (${Number(percentage).toFixed(1)}%)`, getTranslatedName(name as string)]
                    }}
                  />
                  <Legend formatter={(value) => getTranslatedName(value)} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div>
              <h3 className="text-sm font-medium mb-3">{t('rateByStudent')}</h3>
              {data.byStudent.length === 0 ? (
                <div className="text-sm text-muted-foreground">{t('noStudentCancellations')}</div>
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
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" width={140} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${Number(value).toFixed(1)}%`, t('cancellationRate')]}
                        labelFormatter={(label, payload) => {
                          const totalSessions = payload?.[0]?.payload?.totalSessions || 0
                          const cancelledSessions = payload?.[0]?.payload?.cancelledSessions || 0
                          return `${label} • ${cancelledSessions}/${totalSessions} ${t('cancelled')}`
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
