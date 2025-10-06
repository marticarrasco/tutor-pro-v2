"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Clock, Users, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { ScheduleTable } from "@/components/schedule/schedule-table"
import { ScheduleForm } from "@/components/schedule/schedule-form"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface ScheduledClass {
  id: string
  student_id: string
  student_name: string
  day_of_week: number
  start_time: string
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export default function SchedulePage() {
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ScheduledClass | undefined>()

  const fetchScheduledClasses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("scheduled_classes")
        .select(`
          *,
          students!inner(name)
        `)
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
        title: "Error",
        description: "Failed to load scheduled classes. Please try again.",
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
    // This will be handled by the individual components
    console.log("Delete scheduled class:", scheduledClass.id)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingClass(undefined)
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
          <div className="flex items-center justify-between pt-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
              <p className="text-muted-foreground">Manage your weekly recurring classes</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </div>

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
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                  ) : (
                    <WeeklyCalendar scheduledClasses={scheduledClasses} onEdit={handleEdit} onDelete={handleDelete} />
                  )}
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
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                  ) : (
                    <ScheduleTable
                      scheduledClasses={scheduledClasses}
                      onEdit={handleEdit}
                      onRefresh={fetchScheduledClasses}
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
          onSuccess={fetchScheduledClasses}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
