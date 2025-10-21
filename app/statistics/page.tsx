"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, DollarSign, Clock, Users, CalendarDays } from "lucide-react"
import { useDocumentTitle, useDocumentMeta } from "@/hooks/use-document-title"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RevenueChart } from "@/components/statistics/revenue-chart"
import { StudentPerformance } from "@/components/statistics/student-performance"
import { PaymentOverview } from "@/components/statistics/payment-overview"
import { TimeAnalysis } from "@/components/statistics/time-analysis"
import { CancellationAnalysis } from "@/components/statistics/cancellation-analysis"
import { SessionDurationChart } from "@/components/statistics/session-duration-chart"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { ExportDialog } from "@/components/export/export-dialog"
import { ChartPeriod } from "@/components/statistics/chart-period-selector"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import {
  CancellationData,
  PaymentOverviewData,
  StudentInfo,
  StudentStat,
} from "@/types/statistics"

interface OverallStats {
  totalRevenue: number
  totalSessions: number
  totalHours: number
  activeStudents: number
  avgHourlyRate: number
  unpaidAmount: number
}

export default function StatisticsPage() {
  useDocumentTitle("Statistics & Analytics")
  useDocumentMeta("Monitor revenue trends, student performance, and teaching hours with comprehensive analytics. Understand how your tutoring business is evolving.")
  
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalRevenue: 0,
    totalSessions: 0,
    totalHours: 0,
    activeStudents: 0,
    avgHourlyRate: 0,
    unpaidAmount: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [studentStats, setStudentStats] = useState<StudentStat[]>([])
  const [paymentData, setPaymentData] = useState<PaymentOverviewData>({
    overview: [],
    byStudent: [],
  })
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [cancellationData, setCancellationData] = useState<CancellationData>({
    overallRate: 0,
    byWho: [],
    byStudent: [],
  })
  const [sessionDurationData, setSessionDurationData] = useState<number[]>([])
  
  // Individual period states for each chart
  const [revenuePeriod, setRevenuePeriod] = useState<ChartPeriod>({ type: "3months" })
  const [paymentPeriod, setPaymentPeriod] = useState<ChartPeriod>({ type: "3months" })
  const [timePeriod, setTimePeriod] = useState<ChartPeriod>({ type: "week" })
  const [studentPeriod, setStudentPeriod] = useState<ChartPeriod>({ type: "3months" })
  const [cancellationPeriod, setCancellationPeriod] = useState<ChartPeriod>({ type: "3months" })
  const [durationPeriod, setDurationPeriod] = useState<ChartPeriod>({ type: "3months" })

  // Helper to get date range from period
  const getDateRange = (period: ChartPeriod): { startDate: Date; endDate: Date } => {
    if (period.type === "all") {
      // Use earliest possible date for all time
      return {
        startDate: new Date(2000, 0, 1), // or earliest data in DB
        endDate: new Date(),
      }
    }

    const endDate = new Date()
    const startDate = new Date()

    if (period.type === "custom" && period.customRange) {
      return {
        startDate: period.customRange.from,
        endDate: period.customRange.to,
      }
    }

    switch (period.type) {
      case "week": {
        // Set startDate to previous Monday
        const day = endDate.getDay() === 0 ? 7 : endDate.getDay(); // Sunday as 7
        startDate.setDate(endDate.getDate() - (day - 1));
        // Set endDate to next Sunday
        endDate.setDate(startDate.getDate() + 6);
        break;
      }
      case "month":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(endDate.getMonth() - 3)
        break
    }

    return { startDate, endDate }
  }

  const fetchStudents = useCallback(async (): Promise<StudentInfo[]> => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email")
        .eq("is_active", true)
        .eq("user_id", user.id)

      if (error) throw error

      // Ensure email is always a string (default to empty string if undefined or null)
      const studentsData = (data || []).map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email ? student.email : ""
      })) as StudentInfo[]
      setStudents(studentsData)
      return studentsData
    } catch (error) {
      console.error("Error fetching students:", error)
      return []
    }
  }, [])

  const fetchOverallStats = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      // Get all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("tutoring_sessions")
        .select("duration_minutes, total_amount, is_paid, student_id")
        .eq("user_id", user.id)

      if (sessionsError) throw sessionsError

      // Get active students count
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, hourly_rate")
        .eq("is_active", true)
        .eq("user_id", user.id)

      if (studentsError) throw studentsError

      const totalSessions = sessions?.length || 0
      const totalRevenue = sessions?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      const totalHours = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) / 60 || 0
      const unpaidAmount = sessions?.filter((s) => !s.is_paid).reduce((sum, s) => sum + s.total_amount, 0) || 0
      const avgHourlyRate = students?.reduce((sum, s) => sum + s.hourly_rate, 0) / (students?.length || 1) || 0

      setOverallStats({
        totalRevenue,
        totalSessions,
        totalHours,
        activeStudents: students?.length || 0,
        avgHourlyRate,
        unpaidAmount,
      })
    } catch (error) {
      console.error("Error fetching overall stats:", error)
      toast({
        title: "Error",
        description: "Failed to load statistics. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchRevenueData = useCallback(async (period: ChartPeriod) => {
    try {
      const supabase = createClient()
      const { startDate, endDate } = getDateRange(period)
      const user = await requireAuthUser(supabase)
      if (period.type === "3months") {
        startDate.setMonth(startDate.getMonth() - 3)
      } else if (period.type === "month") {
        startDate.setMonth(startDate.getMonth() - 1)
      }

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("date, total_amount")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .eq("user_id", user.id)
        .order("date")

      if (error) throw error

      // Group by month
      const monthlyData: { [key: string]: { revenue: number; sessions: number } } = {}

      data?.forEach((session) => {
        const date = new Date(session.date)
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, sessions: 0 }
        }

        monthlyData[monthKey].revenue += session.total_amount
        monthlyData[monthKey].sessions += 1
      })

      const chartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        sessions: data.sessions,
      }))

      setRevenueData(chartData)
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    }
  }, [])

  const fetchStudentStats = useCallback(async (period: ChartPeriod) => {
    try {
      const supabase = createClient()
      const { startDate, endDate } = getDateRange(period)
      const user = await requireAuthUser(supabase)

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          is_active,
          tutoring_sessions!inner(duration_minutes, total_amount, date)
        `)
        .eq("user_id", user.id)

      if (error) throw error

      const studentStats = data
        ?.map((student: any) => {
          // Filter sessions by date range
          const sessions = (student.tutoring_sessions || []).filter((s: any) => {
            const sessionDate = new Date(s.date)
            return sessionDate >= startDate && sessionDate <= endDate
          })

          const totalSessions = sessions.length
          const totalRevenue = sessions.reduce((sum: number, s: any) => sum + s.total_amount, 0)
          const totalHours = sessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0)
          const avgSessionDuration = totalSessions > 0 ? totalHours / totalSessions : 0
          const uniqueMonths = new Set(
            sessions.map((session: any) => {
              const date = new Date(session.date)
              return `${date.getFullYear()}-${date.getMonth()}`
            }),
          )
          const frequency = uniqueMonths.size > 0 ? totalSessions / uniqueMonths.size : 0

          return {
            id: student.id,
            name: student.name,
            is_active: student.is_active,
            total_sessions: totalSessions,
            total_revenue: totalRevenue,
            total_hours: totalHours,
            avg_session_duration: avgSessionDuration,
            frequency,
          }
        })
        .filter((s: any) => s.total_sessions > 0)
        .sort((a: any, b: any) => b.total_revenue - a.total_revenue)

      setStudentStats((studentStats as StudentStat[]) || [])
    } catch (error) {
      console.error("Error fetching student stats:", error)
    }
  }, [])

  const fetchPaymentData = useCallback(
    async (period: ChartPeriod, studentList?: StudentInfo[]) => {
      try {
        const supabase = createClient()
        const { startDate, endDate } = getDateRange(period)
        const user = await requireAuthUser(supabase)

        const { data, error } = await supabase
          .from("tutoring_sessions")
          .select("is_paid, total_amount, student_id")
          .gte("date", startDate.toISOString().split("T")[0])
          .lte("date", endDate.toISOString().split("T")[0])
          .eq("user_id", user.id)

        if (error) throw error

        const paidSessions = data?.filter((s) => s.is_paid) || []
        const unpaidSessions = data?.filter((s) => !s.is_paid) || []

        const paidAmount = paidSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0)
        const unpaidAmount = unpaidSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0)

        const studentMap = new Map((studentList ?? students).map((student) => [student.id, student.name]))
        const unpaidByStudent = new Map<string, { total: number; count: number }>()

        unpaidSessions.forEach((session) => {
          const studentId = session.student_id as string | null
          if (!studentId) return

          const current = unpaidByStudent.get(studentId) || { total: 0, count: 0 }
          unpaidByStudent.set(studentId, {
            total: current.total + (session.total_amount || 0),
            count: current.count + 1,
          })
        })

        const byStudent = Array.from(unpaidByStudent.entries())
          .map(([studentId, value]) => ({
            studentId,
            name: studentMap.get(studentId) || "Unknown",
            totalUnpaid: value.total,
            unpaidSessions: value.count,
          }))
          .sort((a, b) => b.totalUnpaid - a.totalUnpaid)

        setPaymentData({
          overview: [
            { name: "Paid", value: paidSessions.length, amount: paidAmount },
            { name: "Unpaid", value: unpaidSessions.length, amount: unpaidAmount },
          ],
          byStudent,
        })
      } catch (error) {
        console.error("Error fetching payment data:", error)
      }
    },
    [students],
  )

  const fetchWeeklyData = useCallback(async (period: ChartPeriod) => {
    try {
      const supabase = createClient()
      const { startDate, endDate } = getDateRange(period)
      const user = await requireAuthUser(supabase)
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - 6) // Last 7 days

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("date, duration_minutes")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .gte("date", startOfWeek.toISOString().split("T")[0])
        .eq("user_id", user.id)
        .order("date")

      if (error) throw error

      // Calculate days between start and end
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysToShow = Math.min(daysDiff + 1, 31) // Max 31 days for readability

      // Create array for the period, week starts on Monday
      const weekData = []
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
        const dateString = date.toISOString().split("T")[0]

        const daySessions = data?.filter((s) => s.date === dateString) || []
        const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0)

        weekData.push({
          day: dayName,
          hours: totalMinutes / 60,
          sessions: daySessions.length,
        })
      }

      setWeeklyData(weekData)
    } catch (error) {
      console.error("Error fetching weekly data:", error)
    }
  }, [])

  const fetchCancellationData = useCallback(
    async (period: ChartPeriod, studentList?: StudentInfo[]) => {
      try {
        const supabase = createClient()
        const { startDate, endDate } = getDateRange(period)
        const user = await requireAuthUser(supabase)

        const { data, error } = await supabase
          .from("tutoring_sessions")
          .select("student_id, date, is_cancelled, cancelled_by")
          .gte("date", startDate.toISOString().split("T")[0])
          .lte("date", endDate.toISOString().split("T")[0])
          .eq("user_id", user.id)

        if (error) throw error

        const sessions = data || []
        const totalSessions = sessions.length
        const cancelledSessions = sessions.filter((session) => session.is_cancelled)
        const totalCancelled = cancelledSessions.length
        const overallRate = totalSessions > 0 ? (totalCancelled / totalSessions) * 100 : 0

        const cancellerCounts = new Map<string, number>()
        cancelledSessions.forEach((session) => {
          const canceller = (session.cancelled_by as string | null) || "unknown"
          cancellerCounts.set(canceller, (cancellerCounts.get(canceller) || 0) + 1)
        })

        const relevantCancellers: { key: string; label: string }[] = [
          { key: "student", label: "Student" },
          { key: "teacher", label: "Teacher" },
        ]

        const byWho = relevantCancellers
          .map(({ key, label }) => {
            const count = cancellerCounts.get(key) || 0
            return {
              name: label,
              value: count,
              percentage: totalCancelled > 0 ? (count / totalCancelled) * 100 : 0,
            }
          })
          .filter((item) => item.value > 0 || totalCancelled === 0)

        const otherCount = Array.from(cancellerCounts.entries()).reduce((acc, [key, value]) => {
          if (key === "student" || key === "teacher") {
            return acc
          }
          return acc + value
        }, 0)

        if (otherCount > 0) {
          byWho.push({
            name: "Other",
            value: otherCount,
            percentage: totalCancelled > 0 ? (otherCount / totalCancelled) * 100 : 0,
          })
        }

        const studentMap = new Map((studentList ?? students).map((student) => [student.id, student.name]))
        const studentCancellationStats = new Map<
          string,
          { total: number; cancelled: number }
        >()

        sessions.forEach((session) => {
          const studentId = session.student_id as string | null
          if (!studentId) return

          const current = studentCancellationStats.get(studentId) || { total: 0, cancelled: 0 }
          studentCancellationStats.set(studentId, {
            total: current.total + 1,
            cancelled: current.cancelled + (session.is_cancelled ? 1 : 0),
          })
        })

        const byStudent = Array.from(studentCancellationStats.entries())
          .map(([studentId, value]) => ({
            studentId,
            name: studentMap.get(studentId) || "Unknown",
            totalSessions: value.total,
            cancelledSessions: value.cancelled,
            cancellationRate: value.total > 0 ? (value.cancelled / value.total) * 100 : 0,
          }))
          .filter((entry) => entry.totalSessions > 0)
          .sort((a, b) => b.cancellationRate - a.cancellationRate)

        setCancellationData({
          overallRate,
          byWho,
          byStudent,
        })
      } catch (error) {
        console.error("Error fetching cancellation data:", error)
      }
    },
    [students],
  )

  const fetchSessionDurationData = useCallback(async (period: ChartPeriod) => {
    try {
      const supabase = createClient()
      const { startDate, endDate } = getDateRange(period)
      const user = await requireAuthUser(supabase)

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("duration_minutes")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0])
        .eq("user_id", user.id)
        .eq("is_cancelled", false)

      if (error) throw error

      const durations = (data || []).map((session) => Number(session.duration_minutes) || 0)
      setSessionDurationData(durations)
    } catch (error) {
      console.error("Error fetching session duration data:", error)
    }
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    const loadedStudents = await fetchStudents()
    await Promise.all([
      fetchOverallStats(),
      fetchRevenueData(revenuePeriod),
      fetchStudentStats(studentPeriod),
      fetchPaymentData(paymentPeriod, loadedStudents),
      fetchWeeklyData(timePeriod),
      fetchCancellationData(cancellationPeriod, loadedStudents),
      fetchSessionDurationData(durationPeriod),
    ])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between pt-4 animate-fade-in">
              <div>
                <div className="h-9 w-48 rounded bg-muted animate-skeleton mb-2" />
                <div className="h-5 w-72 rounded bg-muted/70 animate-skeleton" style={{ animationDelay: '0.1s' }} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 animate-scale-in" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 w-32 rounded bg-muted animate-skeleton" />
                    <div className="h-5 w-5 rounded bg-muted animate-skeleton" />
                  </div>
                  <div className="h-8 w-28 rounded bg-muted animate-skeleton mb-2" />
                  <div className="h-3 w-40 rounded bg-muted/70 animate-skeleton" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 animate-scale-in" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
                  <div className="h-5 w-40 rounded bg-muted animate-skeleton mb-4" />
                  <div className="h-[300px] w-full rounded bg-muted/50 animate-skeleton flex items-end justify-around p-4">
                    {[60, 80, 70, 90, 75, 85].map((height, j) => (
                      <div
                        key={j}
                        className="w-12 rounded-t bg-muted animate-pulse-gentle"
                        style={{ 
                          height: `${height}%`,
                          animationDelay: `${j * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<TrendingUp className="h-6 w-6" />}
            eyebrow="Insights"
            title="Performance Analytics"
            description="Monitor revenue trends, student outcomes, and teaching hours to understand how your tutoring business is evolving."
            action={
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/statistics/montly-earnings">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Monthly Earnings
                  </Link>
                </Button>
                <ExportDialog students={students} />
              </div>
            }
          />

          {/* Overall Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${overallStats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">${overallStats.unpaidAmount.toFixed(2)} unpaid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">{overallStats.totalHours.toFixed(1)} hours taught</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats.activeStudents}</div>
                <p className="text-xs text-muted-foreground">${overallStats.avgHourlyRate.toFixed(2)} avg rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.totalSessions > 0
                    ? Math.round((overallStats.totalHours * 60) / overallStats.totalSessions)
                    : 0}
                  min
                </div>
                <p className="text-xs text-muted-foreground">per session</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueChart
              data={revenueData}
              period={revenuePeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setRevenuePeriod(period)
                fetchRevenueData(period)
              }}
            />
            <TimeAnalysis
              weeklyData={weeklyData}
              period={timePeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setTimePeriod(period)
                fetchWeeklyData(period)
              }}
            />
            <CancellationAnalysis
              data={cancellationData}
              period={cancellationPeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setCancellationPeriod(period)
                fetchCancellationData(period)
              }}
            />
            <SessionDurationChart
              data={sessionDurationData}
              period={durationPeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setDurationPeriod(period)
                fetchSessionDurationData(period)
              }}
            />
            <PaymentOverview
              paymentData={paymentData}
              period={paymentPeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setPaymentPeriod(period)
                fetchPaymentData(period)
              }}
            />
            <StudentPerformance
              studentStats={studentStats}
              period={studentPeriod}
              onPeriodChange={(period: ChartPeriod) => {
                setStudentPeriod(period)
                fetchStudentStats(period)
              }}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
