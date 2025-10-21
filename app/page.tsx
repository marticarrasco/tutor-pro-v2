"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RecentActivity } from "@/components/today/recent-activity"
import { TodaySchedule } from "@/components/today/today-schedule"
import { PendingPayments } from "@/components/today/pending-payments"
import { MonthlyRevenue } from "@/components/today/monthly-revenue"
import { LandingPage } from "@/components/landing/landing-page"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Moon, Sun, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"
import { PageHeader } from "@/components/page-header"

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

interface Student {
  id: string
  name: string
  hourly_rate: number
  user_id?: string
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
  duration_minutes: number
  total_amount: number
  is_paid: boolean
  notes: string
  is_cancelled: boolean
  cancelled_by?: "teacher" | "student" | null
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [pendingPayments, setPendingPayments] = useState<StudentPayment[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<StudentRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Form state for Log a Session
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hours, setHours] = useState("1.0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTodayData = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const today = new Date()
      const dayOfWeek = today.getDay()
      const todayString = today.toISOString().split("T")[0]

      // Get today's scheduled classes
      const { data: scheduledData, error: scheduledError } = await supabase
        .from("scheduled_classes")
        .select(`
          id,
          student_id,
          start_time,
          duration_minutes,
          students!scheduled_classes_student_fk(name, hourly_rate)
        `)
        .eq("user_id", user.id)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true)
        .order("start_time")

      if (scheduledError) throw scheduledError

      // Get today's sessions to check status
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("tutoring_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", todayString)

      if (sessionsError) throw sessionsError

      const todayClassesList = (scheduledData || []).map((cls: any) => {
        const session = (sessionsData || []).find((s: any) => s.student_id === cls.student_id)

        let status: "pending" | "completed" | "cancelled" = "pending"
        if (session) {
          if (session.is_cancelled) {
            status = "cancelled"
          } else if (session.duration_minutes > 0) {
            status = "completed"
          }
        }

        return {
          id: cls.id,
          student_id: cls.student_id,
          student_name: cls.students.name,
          student_hourly_rate: cls.students.hourly_rate,
          start_time: cls.start_time,
          duration_minutes: cls.duration_minutes,
          status,
          session_id: session?.id,
          session_amount: session?.total_amount,
          session_is_paid: session?.is_paid,
          session_duration_minutes: session?.duration_minutes,
          cancelled_by: session?.cancelled_by,
        }
      })

