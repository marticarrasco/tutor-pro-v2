"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useDemoData } from "@/lib/demo-context"
import { useDemoSignUp } from "@/lib/demo-signup-context"

interface SessionDetail {
    id: string
    date: string
    duration: number
    total_amount: number
}

interface StudentPayment {
    studentId: string
    studentName: string
    totalUnpaid: number
    unpaidSessions: number
}

interface DemoPendingPaymentsProps {
    studentsWithPendingPayments: StudentPayment[]
    onRefresh: () => void
}

export function DemoPendingPayments({ studentsWithPendingPayments, onRefresh }: DemoPendingPaymentsProps) {
    const { sessions, updateSession } = useDemoData()
    const { showSignUpDialog } = useDemoSignUp()
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
    const [sessionDetails, setSessionDetails] = useState<SessionDetail[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchSessionDetails = (studentId: string, studentName: string) => {
        setSelectedStudent({ id: studentId, name: studentName })

        const unpaidSessions = sessions
            .filter(s => s.student_id === studentId && s.payment_status === 'pending')
            .map(s => ({
                id: s.id,
                date: s.date,
                duration: s.duration,
                total_amount: s.total_amount
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        setSessionDetails(unpaidSessions)
        setIsDialogOpen(true)
    }

    const handleMarkAllPaid = (studentId: string, studentName: string) => {
        // Show sign-up dialog instead of actually updating
        showSignUpDialog()
    }

    const totalHours = sessionDetails.reduce((sum, session) => sum + session.duration, 0)
    const totalAmount = sessionDetails.reduce((sum, session) => sum + session.total_amount, 0)

    if (studentsWithPendingPayments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pending Payments
                        <span className="text-base font-normal text-red-600">( $0.00 )</span>
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
                        ( ${studentsWithPendingPayments.reduce((sum, s) => sum + s.totalUnpaid, 0).toFixed(2)} )
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
                                        ${student.totalUnpaid.toFixed(2)}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fetchSessionDetails(student.studentId, student.studentName)}
                                >
                                    Show
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
                                                    {session.duration.toFixed(2)}h
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    ${session.total_amount.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="font-bold bg-muted">
                                            <TableCell>Total</TableCell>
                                            <TableCell className="text-right">
                                                {totalHours.toFixed(2)}h
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${totalAmount.toFixed(2)}
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
