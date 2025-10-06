"use client"

import { useState } from "react"
import { Clock, User, Plus, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SessionForm } from "@/components/sessions/session-form"

interface TodayClass {
  id: string
  student_id: string
  student_name: string
  student_hourly_rate: number
  start_time: string
  duration_minutes: number
  has_session: boolean
  session_id?: string
}

interface TodayScheduleProps {
  todayClasses: TodayClass[]
  onRefresh: () => void
}

export function TodaySchedule({ todayClasses, onRefresh }: TodayScheduleProps) {
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [selectedClass, setSelectedClass] = useState<TodayClass | null>(null)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const getEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60
    const endTimeString = `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
    return formatTime(endTimeString)
  }

  const handleLogSession = (todayClass: TodayClass) => {
    setSelectedClass(todayClass)
    setShowSessionForm(true)
  }

  const handleSessionFormClose = () => {
    setShowSessionForm(false)
    setSelectedClass(null)
  }

  const handleSessionSuccess = () => {
    onRefresh()
    handleSessionFormClose()
  }

  // Create initial session data from scheduled class
  const getInitialSessionData = () => {
    if (!selectedClass) return undefined

    return {
      student_id: selectedClass.student_id,
      date: new Date().toISOString().split("T")[0],
      duration_minutes: selectedClass.duration_minutes,
      hourly_rate: selectedClass.student_hourly_rate,
      is_paid: false,
      notes: "",
    }
  }

  if (todayClasses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Your scheduled classes for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No classes scheduled for today</p>
            <p className="text-sm">Enjoy your free day!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Your scheduled classes for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayClasses.map((todayClass) => (
            <div
              key={todayClass.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                todayClass.has_session
                  ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                  <div className="text-sm font-semibold">{formatTime(todayClass.start_time)}</div>
                  <div className="text-xs">{formatDuration(todayClass.duration_minutes)}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{todayClass.student_name}</span>
                    {todayClass.has_session && (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(todayClass.start_time)} -{" "}
                    {getEndTime(todayClass.start_time, todayClass.duration_minutes)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${todayClass.student_hourly_rate.toFixed(2)}/hr • $
                    {((todayClass.student_hourly_rate * todayClass.duration_minutes) / 60).toFixed(2)} total
                  </div>
                </div>
              </div>
              <div>
                {todayClass.has_session ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Session Logged
                  </Badge>
                ) : (
                  <Button onClick={() => handleLogSession(todayClass)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Session
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <SessionForm
        session={getInitialSessionData()}
        open={showSessionForm}
        onOpenChange={handleSessionFormClose}
        onSuccess={handleSessionSuccess}
      />
    </>
  )
}
