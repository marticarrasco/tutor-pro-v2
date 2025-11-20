"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users } from "lucide-react"
import { useDocumentTitle, useDocumentMeta } from "@/hooks/use-document-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { StudentsTable } from "@/components/students/students-table"
import { StudentForm } from "@/components/students/student-form"
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"

import { Student } from "@/types/data"

export default function StudentsPage() {
  useDocumentTitle("Student Management")
  useDocumentMeta("Manage your students with detailed records, contact information, and hourly rates. Keep track of all your tutoring relationships.")

  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | undefined>()

  const fetchStudents = async () => {
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

      if (error) throw error
      setStudents(data || [])
      setFilteredStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (!searchQuery) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.phone?.includes(searchQuery),
      )
      setFilteredStudents(filtered)
    }
  }, [searchQuery, students])

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingStudent(undefined)
  }

  const activeStudents = students.filter((s) => s.is_active).length
  const totalStudents = students.length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PageHeader
            icon={<Users className="h-6 w-6" />}
            eyebrow="People"
            title="Student Directory"
            description="Organize student details, track contact information, and keep billing preferences up to date."
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add student
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents - activeStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {activeStudents > 0
                    ? (
                      students.filter((s) => s.is_active).reduce((sum, s) => sum + s.hourly_rate, 0) / activeStudents
                    ).toFixed(0)
                    : "0"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Students</CardTitle>
                  <CardDescription>A list of all your students and their details</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="h-12 w-12 rounded-full bg-muted animate-skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-[200px] rounded bg-muted animate-skeleton" />
                        <div className="h-3 w-[150px] rounded bg-muted/70 animate-skeleton" style={{ animationDelay: '0.05s' }} />
                      </div>
                      <div className="h-9 w-20 rounded bg-muted animate-skeleton" />
                    </div>
                  ))}
                </div>
              ) : (
                <StudentsTable students={filteredStudents} onEdit={handleEdit} onRefresh={fetchStudents} />
              )}
            </CardContent>
          </Card>
        </div>

        <StudentForm
          student={editingStudent}
          open={showForm}
          onOpenChange={handleFormClose}
          onSuccess={fetchStudents}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
