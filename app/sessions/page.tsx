"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, DollarSign, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SessionsTable } from "@/components/sessions/sessions-table"
import { SessionForm } from "@/components/sessions/session-form"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { ExportDialog } from "@/components/export/export-dialog"

interface Session {
  id: string
  student_id: string
  student_name: string
  date: string
  duration_minutes: number
  hourly_rate: number
  total_amount: number
  is_paid: boolean
  notes: string
  created_at: string
  is_cancelled: boolean
  cancelled_by?: "teacher" | "student" | null
  user_id: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | undefined>()

  const fetchSessions = useCallback(async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select(`
          *,
          students!tutoring_sessions_student_fk(name)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) throw error

      const formattedSessions = (data || []).map((session: any) => ({
        ...session,
        student_name: session.students.name,
      }))

      setSessions(formattedSessions)
      setFilteredSessions(formattedSessions)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupRealtime = async () => {
      try {
        const user = await requireAuthUser(supabase)
        channel = supabase
          .channel(`sessions-changes-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "tutoring_sessions",
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              fetchSessions()
            },
          )
          .subscribe()
      } catch (error) {
        console.error("Error subscribing to session changes:", error)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchSessions])

  useEffect(() => {
    let filtered = sessions

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (session) =>
          session.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.date.includes(searchQuery),
      )
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((session) => {
        if (session.is_cancelled) return false
        return paymentFilter === "paid" ? session.is_paid : !session.is_paid
      })
    }

    setFilteredSessions(filtered)
  }, [searchQuery, paymentFilter, sessions])

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingSession(undefined)
  }

  // Calculate statistics
  const cancelledSessions = sessions.filter((s) => s.is_cancelled)
  const activeSessions = sessions.filter((s) => !s.is_cancelled)
  const totalSessions = sessions.length
  const totalRevenue = sessions.reduce((sum, s) => sum + s.total_amount, 0)
  const unpaidAmount = activeSessions.filter((s) => !s.is_paid).reduce((sum, s) => sum + s.total_amount, 0)
  const totalHours = activeSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between pt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
              <p className="text-muted-foreground">Track and manage your tutoring sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <ExportDialog
                students={sessions.reduce((acc: any[], session) => {
                  const existing = acc.find((s) => s.name === session.student_name)
                  if (!existing) {
                    acc.push({
                      id: session.student_id,
                      name: session.student_name,
                      email: `${session.student_name.toLowerCase().replace(" ", ".")}@example.com`,
                    })
                  }
                  return acc
                }, [])}
              />
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Session
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">{cancelledSessions.length} cancelled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">${unpaidAmount.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Sessions</CardTitle>
                  <CardDescription>A complete log of your tutoring sessions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
              ) : (
                <SessionsTable sessions={filteredSessions} onEdit={handleEdit} onRefresh={fetchSessions} />
              )}
            </CardContent>
          </Card>
        </div>

        <SessionForm
          session={editingSession}
          open={showForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchSessions}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
