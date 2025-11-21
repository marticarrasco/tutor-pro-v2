"use client"

import { useState, useEffect } from "react"
import { Plus, Search, DollarSign, Clock, Users } from "lucide-react"
import { useDocumentTitle, useDocumentMeta } from "@/hooks/use-document-title"
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
import { PageHeader } from "@/components/page-header"
import { useCurrency } from "@/components/currency-provider"
import { useTranslations } from 'next-intl'

import { Session } from "@/types/data"

export default function SessionsPage() {
  const t = useTranslations('SessionsPage')
  useDocumentTitle(t('documentTitle'))
  useDocumentMeta(t('documentDescription'))

  const { formatCurrency } = useCurrency()

  const [sessions, setSessions] = useState<Session[]>([])
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | undefined>()

  const fetchSessions = async () => {
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
        title: t('errorLoading'),
        description: t('errorLoadingDescription'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

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

  const sortSessionsByDate = (sessionList: Session[]) =>
    [...sessionList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSessionSaved = (session: Session, mode: "create" | "update") => {
    setSessions((prev) => {
      const updated =
        mode === "create"
          ? [...prev, session]
          : prev.map((existing) => (existing.id === session.id ? { ...existing, ...session } : existing))
      return sortSessionsByDate(updated)
    })
  }

  const handleSessionDeleted = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
  }

  const handlePaymentStatusChange = (sessionId: string, isPaid: boolean) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, is_paid: isPaid } : session)),
    )
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
          <PageHeader
            icon={<Clock className="h-6 w-6" />}
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
            action={
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
                  {t('addSession')}
                </Button>
              </div>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalSessions')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">{cancelledSessions.length} {t('cancelled')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('unpaidAmount')}</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(unpaidAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalHours')}</CardTitle>
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
                  <CardTitle>{t('allSessions')}</CardTitle>
                  <CardDescription>{t('allSessionsDescription')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filterAll')}</SelectItem>
                      <SelectItem value="paid">{t('filterPaid')}</SelectItem>
                      <SelectItem value="unpaid">{t('filterUnpaid')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('searchPlaceholder')}
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
                <div className="text-center py-8 text-muted-foreground">{t('loadingSessions')}</div>
              ) : (
                <SessionsTable
                  sessions={filteredSessions}
                  onEdit={handleEdit}
                  onDelete={handleSessionDeleted}
                  onPaymentStatusChange={handlePaymentStatusChange}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <SessionForm
          session={editingSession}
          open={showForm}
          onOpenChange={handleFormClose}
          onSuccess={handleSessionSaved}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
