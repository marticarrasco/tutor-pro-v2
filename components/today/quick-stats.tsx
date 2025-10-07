"use client"

import { DollarSign, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickStatsProps {
  todayStats: {
    scheduledClasses: number
    completedSessions: number
    cancelledSessions: number
    totalEarnings: number
    totalHours: number
  }
  weekStats: {
    totalSessions: number
    totalEarnings: number
    totalHours: number
  }
}

export function QuickStats({ todayStats, weekStats }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {todayStats.completedSessions}/{todayStats.scheduledClasses}
          </div>
          <p className="text-xs text-muted-foreground">
            {todayStats.cancelledSessions} cancelled •
            {" "}
            {Math.max(
              todayStats.scheduledClasses - todayStats.completedSessions - todayStats.cancelledSessions,
              0,
            )}{" "}
            remaining
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${todayStats.totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{todayStats.totalHours.toFixed(1)} hours taught</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekStats.totalSessions}</div>
          <p className="text-xs text-muted-foreground">sessions completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Week Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${weekStats.totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{weekStats.totalHours.toFixed(1)} hours total</p>
        </CardContent>
      </Card>
    </div>
  )
}
