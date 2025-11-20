"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useCurrency } from "@/components/currency-provider"

interface SessionDetail {
  id: string
  date: string
  duration_minutes: number
  total_amount: number
}

interface StudentPayment {
  studentId: string
  studentName: string
  totalUnpaid: number
  unpaidSessions: number
}

interface PendingPaymentsProps {
  studentsWithPendingPayments: StudentPayment[]
  onRefresh: () => void
}

export function PendingPayments({ studentsWithPendingPayments, onRefresh }: PendingPaymentsProps) {
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
  const [sessionDetails, setSessionDetails] = useState<SessionDetail[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { formatCurrency } = useCurrency()

  const fetchSessionDetails = async (studentId: string, studentName: string) => {
    setIsLoadingDetails(true)
    setSelectedStudent({ id: studentId, name: studentName })
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      const { data, error } = await supabase
        .from("tutoring_sessions")
        .select("id, date, duration_minutes, total_amount")
        .eq("user_id", user.id)
        .eq("student_id", studentId)
        .eq("is_paid", false)
        .eq("is_cancelled", false)
        .order("date", { ascending: true })

      if (error) throw error

      setSessionDetails(data || [])
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching session details:", error)
      toast({
        title: "Error",
        description: "Failed to load session details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleMarkAllPaid = async (studentId: string, studentName: string) => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      // Update all unpaid sessions for this student
      const { error } = await supabase
        .from("tutoring_sessions")
        .update({ is_paid: true })
        .eq("user_id", user.id)
        .eq("student_id", studentId)
        .eq("is_paid", false)
        .eq("is_cancelled", false)

      if (error) throw error

      toast({
        title: "Success",
        description: `All sessions marked as paid for ${studentName}`,
      })

      setIsDialogOpen(false)
      onRefresh()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const totalHours = sessionDetails.reduce((sum, session) => sum + session.duration_minutes / 60, 0)
  const totalAmount = sessionDetails.reduce((sum, session) => sum + session.total_amount, 0)

  if (studentsWithPendingPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pending Payments
            <span className="text-base font-normal text-red-600">( {formatCurrency(0)} )</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No pending payments! All caught up 🎉
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pending Payments
          <span className="text-base font-normal text-red-600">
            ( {formatCurrency(studentsWithPendingPayments.reduce((sum, s) => sum + s.totalUnpaid, 0))} )
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {studentsWithPendingPayments.map((student) => (
            <div
              key={student.studentId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium">{student.studentName}</span>
                <span className="text-sm text-muted-foreground">
                  {student.unpaidSessions} session{student.unpaidSessions !== 1 ? "s" : ""} unpaid
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold text-lg text-red-600">
                    {formatCurrency(student.totalUnpaid)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchSessionDetails(student.studentId, student.studentName)}
                  disabled={isLoadingDetails}
                  className="relative"
                >
                  {isLoadingDetails ? (
                    <>
                      <div className="mr-1.5 h-3 w-3 rounded-full border-2 border-foreground/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                      Loading
                    </>
                  ) : (
                    "Show"
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleMarkAllPaid(student.studentId, student.studentName)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Pay All
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Unpaid Sessions - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {sessionDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No unpaid sessions found
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionDetails.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(new Date(session.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          {(session.duration_minutes / 60).toFixed(2)}h
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(session.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {totalHours.toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => selectedStudent && handleMarkAllPaid(selectedStudent.id, selectedStudent.name)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Pay All
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
