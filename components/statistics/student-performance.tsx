"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { StudentStat } from "@/types/statistics"
import { useCurrency } from "@/components/currency-provider"

interface StudentPerformanceProps {
  studentStats: StudentStat[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

import { useTranslations } from 'next-intl'

export function StudentPerformance({ studentStats, period, onPeriodChange }: StudentPerformanceProps) {
  const t = useTranslations('StatisticsPage.studentPerformance')
  const { formatCurrency } = useCurrency()
  const clvData = [...studentStats].sort((a, b) => b.total_revenue - a.total_revenue)

  const formatHours = (minutes: number) => {
    const hours = minutes / 60
    return hours.toFixed(1)
  }

  const clvChartConfig = {
    total_revenue: {
      label: t('clv'),
      color: "#F59E0B",
    },
  } satisfies Record<string, { label: string; color: string }>

  const clvChartHeight = Math.max(200, Math.min(420, clvData.length * 48))

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
        {studentStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t('noData')}</div>
        ) : (
          <>
            <div className="space-y-4">
              {studentStats.map((student) => (
                <div key={student.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.name}</span>
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? t('active') : t('inactive')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(student.total_revenue)} • {student.total_sessions} {t('sessions')}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">{t('hours')}</div>
                      <div className="font-medium">{formatHours(student.total_hours)}h</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t('avgSession')}</div>
                      <div className="font-medium">{Math.round(student.avg_session_duration)}min</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t('freq')}</div>
                      <div className="font-medium">{student.frequency.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t('rate')}</div>
                      <div className="font-medium">
                        {formatCurrency(
                          student.total_hours > 0
                            ? student.total_revenue / (student.total_hours / 60)
                            : 0
                        )}
                        {t('perHour')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">{t('clvTitle')}</h3>
              <ChartContainer config={clvChartConfig}>
                <ResponsiveContainer width="100%" height={clvChartHeight}>
                  <BarChart
                    data={clvData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 120, bottom: 8 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => formatCurrency(Number(value))}
                    />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" width={140} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [formatCurrency(Number(value)), t('clv')]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="total_revenue" fill={clvChartConfig.total_revenue.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
