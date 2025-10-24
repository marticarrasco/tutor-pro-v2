"use client"

import { BarChart3, TrendingUp, DollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Toaster } from "@/components/ui/toaster"

export default function DemoStatisticsPage() {
  const { sessions, students } = useDemoData()

  const totalRevenue = sessions
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0)
  
  const totalHours = sessions
    .filter(s => s.payment_status !== 'cancelled')
    .reduce((sum, s) => sum + s.duration, 0)

  const avgSessionRate = totalHours > 0 ? totalRevenue / totalHours : 0

  const studentStats = students.map(student => {
    const studentSessions = sessions.filter(s => s.student_id === student.id && s.payment_status !== 'cancelled')
    const revenue = studentSessions
      .filter(s => s.payment_status === 'paid')
      .reduce((sum, s) => sum + s.total_amount, 0)
    const hours = studentSessions.reduce((sum, s) => sum + s.duration, 0)
    
    return {
      name: student.name,
      sessions: studentSessions.length,
      hours,
      revenue,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<BarChart3 className="h-6 w-6" />}
            eyebrow="Analytics"
            title="Business Statistics"
            description="Track your tutoring business performance with detailed analytics and insights."
          />

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Hours taught</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${avgSessionRate.toFixed(0)}/hr</div>
                <p className="text-xs text-muted-foreground">Per hour</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions.filter(s => s.payment_status !== 'cancelled').length}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Student</CardTitle>
              <CardDescription>See which students contribute most to your revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentStats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{stat.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stat.sessions} sessions • {stat.hours.toFixed(1)}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${stat.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Overview of payment collection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid Sessions</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {sessions.filter(s => s.payment_status === 'paid').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Payments</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {sessions.filter(s => s.payment_status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Pending Amount</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      ${sessions.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + s.total_amount, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teaching Subjects</CardTitle>
                <CardDescription>Hours by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    sessions
                      .filter(s => s.payment_status !== 'cancelled')
                      .reduce((acc, s) => {
                        acc[s.subject] = (acc[s.subject] || 0) + s.duration
                        return acc
                      }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([subject, hours]) => (
                      <div key={subject} className="flex items-center justify-between">
                        <span className="text-sm">{subject}</span>
                        <span className="font-bold">{hours.toFixed(1)}h</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

