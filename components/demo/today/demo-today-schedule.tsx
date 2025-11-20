"use client"

import { useState } from "react"
import { Ban, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DemoSessionForm } from "@/components/demo/sessions/demo-session-form"
import { useDemoSignUp } from "@/lib/demo-signup-context"

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

interface DemoTodayScheduleProps {
    todayClasses: TodayClass[]
    onRefresh: () => void | Promise<void>
}

export function DemoTodaySchedule({ todayClasses, onRefresh }: DemoTodayScheduleProps) {
    const [showSessionForm, setShowSessionForm] = useState(false)
    const [selectedClass, setSelectedClass] = useState<TodayClass | null>(null)
    const { showSignUpDialog } = useDemoSignUp()

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
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

    const handleCancel = () => {
        // In demo mode, show sign-up dialog instead of actually cancelling
        showSignUpDialog()
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
                                        onClick={handleCancel}
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

            <DemoSessionForm
                open={showSessionForm}
                onOpenChange={handleSessionFormClose}
                prefilledStudentId={selectedClass?.student_id}
                prefilledHourlyRate={selectedClass?.student_hourly_rate}
                prefilledDuration={selectedClass?.duration_minutes}
            />
        </>
    )
}
