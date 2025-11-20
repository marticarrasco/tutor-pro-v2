"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"

import { Session } from "@/types/data"

interface SessionsTableProps {
  sessions: Session[]
  onEdit: (session: Session) => void
  onRefresh: () => void
}

export function SessionsTable({ sessions, onEdit, onRefresh }: SessionsTableProps) {
  const [deleteSession, setDeleteSession] = useState<Session | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteSession) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { error } = await supabase
        .from("tutoring_sessions")
        .delete()
        .eq("id", deleteSession.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({ title: "Session deleted successfully" })
      onRefresh()
      setDeleteSession(null)
    } catch (error) {
      console.error("Error deleting session:", error)
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const togglePayment = async (session: Session) => {
    if (session.is_cancelled) {
      toast({
        title: "Cancelled session",
        description: "Cancelled sessions cannot be marked as paid.",
      })
      return
    }
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { error } = await supabase
        .from("tutoring_sessions")
        .update({ is_paid: !session.is_paid, updated_at: new Date().toISOString() })
        .eq("id", session.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: session.is_paid ? "Marked as unpaid" : "Marked as paid",
        description: `Session with ${session.student_name} updated.`,
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0h"
    const hours = minutes / 60
    return Number.isInteger(hours) ? `${hours}h` : `${Number.parseFloat(hours.toFixed(2))}h`
  }

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No sessions found. Log your first session to get started.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id} className="border-border">
                  <TableCell className="font-medium">{session.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(session.date)}</TableCell>
                  <TableCell className="font-mono">{formatDuration(session.duration_minutes)}</TableCell>
                  <TableCell className="font-mono">${session.hourly_rate.toFixed(2)}/hr</TableCell>
                  <TableCell className="font-mono font-semibold">${session.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {session.is_cancelled ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-400">
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge
                        variant={session.is_paid ? "default" : "destructive"}
                        className="cursor-pointer"
                        onClick={() => togglePayment(session)}
                      >
                        {session.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{session.notes || "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePayment(session)} disabled={session.is_cancelled}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {session.is_paid ? "Mark Unpaid" : "Mark Paid"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(session)} disabled={session.is_cancelled}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteSession(session)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session with {deleteSession?.student_name} on{" "}
              {deleteSession && formatDate(deleteSession.date)}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