      setTodayClasses(todayClassesList)
    } catch (error) {
      console.error("Error fetching today's data:", error)
      toast({
        title: "Error",
        description: "Failed to load today's data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchStudents = async () => {
    try {
      console.log("📚 Fetching students...")
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("students")
        .select("id, name, hourly_rate")
        .eq("is_active", true)
        .eq("user_id", user.id)
        .order("name")

      if (error) {
        console.error("❌ Error fetching students:", error)
        throw error
      }
      console.log("✅ Students fetched:", data)
      setStudents(data || [])
    } catch (error) {
      console.error("❌ Error fetching students:", error)
    }
  }

  const handleLogSession = async () => {
    console.log("=== LOG SESSION STARTED ===")
    console.log("Form values:", {
      selectedStudentId,
      selectedDate,
      hours,
      students: students.length
    })

    if (!selectedStudentId || !selectedDate || !hours) {
      console.error("❌ Missing fields validation failed")
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      console.log("✓ Supabase client created")

      const selectedStudent = students.find((s) => s.id === selectedStudentId)
      console.log("Selected student:", selectedStudent)

      if (!selectedStudent) {
        console.error("❌ Student not found in list")
        throw new Error("Student not found")
      }

      const durationMinutes = Math.round(parseFloat(hours) * 60)
      const dateString = selectedDate.toISOString().split("T")[0]

      console.log("Calculated values:", {
        durationMinutes,
        dateString,
        hourlyRate: selectedStudent.hourly_rate
      })

      const sessionData = {
        student_id: selectedStudentId,
        date: dateString,
        duration_minutes: durationMinutes,
        hourly_rate: selectedStudent.hourly_rate,
        is_paid: false,
        notes: "",
        user_id: user.id,
      }

      console.log("Inserting new session:", sessionData)

      const { data: insertedData, error } = await supabase
        .from("tutoring_sessions")
        .insert([sessionData])
        .select()

      if (error) {
        console.error("❌ Insert error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      } else {
        console.log("✅ Session inserted successfully:", insertedData)
        toast({
          title: "Session logged successfully",
          description: `Logged ${hours}h session for ${selectedStudent.name}`
        })
        // Reset form
        setSelectedStudentId("")
        setSelectedDate(new Date())
        setHours("1.0")
        // Refresh data
        console.log("Refreshing recent sessions...")
        await fetchRecentSessions()
        console.log("✓ Recent sessions refreshed")
      }
    } catch (error: any) {
      console.error("❌ Error logging session:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        full: error
      })
      toast({
        title: "Error",
        description: error.message || "Failed to log session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      console.log("=== LOG SESSION ENDED ===")
    }
  }

  const fetchRecentSessions = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          id,
          date,
          duration_minutes,
          total_amount,
          is_paid,
          notes,
          is_cancelled,
          cancelled_by,
          students!tutoring_sessions_student_fk(name)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(20)

      if (error) throw error

      const formattedSessions = (data || []).map((session: any) => ({
        ...session,
        student_name: session.students.name,
      }))

      setRecentSessions(formattedSessions)
    } catch (error) {
      console.error("Error fetching recent sessions:", error)
    }
  }

  const fetchPendingPayments = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      // Fetch all unpaid sessions grouped by student
      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          student_id,
          total_amount,
          students!tutoring_sessions_student_fk(name)
        `)
        .eq("user_id", user.id)
        .eq("is_paid", false)
        .eq("is_cancelled", false)

      if (error) throw error

      // Group by student and calculate totals
      const paymentsByStudent = new Map<string, StudentPayment>()

      data?.forEach((session: any) => {
        const studentId = session.student_id
        const studentName = session.students.name
        const amount = session.total_amount || 0

        if (paymentsByStudent.has(studentId)) {
          const existing = paymentsByStudent.get(studentId)!
          existing.totalUnpaid += amount
          existing.unpaidSessions += 1
        } else {
          paymentsByStudent.set(studentId, {
            studentId,
            studentName,
            totalUnpaid: amount,
            unpaidSessions: 1,
          })
        }
      })

      // Convert to array and sort by amount descending
      const paymentsArray = Array.from(paymentsByStudent.values())
        .sort((a, b) => b.totalUnpaid - a.totalUnpaid)

      setPendingPayments(paymentsArray)
    } catch (error) {
      console.error("Error fetching pending payments:", error)
    }
  }

  const fetchMonthlyRevenue = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      // Get current month's date range
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const startDate = firstDayOfMonth.toISOString().split("T")[0]
      const endDate = lastDayOfMonth.toISOString().split("T")[0]

      // Fetch all sessions from this month grouped by student
      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          student_id,
          total_amount,
          students!tutoring_sessions_student_fk(name)
        `)
        .eq("user_id", user.id)
        .eq("is_cancelled", false)
        .gte("date", startDate)
        .lte("date", endDate)

      if (error) throw error

      // Group by student and calculate totals
      const revenueByStudent = new Map<string, StudentRevenue>()

      data?.forEach((session: any) => {
        const studentId = session.student_id
        const studentName = session.students.name
        const amount = session.total_amount || 0

        if (revenueByStudent.has(studentId)) {
          const existing = revenueByStudent.get(studentId)!
          existing.totalRevenue += amount
          existing.sessionCount += 1
        } else {
          revenueByStudent.set(studentId, {
            studentId,
            studentName,
            totalRevenue: amount,
            sessionCount: 1,
          })
        }
      })

      // Convert to array and sort by revenue descending
      const revenueArray = Array.from(revenueByStudent.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)

      setMonthlyRevenue(revenueArray)
    } catch (error) {
      console.error("Error fetching monthly revenue:", error)
    }
  }

  const fetchAllData = async () => {
    console.log("🔄 Fetching all data...")
    setIsLoading(true)
    await Promise.all([fetchTodayData(), fetchStudents(), fetchRecentSessions(), fetchPendingPayments(), fetchMonthlyRevenue()])
    setIsLoading(false)
    console.log("✅ All data fetched")
  }


  useEffect(() => {
    console.log("🔐 Initializing auth...")
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("👤 User session:", session?.user?.email || "Not logged in")
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 Auth state changed:", session?.user?.email || "Logged out")
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !authLoading) {
      fetchAllData()
    } else if (!user && !authLoading) {
      // Clear data when user logs out
      setTodayClasses([])
      setRecentSessions([])
      setStudents([])
      setPendingPayments([])
      setMonthlyRevenue([])
      setIsLoading(false)
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-primary/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/10 animate-ping" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            {/* Header skeleton */}
            <div className="pt-4 animate-fade-in">
              <div className="h-9 w-64 rounded bg-muted animate-skeleton mb-2" />
              <div className="h-5 w-96 rounded bg-muted/70 animate-skeleton" style={{ animationDelay: '0.1s' }} />
            </div>

            {/* Top Section - Log a Session and Today's Classes */}
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Log a Session Card Skeleton */}
              <div className="rounded-lg border bg-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="p-6 border-b">
                  <div className="h-6 w-40 rounded bg-muted animate-skeleton" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="h-4 w-16 rounded bg-muted animate-skeleton mb-2" />
                      <div className="h-10 w-full rounded bg-muted animate-skeleton" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-12 rounded bg-muted animate-skeleton mb-2" />
                      <div className="h-10 w-full rounded bg-muted animate-skeleton" />
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-16 rounded bg-muted animate-skeleton mb-2" />
                    <div className="h-10 w-full rounded bg-muted animate-skeleton" />
                  </div>
                  <div className="h-10 w-full rounded bg-muted animate-skeleton" />
                </div>
              </div>

              {/* Today's Schedule Card Skeleton */}
              <div className="rounded-lg border bg-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <div className="p-6 border-b">
                  <div className="h-6 w-48 rounded bg-muted animate-skeleton" />
                </div>
                <div className="p-6 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded border animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                      <div className="h-10 w-10 rounded bg-muted animate-skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-muted animate-skeleton" />
                        <div className="h-3 w-24 rounded bg-muted/70 animate-skeleton" />
                      </div>
                      <div className="h-8 w-20 rounded bg-muted animate-skeleton" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Payments and Monthly Revenue Section */}
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card animate-scale-in" style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
                  <div className="p-6 border-b">
                    <div className="h-6 w-48 rounded bg-muted animate-skeleton" />
                  </div>
                  <div className="p-6 space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3 p-3 rounded">
                        <div className="flex-1">
                          <div className="h-4 w-32 rounded bg-muted animate-skeleton mb-2" />
                          <div className="h-3 w-24 rounded bg-muted/70 animate-skeleton" />
                        </div>
                        <div className="h-8 w-20 rounded bg-muted animate-skeleton" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Section */}
            <div className="rounded-lg border bg-card animate-scale-in" style={{ animationDelay: '1.1s' }}>
              <div className="p-6 border-b">
                <div className="h-6 w-40 rounded bg-muted animate-skeleton" />
              </div>
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded border">
                    <div className="h-10 w-10 rounded-full bg-muted animate-skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-muted animate-skeleton" />
                      <div className="h-3 w-32 rounded bg-muted/70 animate-skeleton" />
                    </div>
                    <div className="h-6 w-16 rounded bg-muted animate-skeleton" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const metadata = (user?.user_metadata as { full_name?: string }) ?? {}
  const derivedFirstName = metadata.full_name?.trim().split(" ")[0]
  const firstName = derivedFirstName ?? user?.email?.split("@")[0]
  const currentHour = new Date().getHours()
  const timeOfDay =
    currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : currentHour < 22 ? "evening" : "night"
  const headerIcon = currentHour < 18 ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <PageHeader
            icon={headerIcon}
            eyebrow="Dashboard"
            title={`Good ${timeOfDay}${firstName ? `, ${firstName}` : ""}!`}
            description="Review today's schedule, log new sessions, and monitor outstanding payments at a glance."
          />



          {/* Top Section - Log a Session and Today's Classes */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Log a Session Card */}
            <Card>
              <CardHeader>
                <CardTitle>Log a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-end mb-2">
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <Label htmlFor="student" className="mb-1">Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student" className="w-full" >
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
                  <div className="flex flex-col min-w-[180px]">
                    <Label className="mb-1">Date</Label>
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
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="1.0"
                  />
                </div>

                <Button
                  onClick={handleLogSession}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50 relative"
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
            <TodaySchedule todayClasses={todayClasses} onRefresh={fetchAllData} />
          </div>

          {/* Pending Payments and Monthly Revenue Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <PendingPayments studentsWithPendingPayments={pendingPayments} onRefresh={fetchAllData} />
            <MonthlyRevenue studentRevenues={monthlyRevenue} />
          </div>

          {/* Bottom Section - Recent Activity */}
          <RecentActivity recentSessions={recentSessions} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
