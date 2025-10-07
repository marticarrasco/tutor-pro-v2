"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface ScheduledClass {
  id: string
  student_id: string
  student_name: string
  day_of_week: number
  start_time: string
  duration_minutes: number
  is_active: boolean
}

interface WeeklyCalendarProps {
  scheduledClasses: ScheduledClass[]
  onEdit: (scheduledClass: ScheduledClass) => void
  onDelete: (scheduledClass: ScheduledClass) => void
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function WeeklyCalendar({ scheduledClasses, onEdit, onDelete }: WeeklyCalendarProps) {
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

  const getClassesForDay = (dayOfWeek: number) => {
    return scheduledClasses
      .filter((cls) => cls.day_of_week === dayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
      {DAYS_OF_WEEK.map((day, index) => {
        const dayClasses = getClassesForDay(index)
        return (
          <Card key={day} className="min-h-[200px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-center">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayClasses.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">No classes scheduled</div>
              ) : (
                dayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-2 rounded-md border ${
                      cls.is_active
                        ? "bg-primary/10 border-primary/20"
                        : "bg-muted/50 border-muted-foreground/20 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{cls.student_name}</div>
                        <div className="text-xs text-muted-foreground">{formatTime(cls.start_time)}</div>
                        <div className="text-xs text-muted-foreground">{formatDuration(cls.duration_minutes)}</div>
                        {!cls.is_active && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(cls)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDelete(cls)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
