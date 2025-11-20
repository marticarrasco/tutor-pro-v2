"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, DollarSign, Clock, Users, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { ExportDialog } from "@/components/export/export-dialog"
import { ChartPeriod } from "@/components/statistics/chart-period-selector"
import { DemoRevenueChart } from "@/components/demo/statistics/demo-revenue-chart"
import { StudentPerformance } from "@/components/statistics/student-performance"
import { PaymentOverview } from "@/components/statistics/payment-overview"
import { TimeAnalysis } from "@/components/statistics/time-analysis"
import { CancellationAnalysis } from "@/components/statistics/cancellation-analysis"
import { SessionDurationChart } from "@/components/statistics/session-duration-chart"
import {
  CancellationData,
  PaymentOverviewData,
  StudentInfo,
  StudentStat,
} from "@/types/statistics"
import Link from "next/link"

interface OverallStats {
  totalRevenue: number
  totalSessions: number
  totalHours: number
  activeStudents: number
  avgHourlyRate: number
  unpaidAmount: number
}

export default function DemoStatisticsPage() {
  const { sessions, students } = useDemoData()

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
      return {
        startDate: new Date(2000, 0, 1),
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
        const day = endDate.getDay() === 0 ? 7 : endDate.getDay();
        startDate.setDate(endDate.getDate() - (day - 1));
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

  const calculateOverallStats = useCallback(() => {
    const activeSessions = sessions.filter(s => s.payment_status !== 'cancelled')
    const activeStudentsList = students.filter(s => s.is_active)

    const totalSessions = activeSessions.length
    const totalRevenue = activeSessions.reduce((sum, s) => sum + s.total_amount, 0)
    const totalHours = activeSessions.reduce((sum, s) => sum + s.duration, 0)
    const unpaidAmount = activeSessions.filter((s) => s.payment_status === 'pending').reduce((sum, s) => sum + s.total_amount, 0)
    const avgHourlyRate = activeStudentsList.reduce((sum, s) => sum + s.hourly_rate, 0) / (activeStudentsList.length || 1)

    setOverallStats({
      totalRevenue,
      totalSessions,
      totalHours,
      activeStudents: activeStudentsList.length,
      avgHourlyRate,
      unpaidAmount,
    })
  }, [sessions, students])

  const calculateRevenueData = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)
    if (period.type === "3months") {
      startDate.setMonth(startDate.getMonth() - 3)
    } else if (period.type === "month") {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const filteredSessions = sessions.filter(s => {
      const date = new Date(s.date)
      return date >= startDate && date <= endDate && s.payment_status !== 'cancelled'
    })

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; sessions: number } } = {}

    filteredSessions.forEach((session) => {
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
  }, [sessions])

  const calculateStudentStats = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)

    const stats = students.map(student => {
      const studentSessions = sessions.filter(s => {
        const date = new Date(s.date)
        return s.student_id === student.id && date >= startDate && date <= endDate && s.payment_status !== 'cancelled'
      })

      const totalSessions = studentSessions.length
      const totalRevenue = studentSessions.reduce((sum, s) => sum + s.total_amount, 0)
      const totalHours = studentSessions.reduce((sum, s) => sum + s.duration, 0)
      const avgSessionDuration = totalSessions > 0 ? (totalHours * 60) / totalSessions : 0
      const uniqueMonths = new Set(
        studentSessions.map((session) => {
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
      .filter(s => s.total_sessions > 0)
      .sort((a, b) => b.total_revenue - a.total_revenue)

    setStudentStats(stats)
  }, [sessions, students])

  const calculatePaymentData = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)

    const filteredSessions = sessions.filter(s => {
      const date = new Date(s.date)
      return date >= startDate && date <= endDate && s.payment_status !== 'cancelled'
    })

    const paidSessions = filteredSessions.filter((s) => s.payment_status === 'paid')
    const unpaidSessions = filteredSessions.filter((s) => s.payment_status === 'pending')

    const paidAmount = paidSessions.reduce((sum, s) => sum + s.total_amount, 0)
    const unpaidAmount = unpaidSessions.reduce((sum, s) => sum + s.total_amount, 0)

    const studentMap = new Map(students.map((student) => [student.id, student.name]))
    const unpaidByStudent = new Map<string, { total: number; count: number }>()

    unpaidSessions.forEach((session) => {
      const current = unpaidByStudent.get(session.student_id) || { total: 0, count: 0 }
      unpaidByStudent.set(session.student_id, {
        total: current.total + session.total_amount,
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
  }, [sessions, students])

  const calculateWeeklyData = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - 6)

    const filteredSessions = sessions.filter(s => {
      const date = new Date(s.date)
      return date >= startDate && date <= endDate && date >= startOfWeek && s.payment_status !== 'cancelled'
    })

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysToShow = Math.min(daysDiff + 1, 31)

    const weekData = []
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
      const dateString = date.toISOString().split("T")[0]

      const daySessions = filteredSessions.filter((s) => s.date === dateString)
      const totalHours = daySessions.reduce((sum, s) => sum + s.duration, 0)

      weekData.push({
        day: dayName,
        hours: totalHours,
        sessions: daySessions.length,
      })
    }

    setWeeklyData(weekData)
  }, [sessions])

  const calculateCancellationData = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)

    const periodSessions = sessions.filter(s => {
      const date = new Date(s.date)
      return date >= startDate && date <= endDate
    })

    const totalSessions = periodSessions.length
    const cancelledSessions = periodSessions.filter((s) => s.payment_status === 'cancelled')
    const totalCancelled = cancelledSessions.length
    const overallRate = totalSessions > 0 ? (totalCancelled / totalSessions) * 100 : 0

    // In demo data, we don't explicitly track who cancelled, so we'll simulate it
    // mostly student cancellations for demo purposes
    const byWho = [
      { name: "Student", value: Math.floor(totalCancelled * 0.7), percentage: 70 },
      { name: "Teacher", value: Math.ceil(totalCancelled * 0.3), percentage: 30 },
    ].filter(item => item.value > 0)

    const studentMap = new Map(students.map((student) => [student.id, student.name]))
    const studentCancellationStats = new Map<string, { total: number; cancelled: number }>()

    periodSessions.forEach((session) => {
      const current = studentCancellationStats.get(session.student_id) || { total: 0, cancelled: 0 }
      studentCancellationStats.set(session.student_id, {
        total: current.total + 1,
        cancelled: current.cancelled + (session.payment_status === 'cancelled' ? 1 : 0),
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
      .filter((entry) => entry.totalSessions > 0 && entry.cancelledSessions > 0)
      .sort((a, b) => b.cancellationRate - a.cancellationRate)

    setCancellationData({
      overallRate,
      byWho,
      byStudent,
    })
  }, [sessions, students])

  const calculateSessionDurationData = useCallback((period: ChartPeriod) => {
    const { startDate, endDate } = getDateRange(period)

    const filteredSessions = sessions.filter(s => {
      const date = new Date(s.date)
      return date >= startDate && date <= endDate && s.payment_status !== 'cancelled'
    })

    const durations = filteredSessions.map((s) => Math.round(s.duration * 60))
    setSessionDurationData(durations)
  }, [sessions])

  // Initial calculation
  useEffect(() => {
    calculateOverallStats()
    calculateRevenueData(revenuePeriod)
    calculateStudentStats(studentPeriod)
    calculatePaymentData(paymentPeriod)
    calculateWeeklyData(timePeriod)
    calculateCancellationData(cancellationPeriod)
    calculateSessionDurationData(durationPeriod)
  }, [
    sessions,
    students,
    // Trigger recalculations when periods change (though the individual setters handle this too)
  ])

  // Individual effect triggers for period changes
  useEffect(() => calculateRevenueData(revenuePeriod), [revenuePeriod, calculateRevenueData])
  useEffect(() => calculateStudentStats(studentPeriod), [studentPeriod, calculateStudentStats])
  useEffect(() => calculatePaymentData(paymentPeriod), [paymentPeriod, calculatePaymentData])
  useEffect(() => calculateWeeklyData(timePeriod), [timePeriod, calculateWeeklyData])
  useEffect(() => calculateCancellationData(cancellationPeriod), [cancellationPeriod, calculateCancellationData])
  useEffect(() => calculateSessionDurationData(durationPeriod), [durationPeriod, calculateSessionDurationData])

  return (
    <SidebarProvider>
      <DemoSidebar />
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
                  <Link href="#">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Monthly Earnings
                  </Link>
                </Button>
                <ExportDialog
                  students={students.map(s => ({ id: s.id, name: s.name, email: s.email || "" }))}
                />
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
            <DemoRevenueChart
              data={revenueData}
              period={revenuePeriod}
              onPeriodChange={setRevenuePeriod}
              allSessions={sessions}
            />
            <TimeAnalysis
              weeklyData={weeklyData}
              period={timePeriod}
              onPeriodChange={setTimePeriod}
            />
            <CancellationAnalysis
              data={cancellationData}
              period={cancellationPeriod}
              onPeriodChange={setCancellationPeriod}
            />
            <SessionDurationChart
              data={sessionDurationData}
              period={durationPeriod}
              onPeriodChange={setDurationPeriod}
            />
            <PaymentOverview
              paymentData={paymentData}
              period={paymentPeriod}
              onPeriodChange={setPaymentPeriod}
            />
            <StudentPerformance
              studentStats={studentStats}
              period={studentPeriod}
              onPeriodChange={setStudentPeriod}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
