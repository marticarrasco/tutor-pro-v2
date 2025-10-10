"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { StudentStat } from "@/types/statistics"

interface StudentPerformanceProps {
  studentStats: StudentStat[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

export function StudentPerformance({ studentStats, period, onPeriodChange }: StudentPerformanceProps) {
  const clvData = [...studentStats].sort((a, b) => b.total_revenue - a.total_revenue)

  const formatHours = (minutes: number) => {
    const hours = minutes / 60
    return hours.toFixed(1)
  }

  const clvChartConfig = {
    total_revenue: {
      label: "CLV",
      color: "#F59E0B",
    },
  } satisfies Record<string, { label: string; color: string }>

  const clvChartHeight = Math.max(200, Math.min(420, clvData.length * 48))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>Revenue and session statistics by student</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {studentStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No student data available</div>
        ) : (
          <>
            <div className="space-y-4">
              {studentStats.map((student) => (
                <div key={student.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.name}</span>
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${student.total_revenue.toFixed(2)} • {student.total_sessions} sessions
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Hours</div>
                      <div className="font-medium">{formatHours(student.total_hours)}h</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Session</div>
                      <div className="font-medium">{Math.round(student.avg_session_duration)}min</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Freq. (sess./mo)</div>
                      <div className="font-medium">{student.frequency.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rate</div>
                      <div className="font-medium">
                        ${
                          student.total_hours > 0
                            ? (student.total_revenue / (student.total_hours / 60)).toFixed(0)
                            : "0"
                        }
                        /hr
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Student Lifetime Value (CLV)</h3>
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
                      tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                    />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" width={140} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "CLV"]}
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
