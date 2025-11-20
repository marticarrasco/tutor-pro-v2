"use client"

import { useState } from "react"
import { Plus, DollarSign, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoSessionsTable } from "@/components/demo/sessions/demo-sessions-table"
import { DemoSessionForm } from "@/components/demo/sessions/demo-session-form"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Toaster } from "@/components/ui/toaster"
import { ExportDialog } from "@/components/export/export-dialog"

export default function DemoSessionsPage() {
  const { sessions } = useDemoData()
  const [showForm, setShowForm] = useState(false)

  // Calculate statistics
  const cancelledSessions = sessions.filter((s) => s.payment_status === 'cancelled')
  const activeSessions = sessions.filter((s) => s.payment_status !== 'cancelled')
  const totalSessions = sessions.length
  const totalRevenue = sessions
    .filter(s => s.payment_status !== 'cancelled')
    .reduce((sum, s) => sum + s.total_amount, 0)
  const unpaidAmount = activeSessions
    .filter((s) => s.payment_status === 'pending')
    .reduce((sum, s) => sum + s.total_amount, 0)
  const totalHours = activeSessions.reduce((sum, s) => sum + s.duration, 0)

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<Clock className="h-6 w-6" />}
            eyebrow="Sessions"
            title="Session History"
            description="Filter, edit, and export your tutoring sessions to stay on top of payments and lesson notes."
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
                  Log Session
                </Button>
              </div>
            }
          />

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
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>A complete log of your tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <DemoSessionsTable />
            </CardContent>
          </Card>
        </div>

        <DemoSessionForm
          open={showForm}
          onOpenChange={setShowForm}
        />
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
