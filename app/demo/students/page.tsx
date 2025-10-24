"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { PageHeader } from "@/components/page-header"
import { useDemoData } from "@/lib/demo-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { DemoStudent } from "@/lib/demo-context"

export default function DemoStudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useDemoData()
  const [filteredStudents, setFilteredStudents] = useState(students)
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<DemoStudent | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    subject: "",
    hourly_rate: "",
    notes: "",
  })

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

  const handleOpenForm = (student?: DemoStudent) => {
    if (student) {
      setEditingStudent(student)
      setFormData({
        name: student.name,
        email: student.email,
        phone: student.phone,
        grade: student.grade,
        subject: student.subject,
        hourly_rate: student.hourly_rate.toString(),
        notes: student.notes || "",
      })
    } else {
      setEditingStudent(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        grade: "",
        subject: "",
        hourly_rate: "",
        notes: "",
      })
    }
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.hourly_rate) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and hourly rate",
        variant: "destructive",
      })
      return
    }

    const studentData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      grade: formData.grade,
      subject: formData.subject,
      hourly_rate: parseFloat(formData.hourly_rate),
      notes: formData.notes,
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, studentData)
      toast({ title: "Student updated successfully" })
    } else {
      addStudent(studentData)
      toast({ title: "Student added successfully" })
    }

    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    deleteStudent(id)
    toast({ title: "Student deleted successfully" })
  }

  const activeStudents = students.length
  const avgRate = students.length > 0
    ? students.reduce((sum, s) => sum + s.hourly_rate, 0) / students.length
    : 0

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
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Add student
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
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
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${avgRate.toFixed(0)}</div>
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
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className="border-border">
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-muted-foreground">{student.email || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{student.phone || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{student.subject}</TableCell>
                          <TableCell className="font-medium">${student.hourly_rate}/hr</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenForm(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>
                {editingStudent ? "Update student information" : "Add a new student to your roster"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="10th Grade"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mathematics"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hourly_rate">Hourly Rate *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingStudent ? "Update" : "Add"} Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

