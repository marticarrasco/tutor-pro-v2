"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoStudentsTable } from "@/components/demo/students/demo-students-table"
import { DemoStudentForm } from "@/components/demo/students/demo-student-form"
import { PageHeader } from "@/components/page-header"
import { useDemoData, DemoStudent } from "@/lib/demo-context"
import { Toaster } from "@/components/ui/toaster"

export default function DemoStudentsPage() {
  const { students } = useDemoData()
  const [filteredStudents, setFilteredStudents] = useState<DemoStudent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<DemoStudent | undefined>()

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

  const handleEdit = (student: DemoStudent) => {
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
      <DemoSidebar />
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
              <DemoStudentsTable students={filteredStudents} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </div>

        <DemoStudentForm
          student={editingStudent}
          open={showForm}
          onOpenChange={handleFormClose}
        />
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
