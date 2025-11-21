"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
}

interface ScheduledClass {
  id?: string
  student_id: string
  day_of_week: number
  start_time: string
  duration_minutes: number
  is_active: boolean
  user_id?: string
  student_name?: string
  created_at?: string
  updated_at?: string
}

type ScheduleFormMode = "create" | "update"

interface ScheduleFormProps {
  scheduledClass?: ScheduledClass & { student_name?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (scheduledClass: ScheduledClass, mode: ScheduleFormMode) => void
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
]

export function ScheduleForm({ scheduledClass, open, onOpenChange, onSuccess }: ScheduleFormProps) {
  const t = useTranslations('ScheduleForm')
  const tSchedule = useTranslations('SchedulePage.weekdays')

  const DAYS_OF_WEEK = [
    { value: 1, label: tSchedule('monday') },
    { value: 2, label: tSchedule('tuesday') },
    { value: 3, label: tSchedule('wednesday') },
    { value: 4, label: tSchedule('thursday') },
    { value: 5, label: tSchedule('friday') },
    { value: 6, label: tSchedule('saturday') },
    { value: 0, label: tSchedule('sunday') },
  ]

  const [students, setStudents] = useState<Student[]>([])
  const [formData, setFormData] = useState<ScheduledClass>({
    student_id: scheduledClass?.student_id || "",
    day_of_week: scheduledClass?.day_of_week ?? 1,
    start_time: scheduledClass?.start_time || "14:00",
    duration_minutes: scheduledClass?.duration_minutes || 60,
    is_active: scheduledClass?.is_active ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const supabase = createClient()
        const user = await requireAuthUser(supabase)
        const { data, error } = await supabase
          .from("students")
          .select("id, name")
          .eq("is_active", true)
          .eq("user_id", user.id)
          .order("name")

        if (error) throw error
        setStudents(data || [])
      } catch (error) {
        console.error("Error fetching students for schedule form:", error)
        toast({
          title: t('error'),
          description: t('errorLoadingStudents'),
          variant: "destructive",
        })
      }
    }

    if (open) {
      fetchStudents()
    }
  }, [open, t, tSchedule])

  useEffect(() => {
    if (open) {
      setFormData({
        student_id: scheduledClass?.student_id || "",
        day_of_week: scheduledClass?.day_of_week ?? 1,
        start_time: scheduledClass?.start_time || "14:00",
        duration_minutes: scheduledClass?.duration_minutes || 60,
        is_active: scheduledClass?.is_active ?? true,
      })
    }
  }, [scheduledClass, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      let savedClass: any | null = null

      if (scheduledClass?.id) {
        // Update existing scheduled class
        const { data, error } = await supabase
          .from("scheduled_classes")
          .update({
            student_id: formData.student_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            duration_minutes: formData.duration_minutes,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduledClass.id)
          .eq("user_id", user.id)
          .select(
            `
            *,
            students!scheduled_classes_student_fk(name)
          `,
          )
          .single()

        if (error) throw error
        savedClass = data ?? null
        toast({ title: t('classUpdated') })
      } else {
        // Create new scheduled class
        const { data, error } = await supabase
          .from("scheduled_classes")
          .insert([
            {
              ...formData,
              user_id: user.id,
            },
          ])
          .select(
            `
            *,
            students!scheduled_classes_student_fk(name)
          `,
          )
          .single()

        if (error) throw error
        savedClass = data ?? null
        toast({ title: t('classCreated') })
      }

      if (savedClass) {
        const { students: studentRecord, ...classRecord } = savedClass
        const formattedClass: ScheduledClass = {
          ...classRecord,
          student_name: studentRecord?.name ?? scheduledClass?.student_name ?? "",
        }
        onSuccess(formattedClass, scheduledClass?.id ? "update" : "create")
      }
      onOpenChange(false)

      // Reset form if creating new scheduled class
      if (!scheduledClass?.id) {
        setFormData({
          student_id: "",
          day_of_week: 1,
          start_time: "14:00",
          duration_minutes: 60,
          is_active: true,
        })
      }
    } catch (error: any) {
      console.error("Error saving scheduled class:", error)
      toast({
        title: t('error'),
        description: t('errorSaving'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const endTime = () => {
    const [hours, minutes] = formData.start_time.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + formData.duration_minutes
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  const hoursValue = formData.duration_minutes / 60
  const durationHours = Number.isFinite(hoursValue) ? Number.parseFloat(hoursValue.toFixed(2)) : 0
  const formattedDuration = Number.isFinite(hoursValue)
    ? Number.isInteger(hoursValue)
      ? `${hoursValue}h`
      : `${Number.parseFloat(hoursValue.toFixed(2))}h`
    : "0h"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{scheduledClass?.id ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogDescription>
            {scheduledClass?.id
              ? t('editDescription')
              : t('createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student_id">{t('student')}</Label>
              <Select
                value={formData.student_id}
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStudent')} />
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

            <div className="grid gap-2">
              <Label htmlFor="day_of_week">{t('dayOfWeek')}</Label>
              <Select
                value={formData.day_of_week.toString()}
                onValueChange={(value) => setFormData({ ...formData, day_of_week: Number.parseInt(value) })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start_time">{t('startTime')}</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration_hours">{t('durationHours')}</Label>
              <Input
                id="duration_hours"
                type="number"
                min="0.25"
                step="0.25"
                value={durationHours}
                onChange={(e) => {
                  const hours = Number.parseFloat(e.target.value)
                  if (Number.isNaN(hours)) {
                    setFormData({ ...formData, duration_minutes: 0 })
                  } else {
                    const minutes = Math.max(Math.round(hours * 4) * 15, 0)
                    setFormData({ ...formData, duration_minutes: minutes })
                  }
                }}
                placeholder={t('durationPlaceholder')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">{t('classTime')}</Label>
              <div className="text-sm text-muted-foreground">
                {formatTime(formData.start_time)} - {formatTime(endTime())} ({formattedDuration})
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">{t('isActive')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading} className="relative">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                  {t('saving')}
                </>
              ) : (
                scheduledClass?.id ? t('updateButton') : t('createButton')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
