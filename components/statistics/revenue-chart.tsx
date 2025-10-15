"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"

interface RevenueData {
  month: string
  revenue: number
  sessions: number
}

interface RevenueChartProps {
  data: RevenueData[];
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

interface StudentRevenue {
  studentName: string
  revenue: number
  sessions: number
}

interface WeekRevenue {
  week: string
  revenue: number
  sessions: number
}

interface MonthDetail {
  month: string
  totalRevenue: number
  totalSessions: number
  studentBreakdown: StudentRevenue[]
  weekBreakdown: WeekRevenue[]
}

export const RevenueChart = ({ data, period, onPeriodChange }: RevenueChartProps) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthDetail | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#8B5CF6",
    },
  } satisfies Record<string, { label: string; color: string }>;

  const fetchMonthDetails = async (monthStr: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      // Parse month string (e.g., "Jan 2024" or "2024-01")
      const monthDate = new Date(monthStr + "-01")
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      // Get start and end of month
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)

      // Fetch sessions for the month with student info
      const { data: sessions, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          id,
          date,
          total_amount,
          student_id,
          students (
            name
          )
        `)
        .eq("user_id", user.id)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .order("date")

      if (error) throw error

      // Calculate student breakdown
      const studentMap = new Map<string, { revenue: number; sessions: number }>()
      sessions?.forEach((session: any) => {
        const studentName = session.students?.name || "Unknown Student"
        const existing = studentMap.get(studentName) || { revenue: 0, sessions: 0 }
        studentMap.set(studentName, {
          revenue: existing.revenue + session.total_amount,
          sessions: existing.sessions + 1,
        })
      })

      const studentBreakdown: StudentRevenue[] = Array.from(studentMap.entries())
        .map(([studentName, data]) => ({
          studentName,
          revenue: data.revenue,
          sessions: data.sessions,
        }))
        .sort((a, b) => b.revenue - a.revenue)

      // Calculate week breakdown
      const weekMap = new Map<string, { revenue: number; sessions: number }>()
      sessions?.forEach((session: any) => {
        const sessionDate = new Date(session.date)
        const weekStart = new Date(sessionDate)
        weekStart.setDate(sessionDate.getDate() - sessionDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        const weekLabel = `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString("en-US", { month: "short" })}`
        const existing = weekMap.get(weekLabel) || { revenue: 0, sessions: 0 }
        weekMap.set(weekLabel, {
          revenue: existing.revenue + session.total_amount,
          sessions: existing.sessions + 1,
        })
      })

      const weekBreakdown: WeekRevenue[] = Array.from(weekMap.entries())
        .map(([week, data]) => ({
          week,
          revenue: data.revenue,
          sessions: data.sessions,
        }))

      const totalRevenue = sessions?.reduce((sum, s: any) => sum + s.total_amount, 0) || 0
      const totalSessions = sessions?.length || 0

      setSelectedMonth({
        month: monthStr,
        totalRevenue,
        totalSessions,
        studentBreakdown,
        weekBreakdown,
      })
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching month details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarClick = (data: any) => {
    if (data && data.month) {
      fetchMonthDetails(data.month)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Your earnings over time</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Bar 
                dataKey="revenue" 
                fill={chartConfig.revenue.color} 
                radius={[4, 4, 0, 0]}
                onClick={handleBarClick}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revenue Details - {selectedMonth?.month}</DialogTitle>
            <DialogDescription>
              Detailed breakdown by student and by week
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-primary/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/10 animate-ping" />
              </div>
              <div className="text-sm text-muted-foreground animate-pulse">Loading revenue details...</div>
            </div>
          ) : selectedMonth ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${selectedMonth.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedMonth.totalSessions}</div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Student */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Revenue by Student</h3>
                <div className="space-y-2">
                  {selectedMonth.studentBreakdown.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.sessions} session{student.sessions !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-lg font-semibold">${student.revenue.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Week */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Revenue by Week</h3>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={selectedMonth.weekBreakdown}>
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill={chartConfig.revenue.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
