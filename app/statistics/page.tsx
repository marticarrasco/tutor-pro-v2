"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RevenueChart } from "@/components/statistics/revenue-chart"
import { StudentPerformance } from "@/components/statistics/student-performance"
import { PaymentOverview } from "@/components/statistics/payment-overview"
import { TimeAnalysis } from "@/components/statistics/time-analysis"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { ExportDialog } from "@/components/export/export-dialog"

interface OverallStats {
  totalRevenue: number
  totalSessions: number
  totalHours: number
  activeStudents: number
  avgHourlyRate: number
  unpaidAmount: number
}

export default function StatisticsPage() {
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalRevenue: 0,
    totalSessions: 0,
    totalHours: 0,
    activeStudents: 0,
    avgHourlyRate: 0,
    unpaidAmount: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [studentStats, setStudentStats] = useState<any[]>([])
  const [paymentData, setPaymentData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])

  const fetchStudents = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email")
        .eq("is_active", true)
        .eq("user_id", user.id)

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

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

  const fetchRevenueData = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const monthsBack = timeRange === "6months" ? 6 : 12
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - monthsBack)

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("date, total_amount")
        .gte("date", startDate.toISOString().split("T")[0])
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
  }

  const fetchStudentStats = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          name,
          is_active,
          tutoring_sessions(duration_minutes, total_amount)
        `)
        .eq("user_id", user.id)

      if (error) throw error

      const studentStats = data
        ?.map((student: any) => {
          const sessions = student.tutoring_sessions || []
          const totalSessions = sessions.length
          const totalRevenue = sessions.reduce((sum: number, s: any) => sum + s.total_amount, 0)
          const totalHours = sessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0)
          const avgSessionDuration = totalSessions > 0 ? totalHours / totalSessions : 0

          return {
            id: student.id,
            name: student.name,
            is_active: student.is_active,
            total_sessions: totalSessions,
            total_revenue: totalRevenue,
            total_hours: totalHours,
            avg_session_duration: avgSessionDuration,
          }
        })
        .filter((s: any) => s.total_sessions > 0)
        .sort((a: any, b: any) => b.total_revenue - a.total_revenue)

      setStudentStats(studentStats || [])
    } catch (error) {
      console.error("Error fetching student stats:", error)
    }
  }

  const fetchPaymentData = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("is_paid, total_amount")
        .eq("user_id", user.id)

      if (error) throw error

      const paidSessions = data?.filter((s) => s.is_paid) || []
      const unpaidSessions = data?.filter((s) => !s.is_paid) || []

      const paidAmount = paidSessions.reduce((sum, s) => sum + s.total_amount, 0)
      const unpaidAmount = unpaidSessions.reduce((sum, s) => sum + s.total_amount, 0)

      setPaymentData([
        { name: "Paid", value: paidSessions.length, amount: paidAmount },
        { name: "Unpaid", value: unpaidSessions.length, amount: unpaidAmount },
      ])
    } catch (error) {
      console.error("Error fetching payment data:", error)
    }
  }

  const fetchWeeklyData = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - 6) // Last 7 days

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("date, duration_minutes")
        .gte("date", startOfWeek.toISOString().split("T")[0])
        .eq("user_id", user.id)
        .order("date")

      if (error) throw error

      // Create array for last 7 days
      const weekData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
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
  }

  const fetchAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchOverallStats(),
      fetchRevenueData(),
      fetchStudentStats(),
      fetchPaymentData(),
      fetchWeeklyData(),
      fetchStudents(),
    ])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAllData()
  }, [timeRange])

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
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
          <div className="flex items-center justify-between pt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
              <p className="text-muted-foreground">Analyze your tutoring business performance</p>
            </div>
            <div className="flex items-center gap-2">
              <ExportDialog students={students} />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
          <div className="grid gap-4 md:grid-cols-2">
            <RevenueChart data={revenueData} />
            <PaymentOverview paymentData={paymentData} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TimeAnalysis weeklyData={weeklyData} />
            <StudentPerformance studentStats={studentStats} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
