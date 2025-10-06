"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TodaySchedule } from "@/components/today/today-schedule"
import { QuickStats } from "@/components/today/quick-stats"
import { RecentActivity } from "@/components/today/recent-activity"
import { QuickActions } from "@/components/today/quick-actions"
import { LandingPage } from "@/components/landing/landing-page"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { User } from "@supabase/supabase-js"

interface TodayClass {
  id: string
  student_id: string
  student_name: string
  student_hourly_rate: number
  start_time: string
  duration_minutes: number
  has_session: boolean
  session_id?: string
}

interface RecentSession {
  id: string
  student_name: string
  date: string
  duration_minutes: number
  total_amount: number
  is_paid: boolean
  notes: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [todayStats, setTodayStats] = useState({
    scheduledClasses: 0,
    completedSessions: 0,
    totalEarnings: 0,
    totalHours: 0,
  })
  const [weekStats, setWeekStats] = useState({
    totalSessions: 0,
    totalEarnings: 0,
    totalHours: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchTodayData = async () => {
    try {
      const supabase = createClient()
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
          students!inner(name, hourly_rate)
        `)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true)

      if (scheduledError) throw scheduledError

      // Get today's completed sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("tutoring_sessions")
        .select("student_id, id")
        .eq("date", todayString)

      if (sessionsError) throw sessionsError

      // Combine scheduled classes with session status
      const todayClassesWithSessions = (scheduledData || []).map((cls: any) => {
        const session = sessionsData?.find((s) => s.student_id === cls.student_id)
        return {
          id: cls.id,
          student_id: cls.student_id,
          student_name: cls.students.name,
          student_hourly_rate: cls.students.hourly_rate,
          start_time: cls.start_time,
          duration_minutes: cls.duration_minutes,
          has_session: !!session,
          session_id: session?.id,
        }
      })

      setTodayClasses(todayClassesWithSessions)

      // Calculate today's stats
      const completedSessions = todayClassesWithSessions.filter((cls) => cls.has_session)
      const todayEarnings = completedSessions.reduce(
        (sum, cls) => sum + (cls.student_hourly_rate * cls.duration_minutes) / 60,
        0,
      )
      const todayHours = completedSessions.reduce((sum, cls) => sum + cls.duration_minutes, 0) / 60

      setTodayStats({
        scheduledClasses: todayClassesWithSessions.length,
        completedSessions: completedSessions.length,
        totalEarnings: todayEarnings,
        totalHours: todayHours,
      })
    } catch (error) {
      console.error("Error fetching today's data:", error)
      toast({
        title: "Error",
        description: "Failed to load today's data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchWeekStats = async () => {
    try {
      const supabase = createClient()
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("duration_minutes, total_amount")
        .gte("date", startOfWeek.toISOString().split("T")[0])
        .lte("date", endOfWeek.toISOString().split("T")[0])

      if (error) throw error

      const weekTotalSessions = data?.length || 0
      const weekTotalEarnings = data?.reduce((sum, session) => sum + session.total_amount, 0) || 0
      const weekTotalHours = data?.reduce((sum, session) => sum + session.duration_minutes, 0) / 60 || 0

      setWeekStats({
        totalSessions: weekTotalSessions,
        totalEarnings: weekTotalEarnings,
        totalHours: weekTotalHours,
      })
    } catch (error) {
      console.error("Error fetching week stats:", error)
    }
  }

  const fetchRecentSessions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          id,
          date,
          duration_minutes,
          total_amount,
          is_paid,
          notes,
          students!inner(name)
        `)
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
    setIsLoading(true)
    await Promise.all([fetchTodayData(), fetchWeekStats(), fetchRecentSessions()])
    setIsLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      setTodayStats({
        scheduledClasses: 0,
        completedSessions: 0,
        totalEarnings: 0,
        totalHours: 0,
      })
      setWeekStats({
        totalSessions: 0,
        totalEarnings: 0,
        totalHours: 0,
      })
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

          <QuickStats todayStats={todayStats} weekStats={weekStats} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <TodaySchedule todayClasses={todayClasses} onRefresh={fetchTodayData} />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity recentSessions={recentSessions} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
