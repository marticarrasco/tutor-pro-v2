"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/components/currency-provider"

interface Student {
  id: string
  name: string
  hourly_rate: number
}

interface Session {
  id?: string
  student_id: string
  date: string
  duration_minutes: number
  hourly_rate: number
  is_paid: boolean
  notes: string
  user_id?: string
  total_amount?: number
  is_cancelled?: boolean
  cancelled_by?: "teacher" | "student" | null
  student_name?: string
}

type SessionFormMode = "create" | "update"

interface SessionFormProps {
  session?: Session & { student_name?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (session: Session, mode: SessionFormMode) => void
  prefilledStudentId?: string
  prefilledHourlyRate?: number
  prefilledDuration?: number
}

export function SessionForm({
  session,
  open,
  onOpenChange,
  onSuccess,
  prefilledStudentId,
  prefilledHourlyRate,
  prefilledDuration,
}: SessionFormProps) {
  const t = useTranslations('HomePage.SessionForm')
  const [students, setStudents] = useState<Student[]>([])
  const [formData, setFormData] = useState<Session>({
    student_id: session?.student_id || prefilledStudentId || "",
    date: session?.date || format(new Date(), "yyyy-MM-dd"),
    duration_minutes: session?.duration_minutes || prefilledDuration || 60,
    hourly_rate: session?.hourly_rate || prefilledHourlyRate || 0,
    is_paid: session?.is_paid || false,
    notes: session?.notes || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    session?.date ? parse(session.date, "yyyy-MM-dd", new Date()) : new Date(),
  )
  const { currency, formatCurrency } = useCurrency()

  // Fetch students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const supabase = createClient()
        const user = await requireAuthUser(supabase)
        const { data, error } = await supabase
          .from("students")
          .select("id, name, hourly_rate")
          .eq("is_active", true)
          .eq("user_id", user.id)
          .order("name")

        if (error) throw error
        setStudents(data || [])
      } catch (error) {
        console.error("Error fetching students for session form:", error)
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
  }, [open, t])

  useEffect(() => {
    if (open) {
      setFormData({
        student_id: session?.student_id || prefilledStudentId || "",
        date: session?.date || format(new Date(), "yyyy-MM-dd"),
        duration_minutes: session?.duration_minutes || prefilledDuration || 60,
        hourly_rate: session?.hourly_rate || prefilledHourlyRate || 0,
        is_paid: session?.is_paid || false,
        notes: session?.notes || "",
      })
      setCalendarDate(
        session?.date ? parse(session.date, "yyyy-MM-dd", new Date()) : new Date(),
      )
    }
  }, [session, prefilledStudentId, prefilledHourlyRate, prefilledDuration, open])

  // Update hourly rate when student changes
  useEffect(() => {
    if (formData.student_id && !session?.id) {
      const selectedStudent = students.find((s) => s.id === formData.student_id)
      if (selectedStudent && !prefilledHourlyRate) {
        setFormData((prev) => ({ ...prev, hourly_rate: selectedStudent.hourly_rate }))
      }
    }
  }, [formData.student_id, students, session?.id, prefilledHourlyRate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)

      let savedSession: any | null = null

      if (session?.id) {
        // Update existing session
        const { data, error } = await supabase
          .from("tutoring_sessions")
          .update({
            student_id: formData.student_id,
            date: formData.date,
            duration_minutes: formData.duration_minutes,
            hourly_rate: formData.hourly_rate,
            is_paid: formData.is_paid,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.id)
          .eq("user_id", user.id)
          .select(
            `
            *,
            students!tutoring_sessions_student_fk(name)
          `,
          )
          .single()

        if (error) throw error
        savedSession = data ?? null
        toast({ title: t('sessionUpdated') })
      } else {
        // Create new session
        const { data, error } = await supabase
          .from("tutoring_sessions")
          .insert([
            {
              ...formData,
              user_id: user.id,
            },
          ])
          .select(
            `
            *,
            students!tutoring_sessions_student_fk(name)
          `,
          )
          .single()

        if (error) throw error
        savedSession = data ?? null
        toast({ title: t('sessionCreated') })
      }

      if (savedSession) {
        const { students: studentRecord, ...sessionRecord } = savedSession
        const formattedSession: Session = {
          ...sessionRecord,
          student_name: studentRecord?.name ?? session?.student_name ?? "",
        }
        onSuccess(formattedSession, session?.id ? "update" : "create")
      }
      onOpenChange(false)

      // Reset form if creating new session
      if (!session?.id) {
        setFormData({
          student_id: "",
          date: format(new Date(), "yyyy-MM-dd"),
          duration_minutes: 60,
          hourly_rate: 0,
          is_paid: false,
          notes: "",
        })
        setCalendarDate(new Date())
      }
    } catch (error: any) {
      console.error("Error saving session:", error)

      // Handle unique constraint violation (one session per student per day)
      if (error.code === "23505") {
        toast({
          title: t('sessionExists'),
          description: t('sessionExistsDescription'),
          variant: "destructive",
        })
      } else {
        toast({
          title: t('error'),
          description: t('errorSaving'),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarDate(date)
      setFormData({ ...formData, date: format(date, "yyyy-MM-dd") })
    }
  }

  const totalAmount = ((formData.hourly_rate * formData.duration_minutes) / 60).toFixed(2)
  const durationHours = (formData.duration_minutes / 60).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{session?.id ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogDescription>
            {session?.id ? t('editDescription') : t('createDescription')}
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
              <Label>{t('date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !calendarDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {calendarDate ? format(calendarDate, "PPP") : <span>{t('pickDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    weekStartsOn={1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration_hours">{t('durationHours')}</Label>
              <Input
                id="duration_hours"
                type="number"
                step="0.25"
                min="0.25"
                value={durationHours}
                onChange={(e) => {
                  const hours = Number.parseFloat(e.target.value) || 0
                  setFormData({ ...formData, duration_minutes: Math.round(hours * 60) })
                }}
                placeholder={t('durationPlaceholder')}
                required
              />
              <div className="text-xs text-muted-foreground">{formData.duration_minutes} {t('minutes')}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hourly_rate">{t('hourlyRate')} ({currency === "USD" ? "$" : "€"})</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number.parseFloat(e.target.value) || 0 })}
                placeholder={t('hourlyRatePlaceholder')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">{t('totalAmount')}</Label>
              <div className="text-2xl font-bold text-primary">{formatCurrency(Number(totalAmount))}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_paid"
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
              />
              <Label htmlFor="is_paid">{t('paymentReceived')}</Label>
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
                session?.id ? t('updateButton') : t('createButton')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
