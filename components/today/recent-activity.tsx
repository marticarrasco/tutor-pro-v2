"use client"

import { Clock, User } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentSession {
  id: string
  student_name: string
  date: string
  duration_minutes: number
  total_amount: number
  is_paid: boolean
  notes: string
  is_cancelled: boolean
  cancelled_by?: "teacher" | "student" | null
}

interface RecentActivityProps {
  recentSessions: RecentSession[]
}

export function RecentActivity({ recentSessions }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0h"
    const hours = minutes / 60
    return Number.isInteger(hours) ? `${hours}h` : `${Number.parseFloat(hours.toFixed(2))}h`
  }

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [sessions, setSessions] = useState(recentSessions)

  // Update local state if prop changes
  useEffect(() => {
    setSessions(recentSessions)
  }, [recentSessions])

  const handleTogglePaid = async (session: RecentSession) => {
    setUpdatingId(session.id)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { error } = await supabase
        .from("tutoring_sessions")
        .update({ is_paid: !session.is_paid })
        .eq("id", session.id)
        .eq("user_id", user.id)
      if (error) throw error
      toast({
        title: !session.is_paid ? "Marked as paid" : "Marked as unpaid",
        description: `Session with ${session.student_name} updated.`,
      })
      // Update UI immediately
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, is_paid: !session.is_paid } : s
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest tutoring sessions</CardDescription>
      </CardHeader>
      <CardContent>
  {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent sessions</p>
            <p className="text-sm">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {session.student_name}
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        {formatDate(session.date)}
                        <span>•</span>
                        {formatDuration(session.duration_minutes)}
                      </span>
                    </div>
                    {session.is_cancelled ? (
                      <div className="text-sm text-amber-600 dark:text-amber-300">
                        Cancelled by {session.cancelled_by === "teacher" ? "teacher" : "student"}
                      </div>
                    ) : null}
                    {session.notes && (
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{session.notes}</div>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={session.is_cancelled ? "outline" : session.is_paid ? "default" : "destructive"}
                      className={`text-xs cursor-pointer${updatingId === session.id ? ' opacity-50 pointer-events-none' : ''}`}
                      onClick={() => updatingId !== session.id && handleTogglePaid(session)}
                    >
                      {session.is_cancelled ? "Cancelled" : session.is_paid ? "Paid" : "Unpaid"}
                    </Badge>
                    <span className="font-semibold">${session.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
