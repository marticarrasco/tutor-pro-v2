"use client"

import { useState } from "react"
import { Ban, CheckCircle, Clock, CreditCard, Plus, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SessionForm } from "@/components/sessions/session-form"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { CancelSessionDialog, type CancelSessionForm } from "@/components/today/cancel-session-dialog"

interface TodayClass {
  id: string
  student_id: string
  student_name: string
  student_hourly_rate: number
  start_time: string
  duration_minutes: number
  status: "pending" | "completed" | "cancelled"
  session_id?: string
  session_amount?: number
  session_is_paid?: boolean
  session_duration_minutes?: number
  cancelled_by?: "teacher" | "student" | null
}

interface TodayScheduleProps {
  todayClasses: TodayClass[]
  onRefresh: () => void | Promise<void>
}

export function TodaySchedule({ todayClasses, onRefresh }: TodayScheduleProps) {
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [selectedClass, setSelectedClass] = useState<TodayClass | null>(null)
  const [payingStudentId, setPayingStudentId] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [classToCancel, setClassToCancel] = useState<TodayClass | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDuration = (minutes: number) => {
    if (!minutes) return "0h"
    const hours = minutes / 60
    return Number.isInteger(hours) ? `${hours}h` : `${Number.parseFloat(hours.toFixed(2))}h`
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

  const handleOpenCancelDialog = (todayClass: TodayClass) => {
    setClassToCancel(todayClass)
    setCancelDialogOpen(true)
  }

  const handlePayAll = async (todayClass: TodayClass) => {
    try {
      setPayingStudentId(todayClass.student_id)
      const supabase = createClient()
      const { error, data } = await supabase
        .from("tutoring_sessions")
        .update({ is_paid: true, updated_at: new Date().toISOString() })
        .eq("student_id", todayClass.student_id)
        .eq("is_paid", false)
        .eq("is_cancelled", false)
        .select("id")

      if (error) throw error

      if (!data || data.length === 0) {
        toast({
          title: "No unpaid sessions",
          description: `There were no outstanding sessions for ${todayClass.student_name}.`,
        })
      } else {
        toast({
          title: "Payments updated",
          description: `All unpaid sessions for ${todayClass.student_name} are now marked as paid.`,
        })
      }
      await onRefresh()
    } catch (error) {
      console.error("Error marking sessions as paid", error)
      toast({
        title: "Unable to mark sessions paid",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setPayingStudentId(null)
    }
  }

  const handleCancelClass = async ({ cancelledBy, reason }: CancelSessionForm) => {
    if (!classToCancel) return
    setIsCancelling(true)

    try {
      const supabase = createClient()
      const todayString = new Date().toISOString().split("T")[0]

      if (classToCancel.session_id) {
        const { error } = await supabase
          .from("tutoring_sessions")
          .update({
            is_cancelled: true,
            cancelled_by: cancelledBy,
            cancellation_reason: reason || null,
            total_amount: 0,
            duration_minutes: 0,
            is_paid: false,
            notes: reason || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", classToCancel.session_id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("tutoring_sessions").insert([
          {
            student_id: classToCancel.student_id,
            date: todayString,
            duration_minutes: 0,
            hourly_rate: classToCancel.student_hourly_rate,
            is_paid: false,
            is_cancelled: true,
            cancelled_by: cancelledBy,
            cancellation_reason: reason || null,
            notes: reason ? reason : `Class cancelled by ${cancelledBy}`,
          },
        ])

        if (error) throw error
      }

      toast({
        title: "Class cancelled",
        description: `${classToCancel.student_name}'s class has been marked as cancelled.`,
      })
      setCancelDialogOpen(false)
      setClassToCancel(null)
      await onRefresh()
    } catch (error) {
      console.error("Error cancelling class", error)
      toast({
        title: "Unable to cancel class",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
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
         </CardHeader>
        <CardContent className="space-y-2">
          {(todayClasses.slice(0, 3)).map((todayClass) => {
            const containerClasses =
              todayClass.status === "completed"
                ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                : todayClass.status === "cancelled"
                ? "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700"
                : "bg-card border-border"

            return (
              <div key={todayClass.id} className={`flex items-center justify-between px-2 py-1 rounded-lg border ${containerClasses} min-h-[40px]`}> 
                <div className="flex items-center gap-2">
                   
                  <div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm">{todayClass.student_name}</span>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(todayClass.start_time)} - {getEndTime(todayClass.start_time, todayClass.duration_minutes)}
                      </div>
                    </div>
                     
                  {todayClass.status === "completed" && todayClass.session_amount !== undefined && (
                    <div className="text-xs">
                      Logged: <span className="font-semibold">${todayClass.session_amount.toFixed(2)}</span>{" "}
                       
                    </div>
                  )}
                   
                    {todayClass.status === "cancelled" && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-300">
                        Cancelled by {todayClass.cancelled_by === "teacher" ? "teacher" : "student"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleLogSession(todayClass)}
                    size="sm"
                    variant="default"
                    className={todayClass.status === "completed" ? "bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-xs" : "px-9 py-1 text-xs"}
                    disabled={todayClass.status === "cancelled"}
                  >
                     {todayClass.status === "completed" ? "Logged" : "Log"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenCancelDialog(todayClass)}
                    disabled={todayClass.status === "cancelled"}
                    className="px-2 py-1 text-xs"
                  >
                    <Ban className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <SessionForm
        open={showSessionForm}
        onOpenChange={handleSessionFormClose}
        onSuccess={handleSessionSuccess}
        prefilledStudentId={selectedClass?.student_id}
        prefilledHourlyRate={selectedClass?.student_hourly_rate}
        prefilledDuration={selectedClass?.duration_minutes}
      />

      <CancelSessionDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open)
          if (!open) {
            setClassToCancel(null)
          }
        }}
        onConfirm={handleCancelClass}
        isSubmitting={isCancelling}
        studentName={classToCancel?.student_name}
        sessionTime={classToCancel ? formatTime(classToCancel.start_time) : undefined}
      />
    </>
  )
}
