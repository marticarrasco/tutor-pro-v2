"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Sun, DollarSign, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Toaster } from "@/components/ui/toaster"

export default function DemoHomePage() {
  const { students, sessions, addSession } = useDemoData()
  
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hours, setHours] = useState("1.0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogSession = async () => {
    if (!selectedStudentId || !selectedDate || !hours) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const selectedStudent = students.find((s) => s.id === selectedStudentId)
      if (!selectedStudent) {
        throw new Error("Student not found")
      }

      const duration = parseFloat(hours)
      const total = duration * selectedStudent.hourly_rate

      addSession({
        student_id: selectedStudentId,
        student_name: selectedStudent.name,
        subject: selectedStudent.subject,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: "14:00",
        end_time: format(new Date(new Date().setHours(14 + Math.floor(duration), (duration % 1) * 60)), "HH:mm"),
        duration,
        hourly_rate: selectedStudent.hourly_rate,
        total_amount: total,
        payment_status: 'pending',
        notes: '',
      })

      toast({
        title: "Session logged successfully",
        description: `Logged ${hours}h session for ${selectedStudent.name}`,
      })
      
      setSelectedStudentId("")
      setSelectedDate(new Date())
      setHours("1.0")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeStudents = students.length
  const todaySessions = sessions.filter(s => s.date === format(new Date(), "yyyy-MM-dd"))
  const thisWeekRevenue = sessions
    .filter(s => s.payment_status !== 'cancelled')
    .slice(0, 7)
    .reduce((sum, s) => sum + s.total_amount, 0)
  const recentSessions = sessions.slice(0, 5)
  const pendingPayments = sessions.filter(s => s.payment_status === 'pending')
  const totalPending = pendingPayments.reduce((sum, s) => sum + s.total_amount, 0)

  return (
    <SidebarProvider>
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <PageHeader
            icon={<Sun className="h-6 w-6" />}
            eyebrow="Dashboard"
            title="Good afternoon, Demo User!"
            description="Review today's schedule, log new sessions, and monitor outstanding payments at a glance."
          />

          {/* Top Section - Log a Session and Today's Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Log a Session Card */}
            <Card>
              <CardHeader>
                <CardTitle>Log a Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-end mb-2">
                  <div className="flex flex-col flex-1 min-w-[200px]">
                    <Label htmlFor="student" className="mb-1">Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger id="student" className="w-full">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col min-w-[180px]">
                    <Label className="mb-1">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          weekStartsOn={1}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="1.0"
                  />
                </div>

                <Button
                  onClick={handleLogSession}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50 relative"
                >
                  {isSubmitting ? "Logging Session..." : "Log Session"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{todaySessions.length}</div>
                  <p className="text-xs text-muted-foreground">sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${thisWeekRevenue}</div>
                  <p className="text-xs text-muted-foreground">earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeStudents}</div>
                  <p className="text-xs text-muted-foreground">students</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${totalPending}</div>
                  <p className="text-xs text-muted-foreground">unpaid</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.subject} • {session.duration}h • {format(new Date(session.date), "MMM d")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${session.total_amount}</p>
                      <p className={`text-xs ${
                        session.payment_status === 'paid' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {session.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

