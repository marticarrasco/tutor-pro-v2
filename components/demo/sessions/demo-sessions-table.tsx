"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { useDemoData, DemoSession } from "@/lib/demo-context"
import { useDemoSignUp } from "@/lib/demo-signup-context"
import { toast } from "@/hooks/use-toast"
import { DemoSessionForm } from "./demo-session-form"

export function DemoSessionsTable() {
    const { sessions, updateSession, deleteSession } = useDemoData()
    const { showSignUpDialog } = useDemoSignUp()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all")
    const [editingSession, setEditingSession] = useState<DemoSession | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)

    // Filter sessions
    const filteredSessions = sessions.filter((session) => {
        const matchesSearch =
            session.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.subject.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || session.payment_status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Sort by date descending
    const sortedSessions = [...filteredSessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const handleEdit = (session: DemoSession) => {
        setEditingSession(session)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            deleteSession(id)
            toast({
                title: "Session deleted",
                description: "The session has been permanently deleted.",
            })
        } catch (error) {
            showSignUpDialog()
        }
    }

    const togglePaymentStatus = async (session: DemoSession) => {
        try {
            const newStatus = session.payment_status === "paid" ? "pending" : "paid"
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
            updateSession(session.id, { payment_status: newStatus })
            toast({
                title: "Status updated",
                description: `Payment status marked as ${newStatus}.`,
            })
        } catch (error) {
            showSignUpDialog()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        onClick={() => setStatusFilter("all")}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === "paid" ? "default" : "outline"}
                        onClick={() => setStatusFilter("paid")}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        Paid
                    </Button>
                    <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        onClick={() => setStatusFilter("pending")}
                        size="sm"
                        className="flex-1 sm:flex-none"
                    >
                        Pending
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSessions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No sessions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedSessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        <div className="font-medium">{session.student_name}</div>
                                        <div className="text-xs text-muted-foreground">{session.subject}</div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(session.date), "MMM d, yyyy")}
                                        <div className="text-xs text-muted-foreground">{session.start_time}</div>
                                    </TableCell>
                                    <TableCell>{session.duration}h</TableCell>
                                    <TableCell>${session.total_amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={session.payment_status === "paid" ? "default" : "secondary"}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => togglePaymentStatus(session)}
                                        >
                                            {session.payment_status === "paid" ? (
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                            ) : (
                                                <Clock className="mr-1 h-3 w-3" />
                                            )}
                                            {session.payment_status === "paid" ? "Paid" : "Pending"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(session)}>
                                                    Edit details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDelete(session.id)}
                                                >
                                                    Delete session
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DemoSessionForm
                open={isFormOpen}
                onOpenChange={(open) => {
                    setIsFormOpen(open)
                    if (!open) {
                        setEditingSession(null)
                    }
                }}
                session={editingSession || undefined}
            />
        </div>
    )
}
