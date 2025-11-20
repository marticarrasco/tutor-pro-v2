"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { useDemoData, DemoScheduledClass } from "@/lib/demo-context"

interface DemoScheduleFormProps {
    scheduledClass?: DemoScheduledClass
    open: boolean
    onOpenChange: (open: boolean) => void
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

export function DemoScheduleForm({ scheduledClass, open, onOpenChange }: DemoScheduleFormProps) {
    const { students, addScheduledClass, updateScheduledClass } = useDemoData()

    const [formData, setFormData] = useState({
        student_id: scheduledClass?.student_id || "",
        day_of_week: scheduledClass?.day_of_week ?? 1,
        start_time: scheduledClass?.start_time || "14:00",
        duration_minutes: scheduledClass?.duration_minutes || 60,
        is_active: scheduledClass?.is_active ?? true,
    })
    const [isLoading, setIsLoading] = useState(false)

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
            const selectedStudent = students.find(s => s.id === formData.student_id)
            if (!selectedStudent) throw new Error("Student not found")

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            const classData = {
                student_id: formData.student_id,
                student_name: selectedStudent.name,
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                duration_minutes: formData.duration_minutes,
                is_active: formData.is_active,
            }

            if (scheduledClass?.id) {
                updateScheduledClass(scheduledClass.id, classData)
                toast({ title: "Scheduled class updated successfully" })
            } else {
                addScheduledClass(classData)
                toast({ title: "Scheduled class created successfully" })
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
        } catch (error) {
            console.error("Error saving scheduled class:", error)
            toast({
                title: "Error",
                description: "Failed to save scheduled class. Please try again.",
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
                    <DialogTitle>{scheduledClass?.id ? "Edit Scheduled Class" : "Add Scheduled Class"}</DialogTitle>
                    <DialogDescription>
                        {scheduledClass?.id
                            ? "Update the recurring class schedule."
                            : "Create a new recurring weekly class schedule."}
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
                            <Label htmlFor="day_of_week">Day of Week</Label>
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
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="duration_hours">Duration (hours)</Label>
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
                                placeholder="1.00"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Class Time</Label>
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
                            <Label htmlFor="is_active">Active Schedule</Label>
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
                                scheduledClass?.id ? "Update Class" : "Create Class"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
