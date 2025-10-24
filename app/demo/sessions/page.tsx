"use client"

import { useState, useEffect } from "react"
import { BookOpen, Search, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { format } from "date-fns"

export default function DemoSessionsPage() {
  const { sessions, updateSession } = useDemoData()
  const [filteredSessions, setFilteredSessions] = useState(sessions)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!searchQuery) {
      setFilteredSessions(sessions)
    } else {
      const filtered = sessions.filter(
        (session) =>
          session.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSessions(filtered)
    }
  }, [searchQuery, sessions])

  const handleTogglePayment = (sessionId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    updateSession(sessionId, { payment_status: newStatus as 'paid' | 'pending' | 'cancelled' })
    toast({
      title: `Payment marked as ${newStatus}`,
      description: `Session payment status updated`,
    })
  }

  const totalSessions = sessions.filter(s => s.payment_status !== 'cancelled').length
  const paidSessions = sessions.filter(s => s.payment_status === 'paid').length
  const totalRevenue = sessions
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0)
  const pendingAmount = sessions
    .filter(s => s.payment_status === 'pending')
    .reduce((sum, s) => sum + s.total_amount, 0)

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<BookOpen className="h-6 w-6" />}
            eyebrow="Records"
            title="Session History"
            description="View and manage all your tutoring sessions, track payment status, and analyze your teaching history."
          />

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paidSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pendingAmount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Sessions</CardTitle>
                  <CardDescription>Complete history of your tutoring sessions</CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No sessions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSessions.map((session) => (
                        <TableRow key={session.id} className="border-border">
                          <TableCell className="font-medium">{session.student_name}</TableCell>
                          <TableCell className="text-muted-foreground">{session.subject}</TableCell>
                          <TableCell>{format(new Date(session.date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{session.duration}h</TableCell>
                          <TableCell className="font-medium">${session.total_amount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={session.payment_status === 'paid' ? 'default' : 'secondary'}
                              className={
                                session.payment_status === 'paid'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : session.payment_status === 'cancelled'
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : ''
                              }
                            >
                              {session.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {session.payment_status !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePayment(session.id, session.payment_status)}
                              >
                                {session.payment_status === 'paid' ? (
                                  <X className="h-4 w-4 mr-1" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                {session.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

