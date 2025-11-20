"use client"

import { useState } from "react"
import { Plus, Calendar, Clock, Users, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoWeeklyCalendar } from "@/components/demo/schedule/demo-weekly-calendar"
import { DemoScheduleTable } from "@/components/demo/schedule/demo-schedule-table"
import { DemoScheduleForm } from "@/components/demo/schedule/demo-schedule-form"
import { PageHeader } from "@/components/page-header"
import { useDemoData, DemoScheduledClass } from "@/lib/demo-context"
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
import { toast } from "@/hooks/use-toast"

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function DemoSchedulePage() {
  const { scheduledClasses, deleteScheduledClass } = useDemoData()
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<DemoScheduledClass | undefined>()
  const [classToDelete, setClassToDelete] = useState<DemoScheduledClass | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleEdit = (scheduledClass: DemoScheduledClass) => {
    setEditingClass(scheduledClass)
    setShowForm(true)
  }

  const handleDelete = (scheduledClass: DemoScheduledClass) => {
    setClassToDelete(scheduledClass)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingClass(undefined)
  }

  const handleConfirmDelete = async () => {
    if (!classToDelete) return
    setIsDeleting(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      deleteScheduledClass(classToDelete.id)
      toast({ title: "Scheduled class deleted successfully" })
      setClassToDelete(null)
    } catch (error) {
      console.error("Error deleting scheduled class:", error)
      toast({
        title: "Error",
        description: "Failed to delete scheduled class. Please try again.",
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
      <DemoSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<Calendar className="h-6 w-6" />}
            eyebrow="Planning"
            title="Weekly Teaching Schedule"
            description="Plan recurring lessons, adjust availability, and keep your tutoring week organised."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClasses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeClasses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWeeklyHours.toFixed(1)}h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStudents}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Your recurring classes organized by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoWeeklyCalendar scheduledClasses={scheduledClasses} onEdit={handleEdit} onDelete={handleDelete} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Scheduled Classes</CardTitle>
                  <CardDescription>A complete list of your recurring classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoScheduleTable
                    scheduledClasses={scheduledClasses}
                    onEdit={handleEdit}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DemoScheduleForm
          scheduledClass={editingClass}
          open={showForm}
          onOpenChange={handleFormClose}
        />

        <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete scheduled class?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the recurring class for {classToDelete?.student_name} on{" "}
                {classToDelete !== null ? WEEKDAY_LABELS[classToDelete.day_of_week] : ""} at {classToDelete?.start_time}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
