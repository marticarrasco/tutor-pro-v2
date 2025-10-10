"use client"

import { useMemo, useState } from "react"
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

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const STUDENT_STYLES: Record<string, string> = {
  Aitana: "border-l-4 border-teal-500 bg-teal-500/15 text-teal-800",
  Robert: "border-l-4 border-emerald-500 bg-emerald-500/15 text-emerald-800",
  Biel: "border-l-4 border-amber-900 bg-amber-900/10 text-amber-900",
  Ot: "border-l-4 border-orange-500 bg-orange-500/15 text-orange-800",
  Iker: "border-l-4 border-lime-500 bg-lime-500/15 text-lime-800",
  Izan: "border-l-4 border-purple-500 bg-purple-500/15 text-purple-800",
}

type StudentName = keyof typeof STUDENT_STYLES

type SessionEntry = {
  student: StudentName
  durationHours: number
  amount: number
}

type MonthSessions = Record<string, SessionEntry[]>

type MonthlyDataset = Record<string, MonthSessions>

const MONTHLY_DATA: MonthlyDataset = {
  "2025-05": {
    "2025-04-28": [],
    "2025-04-29": [],
    "2025-04-30": [],
    "2025-05-01": [
      { student: "Aitana", durationHours: 2, amount: 40 },
    ],
    "2025-05-02": [
      { student: "Robert", durationHours: 1, amount: 15 },
    ],
    "2025-05-03": [],
    "2025-05-04": [],
    "2025-05-05": [
      { student: "Aitana", durationHours: 2, amount: 40 },
      { student: "Robert", durationHours: 1, amount: 12.5 },
    ],
    "2025-05-06": [
      { student: "Biel", durationHours: 1.5, amount: 22.5 },
    ],
    "2025-05-07": [],
    "2025-05-08": [
      { student: "Ot", durationHours: 2, amount: 30 },
      { student: "Robert", durationHours: 1, amount: 17.5 },
    ],
    "2025-05-09": [],
    "2025-05-10": [
      { student: "Iker", durationHours: 2, amount: 30 },
    ],
    "2025-05-11": [],
    "2025-05-12": [
      { student: "Izan", durationHours: 1, amount: 15 },
      { student: "Aitana", durationHours: 2, amount: 40 },
    ],
    "2025-05-13": [
      { student: "Biel", durationHours: 2, amount: 30 },
    ],
    "2025-05-14": [
      { student: "Robert", durationHours: 1, amount: 22.5 },
    ],
    "2025-05-15": [],
    "2025-05-16": [
      { student: "Izan", durationHours: 1, amount: 15 },
      { student: "Iker", durationHours: 2, amount: 30 },
    ],
    "2025-05-17": [],
    "2025-05-18": [
      { student: "Aitana", durationHours: 2, amount: 40 },
      { student: "Robert", durationHours: 1, amount: 22.5 },
    ],
    "2025-05-19": [
      { student: "Izan", durationHours: 1, amount: 15 },
      { student: "Biel", durationHours: 1, amount: 15 },
    ],
    "2025-05-20": [],
    "2025-05-21": [
      { student: "Izan", durationHours: 1, amount: 15 },
    ],
    "2025-05-22": [
      { student: "Robert", durationHours: 1, amount: 15 },
      { student: "Biel", durationHours: 2, amount: 30 },
    ],
    "2025-05-23": [],
    "2025-05-24": [],
    "2025-05-25": [
      { student: "Iker", durationHours: 2, amount: 30 },
    ],
    "2025-05-26": [],
    "2025-05-27": [],
    "2025-05-28": [],
    "2025-05-29": [],
    "2025-05-30": [],
    "2025-05-31": [],
    "2025-06-01": [],
  },
}

const STUDENT_ORDER: StudentName[] = ["Aitana", "Robert", "Biel", "Ot", "Iker", "Izan"]

const formatCurrency = (value: number) => `${value.toFixed(2)} €`

export default function MonthlyEarningsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1))

  const monthKey = format(currentMonth, "yyyy-MM")

  const sessionsForMonth = useMemo<MonthSessions>(() => {
    return MONTHLY_DATA[monthKey] ?? {}
  }, [monthKey])

  const calendarWeeks = useMemo(() => {
    const weeks: {
      date: Date
      dayLabel: string
      inCurrentMonth: boolean
      sessions: SessionEntry[]
    }[][] = []

    const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })

    let iterator = calendarStart

    while (iterator <= calendarEnd) {
      const week: {
        date: Date
        dayLabel: string
        inCurrentMonth: boolean
        sessions: SessionEntry[]
      }[] = []

      for (let i = 0; i < 7; i++) {
        const currentDate = iterator
        const dateKey = format(currentDate, "yyyy-MM-dd")
        week.push({
          date: currentDate,
          dayLabel: format(currentDate, "d"),
          inCurrentMonth: isSameMonth(currentDate, currentMonth),
          sessions: sessionsForMonth[dateKey] ?? [],
        })
        iterator = addDays(iterator, 1)
      }

      weeks.push(week)
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
    const totals = new Map<StudentName, number>()

    STUDENT_ORDER.forEach((student) => totals.set(student, 0))

    Object.values(sessionsForMonth).forEach((daySessions) => {
      daySessions.forEach((session) => {
        totals.set(session.student, (totals.get(session.student) ?? 0) + session.amount)
      })
    })

    return STUDENT_ORDER.map((student) => ({
      student,
      total: totals.get(student) ?? 0,
    })).filter((entry) => entry.total > 0)
  }, [sessionsForMonth])

  const totalMonthlyEarnings = useMemo(
    () => weeklyEarnings.reduce((sum, amount) => sum + amount, 0),
    [weeklyEarnings],
  )

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => addMonths(prev, direction === "prev" ? -1 : 1))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex flex-col gap-1 pt-4">
            <h1 className="text-3xl font-bold tracking-tight">Monthly Earnings</h1>
            <p className="text-muted-foreground">
              Visualise your lessons and earnings for each day of the month.
            </p>
          </div>

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
                    {week.map((day) => (
                      <div
                        key={day.date.toISOString()}
                        className={cn(
                          "flex min-h-32 flex-col gap-1 rounded-md border bg-background p-2 text-left",
                          !day.inCurrentMonth && "border-dashed bg-muted/40 text-muted-foreground",
                        )}
                      >
                        <div className="text-right text-sm font-medium">{day.dayLabel}</div>
                        <div className="flex flex-col gap-1">
                          {day.sessions.map((session, index) => (
                            <div
                              key={`${session.student}-${index}`}
                              className={cn(
                                "rounded-md px-2 py-1 text-sm font-medium",
                                STUDENT_STYLES[session.student],
                              )}
                            >
                              {session.student} ({session.durationHours.toFixed(1)}h)
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
