"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
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
import { useCurrency } from "@/components/currency-provider"

import { Student } from "@/types/data"

type StudentFormMode = "create" | "update"


interface StudentFormProps {
  student?: Student
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (student: Student, mode: StudentFormMode) => void
}

export function StudentForm({ student, open, onOpenChange, onSuccess }: StudentFormProps) {
  const t = useTranslations('HomePage.StudentForm')
  const [formData, setFormData] = useState<Partial<Student>>({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    hourly_rate: student?.hourly_rate || 0,
    is_active: student?.is_active ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { currency } = useCurrency()

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
        toast({ title: t('studentUpdated') })
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
        toast({ title: t('studentCreated') })
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
        title: t('error'),
        description: t('errorSaving'),
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
          <DialogTitle>{student?.id ? t('editTitle') : t('createTitle')}</DialogTitle>
          <DialogDescription>
            {student?.id ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
              />
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
                student?.id ? t('updateButton') : t('createButton')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
