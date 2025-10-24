"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { PageHeader } from "@/components/page-header"
import { Toaster } from "@/components/ui/toaster"

export default function DemoSchedulePage() {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const mockSchedule = [
    { day: 'Monday', time: '14:00', student: 'Sarah Johnson', subject: 'Mathematics' },
    { day: 'Monday', time: '16:00', student: 'David Chen', subject: 'Physics' },
    { day: 'Tuesday', time: '15:30', student: 'Emma Wilson', subject: 'Chemistry' },
    { day: 'Wednesday', time: '14:00', student: 'Sarah Johnson', subject: 'Mathematics' },
    { day: 'Thursday', time: '17:00', student: 'Michael Brown', subject: 'English' },
    { day: 'Friday', time: '13:00', student: 'Lisa Anderson', subject: 'History' },
  ]

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<Calendar className="h-6 w-6" />}
            eyebrow="Planning"
            title="Weekly Schedule"
            description="View and manage your weekly tutoring schedule at a glance."
          />

          <div className="grid gap-4">
            {daysOfWeek.map((day) => {
              const daySessions = mockSchedule.filter(s => s.day === day)
              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-lg">{day}</CardTitle>
                    <CardDescription>{daySessions.length} session(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {daySessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {daySessions.map((session, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="font-mono text-sm font-medium w-16">{session.time}</div>
                              <div>
                                <p className="font-medium">{session.student}</p>
                                <p className="text-sm text-muted-foreground">{session.subject}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

