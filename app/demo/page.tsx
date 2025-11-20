"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoRecentActivity } from "@/components/demo/today/demo-recent-activity"
import { DemoTodaySchedule } from "@/components/demo/today/demo-today-schedule"
import { DemoPendingPayments } from "@/components/demo/today/demo-pending-payments"
import { MonthlyRevenue } from "@/components/today/monthly-revenue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sun, Moon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Toaster } from "@/components/ui/toaster"

// Types adapted for demo data
interface TodayClass {
  id: string
  student_id: string
  student_name: string
  student_hourly_rate: number
  start_time: string
  duration_minutes: number
  status: "pending" | "completed" | "cancelled"
  session_id?: string
  session_amount?: number
  session_is_paid?: boolean
  session_duration_minutes?: number
  cancelled_by?: "teacher" | "student" | null
}

interface StudentPayment {
  studentId: string
  studentName: string
  totalUnpaid: number
  unpaidSessions: number
}

interface StudentRevenue {
  studentId: string
  studentName: string
  totalRevenue: number
  sessionCount: number
}

interface RecentSession {
  id: string
  student_name: string
  date: string
  duration: number
  total_amount: number
  payment_status: "paid" | "pending" | "cancelled"
}

export default function DemoHomePage() {
  const { students, sessions, scheduledClasses, addSession } = useDemoData()

  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [recentSessionsList, setRecentSessionsList] = useState<RecentSession[]>([])
  const [pendingPayments, setPendingPayments] = useState<StudentPayment[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<StudentRevenue[]>([])

  // Form state for Log a Session
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hours, setHours] = useState("1.0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate derived data
  useEffect(() => {
    // 1. Today's Classes
    const today = new Date()
    const dayOfWeek = today.getDay()
    const todayString = format(today, "yyyy-MM-dd")

    const todaysScheduled = scheduledClasses.filter(cls => cls.day_of_week === dayOfWeek && cls.is_active)
    const todaysSessions = sessions.filter(s => s.date === todayString)

    const classesList: TodayClass[] = todaysScheduled.map(cls => {
      const session = todaysSessions.find(s => s.student_id === cls.student_id)
      const student = students.find(s => s.id === cls.student_id)

      let status: "pending" | "completed" | "cancelled" = "pending"
      if (session) {
        if (session.payment_status === 'cancelled') {
          status = "cancelled"
        } else {
          status = "completed"
        }
      }

      return {
        id: cls.id,
        student_id: cls.student_id,
        student_name: cls.student_name,
        student_hourly_rate: student?.hourly_rate || 0,
        start_time: cls.start_time,
        duration_minutes: cls.duration_minutes,
        status,
        session_id: session?.id,
        session_amount: session?.total_amount,
        session_is_paid: session?.payment_status === 'paid',
        session_duration_minutes: session ? session.duration * 60 : undefined,
        cancelled_by: null,
      }
    }).sort((a, b) => a.start_time.localeCompare(b.start_time))

    setTodayClasses(classesList)

    // 2. Recent Sessions
    const sortedSessions = [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
      .map(s => ({
        id: s.id,
        student_name: s.student_name,
        date: s.date,
        duration: s.duration,
        total_amount: s.total_amount,
        payment_status: s.payment_status,
      }))

    setRecentSessionsList(sortedSessions)

    // 3. Pending Payments
    const unpaidByStudent = new Map<string, StudentPayment>()
    sessions
      .filter(s => s.payment_status === 'pending')
      .forEach(session => {
        if (unpaidByStudent.has(session.student_id)) {
          const existing = unpaidByStudent.get(session.student_id)!
          existing.totalUnpaid += session.total_amount
          existing.unpaidSessions += 1
        } else {
          unpaidByStudent.set(session.student_id, {
            studentId: session.student_id,
            studentName: session.student_name,
            totalUnpaid: session.total_amount,
            unpaidSessions: 1,
          })
        }
      })

    setPendingPayments(Array.from(unpaidByStudent.values()).sort((a, b) => b.totalUnpaid - a.totalUnpaid))

    // 4. Monthly Revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const revenueByStudent = new Map<string, StudentRevenue>()
    sessions
      .filter(s => {
        const date = new Date(s.date)
        return date >= firstDayOfMonth && date <= lastDayOfMonth && s.payment_status !== 'cancelled'
      })
      .forEach(session => {
        if (revenueByStudent.has(session.student_id)) {
          const existing = revenueByStudent.get(session.student_id)!
          existing.totalRevenue += session.total_amount
          existing.sessionCount += 1
        } else {
          revenueByStudent.set(session.student_id, {
            studentId: session.student_id,
            studentName: session.student_name,
            totalRevenue: session.total_amount,
            sessionCount: 1,
          })
        }
      })

    setMonthlyRevenue(Array.from(revenueByStudent.values()).sort((a, b) => b.totalRevenue - a.totalRevenue))

  }, [sessions, scheduledClasses, students])

  const handleLogSession = async () => {
    if (!selectedStudentId || !selectedDate || !hours) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedStudent = students.find((s) => s.id === selectedStudentId)
      if (!selectedStudent) {
        throw new Error("Student not found")
      }

      const duration = parseFloat(hours)
      const total = duration * selectedStudent.hourly_rate

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      addSession({
        student_id: selectedStudentId,
        student_name: selectedStudent.name,
        subject: selectedStudent.subject,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: "14:00", // Default time
        end_time: format(new Date(new Date().setHours(14 + Math.floor(duration), (duration % 1) * 60)), "HH:mm"),
        duration,
        hourly_rate: selectedStudent.hourly_rate,
        total_amount: total,
        payment_status: 'pending',
        notes: '',
      })

      toast({
        title: "Session logged successfully",
        description: `Logged ${hours}h session for ${selectedStudent.name}`,
      })

      setSelectedStudentId("")
      setSelectedDate(new Date())
      setHours("1.0")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentHour = new Date().getHours()
  const timeOfDay = currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : currentHour < 22 ? "evening" : "night"
  const headerIcon = currentHour < 18 ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <PageHeader
            icon={headerIcon}
            eyebrow="Dashboard"
            title={`Good ${timeOfDay}, Demo User!`}
            description="Review today's schedule, log new sessions, and monitor outstanding payments at a glance."
          />

          {/* Top Section - Log a Session and Today's Classes */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Log a Session Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Log a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor="student" className="mb-2 text-sm">Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student" className="w-full">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-2 text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          weekStartsOn={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-sm">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="1.0"
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleLogSession}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50 relative text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                      Logging Session...
                    </>
                  ) : (
                    "Log Session"
                  )}
                </Button>
              </CardContent>
            </Card>
            {/* Today's Schedule Card */}
            <DemoTodaySchedule todayClasses={todayClasses} onRefresh={() => { }} />
          </div>

          {/* Pending Payments and Monthly Revenue Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <DemoPendingPayments studentsWithPendingPayments={pendingPayments} onRefresh={() => { }} />
            <MonthlyRevenue studentRevenues={monthlyRevenue} />
          </div>

          {/* Bottom Section - Recent Activity */}
          <DemoRecentActivity recentSessions={recentSessionsList} />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
