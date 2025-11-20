"use client"

import { useEffect, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import { CalendarDays } from "lucide-react"

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

// Define a color palette for students
const STUDENT_COLOR_PALETTE = [
  "border-l-4 border-teal-500 bg-teal-500/15 text-teal-800",
  "border-l-4 border-emerald-500 bg-emerald-500/15 text-emerald-800",
  "border-l-4 border-amber-900 bg-amber-900/10 text-amber-900",
  "border-l-4 border-orange-500 bg-orange-500/15 text-orange-800",
  "border-l-4 border-lime-500 bg-lime-500/15 text-lime-800",
  "border-l-4 border-purple-500 bg-purple-500/15 text-purple-800",
  "border-l-4 border-blue-500 bg-blue-500/15 text-blue-800",
  "border-l-4 border-pink-500 bg-pink-500/15 text-pink-800",
  "border-l-4 border-indigo-500 bg-indigo-500/15 text-indigo-800",
  "border-l-4 border-rose-500 bg-rose-500/15 text-rose-800",
] as const

type SessionEntry = {
  student: string
  studentId: string
  durationHours: number
  amount: number
}

type MonthSessions = Record<string, SessionEntry[]>

const formatCurrency = (value: number) => `${value.toFixed(2)} €`

// Function to get student color based on index
const getStudentColor = (index: number): string => {
  return STUDENT_COLOR_PALETTE[index % STUDENT_COLOR_PALETTE.length]
}

export default function MonthlyEarningsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [sessionsForMonth, setSessionsForMonth] = useState<MonthSessions>({})
  const [studentColorMap, setStudentColorMap] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Fetch sessions from database
  useEffect(() => {
    const fetchMonthSessions = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()
        const user = await requireAuthUser(supabase)

        // Get the start and end of the actual month (no padding days)
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        // Fetch sessions for this month only
        const { data: sessions, error: sessionsError } = await supabase
          .from("tutoring_sessions")
          .select(`
            id,
            date,
            duration_minutes,
            total_amount,
            is_cancelled,
            student_id,
            students!inner(name)
          `)
          .eq("user_id", user.id)
          .gte("date", format(monthStart, "yyyy-MM-dd"))
          .lte("date", format(monthEnd, "yyyy-MM-dd"))
          .order("date")

        if (sessionsError) throw sessionsError

        // Get all unique students to assign colors
        const uniqueStudents = Array.from(
          new Set(sessions?.map((s: any) => s.students.name) || [])
        ).sort()

        // Create color map for students
        const colorMap: Record<string, string> = {}
        uniqueStudents.forEach((student, index) => {
          colorMap[student] = getStudentColor(index)
        })
        setStudentColorMap(colorMap)

        // Group sessions by date
        const sessionsByDate: MonthSessions = {}

        sessions?.forEach((session: any) => {
          const dateKey = session.date
          if (!sessionsByDate[dateKey]) {
            sessionsByDate[dateKey] = []
          }

          sessionsByDate[dateKey].push({
            student: session.students.name,
            studentId: session.student_id,
            durationHours: session.duration_minutes / 60,
            amount: session.total_amount || 0,
          })
        })

        setSessionsForMonth(sessionsByDate)
      } catch (error) {
        console.error("Error fetching monthly sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load monthly earnings data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonthSessions()
  }, [currentMonth])

  const calendarWeeks = useMemo(() => {
    const weeks: {
      date: Date
      dayLabel: string
      sessions: SessionEntry[]
    }[][] = []

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = monthStart.getDay()
    // Convert Sunday (0) to 7 for Monday-start weeks
    const startDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    let iterator = monthStart
    let currentWeek: {
      date: Date
      dayLabel: string
      sessions: SessionEntry[]
    }[] = []

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDayOffset; i++) {
      currentWeek.push({
        date: new Date(0), // placeholder date
        dayLabel: "",
        sessions: [],
      })
    }

    // Add all days of the month
    while (iterator <= monthEnd) {
      const dateKey = format(iterator, "yyyy-MM-dd")
      currentWeek.push({
        date: new Date(iterator),
        dayLabel: format(iterator, "d"),
        sessions: sessionsForMonth[dateKey] ?? [],
      })

      // If we've completed a week (7 days), start a new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      iterator = addDays(iterator, 1)
    }

    // Add empty cells to complete the last week if needed
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({
        date: new Date(0), // placeholder date
        dayLabel: "",
        sessions: [],
      })
    }

    // Add the last week if it has any days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }, [currentMonth, sessionsForMonth])

  const weeklyEarnings = useMemo(() => {
    return calendarWeeks.map((week) =>
      week.reduce((total, day) => {
        const dayTotal = day.sessions.reduce((daySum, session) => daySum + session.amount, 0)
        return total + dayTotal
      }, 0),
    )
  }, [calendarWeeks])

  const earningsByStudent = useMemo(() => {
    const totals = new Map<string, number>()

    Object.values(sessionsForMonth).forEach((daySessions) => {
      daySessions.forEach((session) => {
        totals.set(session.student, (totals.get(session.student) ?? 0) + session.amount)
      })
    })

    return Array.from(totals.entries())
      .map(([student, total]) => ({
        student,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .filter((entry) => entry.total > 0)
  }, [sessionsForMonth])

  const totalMonthlyEarnings = useMemo(
    () => weeklyEarnings.reduce((sum, amount) => sum + amount, 0),
    [weeklyEarnings],
  )

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => addMonths(prev, direction === "prev" ? -1 : 1))
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <PageHeader
              icon={<CalendarDays className="h-6 w-6" />}
              eyebrow="Revenue"
              title="Monthly Earnings Overview"
              description="Visualise lessons delivered, revenue earned, and student activity across the current month."
            />
            <div className="text-center py-8 text-muted-foreground">Loading monthly earnings...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <PageHeader
            icon={<CalendarDays className="h-6 w-6" />}
            eyebrow="Revenue"
            title="Monthly Earnings Overview"
            description="Visualise lessons delivered, revenue earned, and student activity across the current month."
          />

          <div className="flex flex-1 flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-4 text-center">
                <h2 className="text-2xl font-semibold">{format(currentMonth, "LLLL yyyy")}</h2>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-muted-foreground">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label}>{label}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {calendarWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="contents">
                    {week.map((day, dayIndex) => {
                      // Empty cell for days outside the month
                      if (!day.dayLabel) {
                        return (
                          <div
                            key={`empty-${weekIndex}-${dayIndex}`}
                            className="flex min-h-32 flex-col gap-1 rounded-md border border-dashed bg-muted/20 p-2"
                          />
                        )
                      }

                      return (
                        <div
                          key={day.date.toISOString()}
                          className="flex min-h-32 flex-col gap-1 rounded-md border bg-background p-2 text-left"
                        >
                          <div className="text-right text-sm font-medium">{day.dayLabel}</div>
                          <div className="flex flex-col gap-1">
                            {day.sessions.map((session, index) => (
                              <div
                                key={`${session.studentId}-${index}`}
                                className={cn(
                                  "rounded-md px-2 py-1 text-sm font-medium",
                                  studentColorMap[session.student] || STUDENT_COLOR_PALETTE[0],
                                )}
                              >
                                {session.student} ({session.durationHours.toFixed(1)}h)
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold">Summary</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMonthChange("prev")}
                    aria-label="Previous month"
                  >
                    &lt;
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleMonthChange("next")}
                    aria-label="Next month"
                  >
                    &gt;
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Weekly Earnings</h3>
                <div className="mt-2 space-y-2">
                  {weeklyEarnings.map((amount, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>Week {index + 1}</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Total Monthly Earnings
                </h3>
                <div className="mt-2 text-2xl font-bold">{formatCurrency(totalMonthlyEarnings)}</div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">Earnings by Student</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {earningsByStudent.map((entry) => (
                    <div key={entry.student} className="flex items-center justify-between">
                      <span>{entry.student}</span>
                      <span>{formatCurrency(entry.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}