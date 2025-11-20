"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Clock, Users, ToggleLeft } from "lucide-react"
import { useDocumentTitle, useDocumentMeta } from "@/hooks/use-document-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { ScheduleTable } from "@/components/schedule/schedule-table"
import { ScheduleForm } from "@/components/schedule/schedule-form"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from 'next-intl'

interface ScheduledClass {
  id: string
  student_id: string
  student_name: string
  day_of_week: number
  start_time: string
  duration_minutes: number
  is_active: boolean
  created_at: string
  user_id: string
}

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function SchedulePage() {
  const t = useTranslations('SchedulePage')
  const tWeekdays = useTranslations('SchedulePage.weekdays')
  useDocumentTitle(t('documentTitle'))
  useDocumentMeta(t('documentDescription'))

  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ScheduledClass | undefined>()
  const [classToDelete, setClassToDelete] = useState<ScheduledClass | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchScheduledClasses = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("scheduled_classes")
        .select(`
          *,
          students!scheduled_classes_student_fk(name)
        `)
        .eq("user_id", user.id)
        .order("day_of_week")
        .order("start_time")

      if (error) throw error

      const formattedClasses = (data || []).map((cls: any) => ({
        ...cls,
        student_name: cls.students.name,
      }))

      setScheduledClasses(formattedClasses)
    } catch (error) {
      console.error("Error fetching scheduled classes:", error)
      toast({
        title: t('errorLoading'),
        description: t('errorLoadingDescription'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledClasses()
  }, [])

  const handleEdit = (scheduledClass: ScheduledClass) => {
    setEditingClass(scheduledClass)
    setShowForm(true)
  }

  const handleDelete = (scheduledClass: ScheduledClass) => {
    setClassToDelete(scheduledClass)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingClass(undefined)
  }

  const sortClasses = (classList: ScheduledClass[]) =>
    [...classList].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
      return a.start_time.localeCompare(b.start_time)
    })

  const handleClassSaved = (scheduledClass: ScheduledClass, mode: "create" | "update") => {
    setScheduledClasses((prev) => {
      const updated =
        mode === "create"
          ? [...prev, scheduledClass]
          : prev.map((existing) => (existing.id === scheduledClass.id ? { ...existing, ...scheduledClass } : existing))
      return sortClasses(updated)
    })
  }

  const handleClassDeleted = (scheduledClassId: string) => {
    setScheduledClasses((prev) => prev.filter((cls) => cls.id !== scheduledClassId))
  }

  const handleClassStatusChange = (scheduledClassId: string, isActive: boolean) => {
    setScheduledClasses((prev) =>
      prev.map((cls) => (cls.id === scheduledClassId ? { ...cls, is_active: isActive } : cls)),
    )
  }

  const handleConfirmDelete = async () => {
    if (!classToDelete) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { error } = await supabase
        .from("scheduled_classes")
        .delete()
        .eq("id", classToDelete.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({ title: t('deleteSuccess') })
      handleClassDeleted(classToDelete.id)
      setClassToDelete(null)
    } catch (error) {
      console.error("Error deleting scheduled class:", error)
      toast({
        title: t('errorLoading'),
        description: t('deleteError'),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate statistics
  const totalClasses = scheduledClasses.length
  const activeClasses = scheduledClasses.filter((cls) => cls.is_active).length
  const totalWeeklyHours =
    scheduledClasses.filter((cls) => cls.is_active).reduce((sum, cls) => sum + cls.duration_minutes, 0) / 60

  // Get unique students with active classes
  const activeStudents = new Set(scheduledClasses.filter((cls) => cls.is_active).map((cls) => cls.student_id)).size

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<Calendar className="h-6 w-6" />}
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addClass')}
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalClasses')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClasses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activeClasses')}</CardTitle>
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeClasses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('weeklyHours')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWeeklyHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activeStudents')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStudents}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">{t('calendarView')}</TabsTrigger>
              <TabsTrigger value="list">{t('listView')}</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('weeklySchedule')}</CardTitle>
                  <CardDescription>{t('weeklyScheduleDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">{t('loadingSchedule')}</div>
                  ) : (
                    <WeeklyCalendar scheduledClasses={scheduledClasses} onEdit={handleEdit} onDelete={handleDelete} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('allScheduledClasses')}</CardTitle>
                  <CardDescription>{t('allScheduledClassesDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">{t('loadingSchedule')}</div>
                  ) : (
                    <ScheduleTable
                      scheduledClasses={scheduledClasses}
                      onEdit={handleEdit}
                      onDelete={handleClassDeleted}
                      onStatusChange={handleClassStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <ScheduleForm
          scheduledClass={editingClass}
          open={showForm}
          onOpenChange={handleFormClose}
          onSuccess={handleClassSaved}
        />

        <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>
                {classToDelete ? t('deleteDescription').replace('{studentName}', classToDelete.student_name).replace('{dayOfWeek}', WEEKDAY_LABELS[classToDelete.day_of_week]).replace('{time}', classToDelete.start_time) : ''}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t('cancel') || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? t('deleting') || 'Deleting...' : t('delete') || 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
