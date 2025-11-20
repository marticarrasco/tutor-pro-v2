"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react"
import { useTranslations } from "next-intl"
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
import { useCurrency } from "@/components/currency-provider"

import { Session } from "@/types/data"

interface SessionsTableProps {
  sessions: Session[]
  onEdit: (session: Session) => void
  onDelete: (sessionId: string) => void
  onPaymentStatusChange: (sessionId: string, isPaid: boolean) => void
}

export function SessionsTable({ sessions, onEdit, onDelete, onPaymentStatusChange }: SessionsTableProps) {
  const t = useTranslations('HomePage.SessionsTable')
  const [deleteSession, setDeleteSession] = useState<Session | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)
  const { formatCurrency } = useCurrency()

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

      toast({ title: t('deleteSuccess') })
      onDelete(deleteSession.id)
      setDeleteSession(null)
    } catch (error) {
      console.error("Error deleting session:", error)
      toast({
        title: t('deleteError'),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const togglePayment = async (session: Session) => {
    if (session.is_cancelled) {
      toast({
        title: t('cancelledSession'),
        description: t('cancelledSessionDescription'),
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
        title: session.is_paid ? t('markedUnpaid') : t('markedPaid'),
        description: t('paymentUpdateSuccess', { studentName: session.student_name }),
      })
      onPaymentStatusChange(session.id, !session.is_paid)
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: t('paymentUpdateError'),
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
              <TableHead>{t('student')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('duration')}</TableHead>
              <TableHead>{t('rate')}</TableHead>
              <TableHead>{t('total')}</TableHead>
              <TableHead>{t('payment')}</TableHead>
              <TableHead>{t('notes')}</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t('noSessions')}
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id} className="border-border">
                  <TableCell className="font-medium">{session.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(session.date)}</TableCell>
                  <TableCell className="font-mono">{formatDuration(session.duration_minutes)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(session.hourly_rate)}/hr</TableCell>
                  <TableCell className="font-mono font-semibold">{formatCurrency(session.total_amount)}</TableCell>
                  <TableCell>
                    {session.is_cancelled ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-400">
                        {t('cancelled')}
                      </Badge>
                    ) : (
                      <Badge
                        variant={session.is_paid ? "default" : "destructive"}
                        className="cursor-pointer"
                        onClick={() => togglePayment(session)}
                      >
                        {session.is_paid ? t('paid') : t('unpaid')}
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
                          {session.is_paid ? t('markUnpaid') : t('markPaid')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(session)} disabled={session.is_cancelled}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteSession(session)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('delete')}
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
            <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDescription', {
                studentName: deleteSession?.student_name || '',
                date: deleteSession ? formatDate(deleteSession.date) : ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
