"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface StudentRevenue {
  studentId: string
  studentName: string
  totalRevenue: number
  sessionCount: number
}

interface MonthlyRevenueProps {
  studentRevenues: StudentRevenue[]
}

export function MonthlyRevenue({ studentRevenues }: MonthlyRevenueProps) {
  const totalRevenue = studentRevenues.reduce((sum, s) => sum + s.totalRevenue, 0)
  const totalSessions = studentRevenues.reduce((sum, s) => sum + s.sessionCount, 0)

  if (studentRevenues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Month's Revenue
            <span className="text-base font-normal text-green-600">( $0.00 )</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No sessions this month yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          This Month's Revenue
          <span className="text-base font-normal text-green-600">
            ( ${totalRevenue.toFixed(2)} )
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {studentRevenues.map((student) => (
            <div
              key={student.studentId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium">{student.studentName}</span>
                <span className="text-sm text-muted-foreground">
                  {student.sessionCount} session{student.sessionCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-green-600">
                  ${student.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
          
          {studentRevenues.length > 1 && (
            <div className="pt-3 mt-3 border-t">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Total</span>
                  <span className="text-sm text-muted-foreground">
                    {totalSessions} session{totalSessions !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="font-bold text-xl text-green-600">
                  ${totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
