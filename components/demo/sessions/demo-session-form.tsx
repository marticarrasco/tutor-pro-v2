"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { useDemoData, DemoSession } from "@/lib/demo-context"
import { useDemoSignUp } from "@/lib/demo-signup-context"
import { useCurrency } from "@/components/currency-provider"

interface DemoSessionFormProps {
    session?: DemoSession
    open: boolean
    onOpenChange: (open: boolean) => void
    prefilledStudentId?: string
    prefilledHourlyRate?: number
    prefilledDuration?: number
}

export function DemoSessionForm({
    session,
    open,
    onOpenChange,
    prefilledStudentId,
    prefilledHourlyRate,
    prefilledDuration,
}: DemoSessionFormProps) {
    const { students, addSession, updateSession } = useDemoData()
    const { showSignUpDialog } = useDemoSignUp()
    const { currency, formatCurrency } = useCurrency()

    const [formData, setFormData] = useState({
        student_id: session?.student_id || prefilledStudentId || "",
        date: session?.date || format(new Date(), "yyyy-MM-dd"),
        duration_minutes: session ? session.duration * 60 : prefilledDuration || 60,
        hourly_rate: session?.hourly_rate || prefilledHourlyRate || 0,
        is_paid: session?.payment_status === 'paid' || false,
        notes: session?.notes || "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [calendarDate, setCalendarDate] = useState<Date | undefined>(
        session?.date ? parse(session.date, "yyyy-MM-dd", new Date()) : new Date(),
    )

    useEffect(() => {
        if (open) {
            setFormData({
                student_id: session?.student_id || prefilledStudentId || "",
                date: session?.date || format(new Date(), "yyyy-MM-dd"),
                duration_minutes: session ? session.duration * 60 : prefilledDuration || 60,
                hourly_rate: session?.hourly_rate || prefilledHourlyRate || 0,
                is_paid: session?.payment_status === 'paid' || false,
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
            const selectedStudent = students.find(s => s.id === formData.student_id)
            if (!selectedStudent) throw new Error("Student not found")

            const durationHours = formData.duration_minutes / 60
            const totalAmount = durationHours * formData.hourly_rate
            const paymentStatus: 'paid' | 'pending' = formData.is_paid ? 'paid' : 'pending'

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            const sessionData = {
                student_id: formData.student_id,
                student_name: selectedStudent.name,
                subject: selectedStudent.subject,
                date: formData.date,
                start_time: "14:00", // Default
                end_time: format(new Date(new Date().setHours(14 + Math.floor(durationHours), (durationHours % 1) * 60)), "HH:mm"),
                duration: durationHours,
                hourly_rate: formData.hourly_rate,
                total_amount: totalAmount,
                payment_status: paymentStatus,
                notes: formData.notes,
            }

            if (session?.id) {
                updateSession(session.id, sessionData)
                toast({ title: "Session updated successfully" })
            } else {
                addSession(sessionData)
                toast({ title: "Session created successfully" })
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
            showSignUpDialog()
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
                    <DialogTitle>{session?.id ? "Edit Session" : "Log New Session"}</DialogTitle>
                    <DialogDescription>
                        {session?.id ? "Update the session details below." : "Record a completed tutoring session."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="student_id">Student</Label>
                            <Select
                                value={formData.student_id}
                                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                                required
                            >
                                <SelectTrigger>
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

                        <div className="grid gap-2">
                            <Label>Date</Label>
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
                                        {calendarDate ? format(calendarDate, "PPP") : <span>Pick a date</span>}
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
                            <Label htmlFor="duration_hours">Duration (hours)</Label>
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
                                placeholder="1.0"
                                required
                            />
                            <div className="text-xs text-muted-foreground">{formData.duration_minutes} minutes</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hourly_rate">Hourly Rate ({currency === "USD" ? "$" : "€"})</Label>
                            <Input
                                id="hourly_rate"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData({ ...formData, hourly_rate: Number.parseFloat(e.target.value) || 0 })}
                                placeholder="45.00"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Total Amount</Label>
                            <div className="text-2xl font-bold text-primary">{formatCurrency(Number(totalAmount))}</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Session notes, topics covered, homework assigned..."
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_paid"
                                checked={formData.is_paid}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                            />
                            <Label htmlFor="is_paid">Payment Received</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="relative">
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-primary-foreground/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
                                    Saving...
                                </>
                            ) : (
                                session?.id ? "Update Session" : "Log Session"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
