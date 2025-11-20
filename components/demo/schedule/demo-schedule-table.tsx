"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
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
import { toast } from "@/hooks/use-toast"
import { useDemoData, DemoScheduledClass } from "@/lib/demo-context"

interface DemoScheduleTableProps {
    scheduledClasses: DemoScheduledClass[]
    onEdit: (scheduledClass: DemoScheduledClass) => void
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function DemoScheduleTable({ scheduledClasses, onEdit }: DemoScheduleTableProps) {
    const { deleteScheduledClass, updateScheduledClass } = useDemoData()
    const [deleteClass, setDeleteClass] = useState<DemoScheduledClass | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteClass) return

        setIsDeleting(true)
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            deleteScheduledClass(deleteClass.id)
            toast({ title: "Scheduled class deleted successfully" })
            setDeleteClass(null)
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

    const toggleActive = async (scheduledClass: DemoScheduledClass) => {
        try {
            updateScheduledClass(scheduledClass.id, { is_active: !scheduledClass.is_active })

            toast({
                title: scheduledClass.is_active ? "Class deactivated" : "Class activated",
                description: `${scheduledClass.student_name}'s class updated.`,
            })
        } catch (error) {
            console.error("Error updating class status:", error)
            toast({
                title: "Error",
                description: "Failed to update class status. Please try again.",
                variant: "destructive",
            })
        }
    }

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    const formatDuration = (minutes: number) => {
        if (!minutes) return "0h"
        const hours = minutes / 60
        return Number.isInteger(hours) ? `${hours}h` : `${Number.parseFloat(hours.toFixed(2))}h`
    }

    return (
        <>
            <div className="rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border">
                            <TableHead>Student</TableHead>
                            <TableHead>Day</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scheduledClasses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No scheduled classes found. Add your first recurring class to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            scheduledClasses.map((scheduledClass) => (
                                <TableRow key={scheduledClass.id} className="border-border">
                                    <TableCell className="font-medium">{scheduledClass.student_name}</TableCell>
                                    <TableCell>{DAYS_OF_WEEK[scheduledClass.day_of_week]}</TableCell>
                                    <TableCell className="font-mono">{formatTime(scheduledClass.start_time)}</TableCell>
                                    <TableCell className="font-mono">{formatDuration(scheduledClass.duration_minutes)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={scheduledClass.is_active ? "default" : "secondary"}
                                            className="cursor-pointer"
                                            onClick={() => toggleActive(scheduledClass)}
                                        >
                                            {scheduledClass.is_active ? "Active" : "Inactive"}
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
                                                <DropdownMenuItem onClick={() => toggleActive(scheduledClass)}>
                                                    {scheduledClass.is_active ? (
                                                        <>
                                                            <ToggleLeft className="mr-2 h-4 w-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleRight className="mr-2 h-4 w-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(scheduledClass)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setDeleteClass(scheduledClass)} className="text-destructive">
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

            <AlertDialog open={!!deleteClass} onOpenChange={() => setDeleteClass(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the scheduled class for {deleteClass?.student_name} on{" "}
                            {deleteClass && DAYS_OF_WEEK[deleteClass.day_of_week]}s. This action cannot be undone.
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
