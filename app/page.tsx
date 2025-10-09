"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { RecentActivity } from "@/components/today/recent-activity"
import { TodaySchedule } from "@/components/today/today-schedule"
import { LandingPage } from "@/components/landing/landing-page"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

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
        .limit(5)

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

  const fetchAllData = async () => {
    console.log("🔄 Fetching all data...")
    setIsLoading(true)
    await Promise.all([fetchTodayData(), fetchStudents(), fetchRecentSessions()])
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
      setIsLoading(false)
    }
  }, [user, authLoading])

  if (authLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="text-center py-8 text-muted-foreground">Loading your dashboard...</div>
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
          <div className="pt-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}!
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your tutoring today</p>
          </div>

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
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </CardContent>
            </Card>
            {/* Today's Schedule Card */}
            <TodaySchedule todayClasses={todayClasses} onRefresh={fetchAllData} />
          </div>

          {/* Bottom Section - Recent Activity */}
          <RecentActivity recentSessions={recentSessions} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
