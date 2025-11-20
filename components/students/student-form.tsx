"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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

<<<<<<< HEAD
import { Student } from "@/types/data"
=======
interface Student {
  id?: string
  name: string
  email: string
  phone: string
  hourly_rate: number
  is_active: boolean
  user_id?: string
  created_at?: string
  updated_at?: string
}
>>>>>>> 21b6a61f49907f780de2f9aa423f7e28858c10b8

type StudentFormMode = "create" | "update"

interface StudentFormProps {
  student?: Student
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (student: Student, mode: StudentFormMode) => void
}

export function StudentForm({ student, open, onOpenChange, onSuccess }: StudentFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    hourly_rate: student?.hourly_rate || 0,
    is_active: student?.is_active ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData({
        name: student?.name || "",
        email: student?.email || "",
        phone: student?.phone || "",
        hourly_rate: student?.hourly_rate || 0,
        is_active: student?.is_active ?? true,
      })
    }
  }, [student, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const user = await requireAuthUser(supabase)

      let savedStudent: Student | null = null

      if (student?.id) {
        // Update existing student
        const { data, error } = await supabase
          .from("students")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            hourly_rate: formData.hourly_rate,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", student.id)
          .eq("user_id", user.id)
          .select("*")
          .single()

        if (error) throw error
        savedStudent = data ?? null
        toast({ title: "Student updated successfully" })
      } else {
        // Create new student
        const { data, error } = await supabase
          .from("students")
          .insert([
            {
              ...formData,
              user_id: user.id,
            },
          ])
          .select("*")
          .single()

        if (error) throw error
        savedStudent = data ?? null
        toast({ title: "Student created successfully" })
      }

      if (savedStudent) {
        onSuccess(savedStudent, student?.id ? "update" : "create")
      }
      onOpenChange(false)

      // Reset form if creating new student
      if (!student?.id) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          hourly_rate: 0,
          is_active: true,
        })
      }
    } catch (error) {
      console.error("Error saving student:", error)
      toast({
        title: "Error",
        description: "Failed to save student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student?.id ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {student?.id ? "Update the student's information below." : "Enter the details for the new student."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Student's full name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0123"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
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
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active Student</Label>
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
                student?.id ? "Update Student" : "Create Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
