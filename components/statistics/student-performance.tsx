"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChartPeriodSelector, ChartPeriod } from "./chart-period-selector"

interface StudentStats {
  id: string
  name: string
  total_sessions: number
  total_revenue: number
  total_hours: number
  avg_session_duration: number
  is_active: boolean
}

interface StudentPerformanceProps {
  studentStats: StudentStats[]
  period: ChartPeriod
  onPeriodChange: (period: ChartPeriod) => void
}

export function StudentPerformance({ studentStats, period, onPeriodChange }: StudentPerformanceProps) {
  // Removed maxRevenue as revenue progress bar is not needed
  const maxSessions = studentStats.length > 0 ? Math.max(...studentStats.map((s) => s.total_sessions)) : 0

  const formatHours = (minutes: number) => {
    const hours = minutes / 60
    return hours.toFixed(1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Performance</CardTitle>
            <CardDescription>Revenue and session statistics by student</CardDescription>
          </div>
          <ChartPeriodSelector value={period} onChange={onPeriodChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {studentStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No student data available</div>
        ) : (
          studentStats.map((student) => (
            <div key={student.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{student.name}</span>
                  <Badge variant={student.is_active ? "default" : "secondary"}>
                    {student.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${student.total_revenue.toFixed(2)} • {student.total_sessions} sessions
                </div>
              </div>
              {/* Revenue progress bar removed as requested */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Hours</div>
                  <div className="font-medium">{formatHours(student.total_hours)}h</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Avg Session</div>
                  <div className="font-medium">{Math.round(student.avg_session_duration)}min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rate</div>
                  <div className="font-medium">
                    ${student.total_hours > 0 ? (student.total_revenue / (student.total_hours / 60)).toFixed(0) : "0"}
                    /hr
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
