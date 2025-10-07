"use client"

import { Clock, User } from "lucide-react"
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
        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent sessions</p>
            <p className="text-sm">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{session.student_name}</div>
                    {session.is_cancelled ? (
                      <div className="text-sm text-amber-600 dark:text-amber-300">
                        Cancelled by {session.cancelled_by === "teacher" ? "teacher" : "student"}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{formatDate(session.date)}</span>
                        <span>•</span>
                        <span>{formatDuration(session.duration_minutes)}</span>
                      </div>
                    )}
                    {session.notes && (
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{session.notes}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${session.total_amount.toFixed(2)}</div>
                  <Badge
                    variant={session.is_cancelled ? "outline" : session.is_paid ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {session.is_cancelled ? "Cancelled" : session.is_paid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
