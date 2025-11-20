"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"
import { toast } from "@/hooks/use-toast"
import { useCurrency } from "@/components/currency-provider"

import { Student } from "@/types/data"

interface StudentsTableProps {
  students: Student[]
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
}

export function StudentsTable({ students, onEdit, onDelete }: StudentsTableProps) {
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { formatCurrency } = useCurrency()

  const handleDelete = async () => {
    if (!deleteStudent) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const user = await requireAuthUser(supabase)
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", deleteStudent.id)
        .eq("user_id", user.id)

      if (error) throw error

      toast({ title: "Student deleted successfully" })
      onDelete(deleteStudent.id)
      setDeleteStudent(null)
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No students found. Add your first student to get started.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id} className="border-border">
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{student.phone || "—"}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(student.hourly_rate)}/hr</TableCell>
                  <TableCell>
                    <Badge variant={student.is_active ? "default" : "secondary"}>
                      {student.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(student)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteStudent(student)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteStudent?.name} and all associated sessions and scheduled classes. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
