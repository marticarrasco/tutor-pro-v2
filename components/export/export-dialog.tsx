"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Receipt } from "lucide-react"
import {
  generateSessionsCSV,
  downloadCSV,
  fetchSessionsForExport,
  printInvoice,
  type InvoiceData,
} from "@/lib/export-utils"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
  email: string
}

interface ExportDialogProps {
  students: Student[]
  trigger?: React.ReactNode
}

export function ExportDialog({ students, trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [exportType, setExportType] = useState<"csv" | "invoice">("csv")
  const [studentId, setStudentId] = useState<string>("all") // Changed default from empty string to "all"
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [paidOnly, setPaidOnly] = useState(false)
  const [unpaidOnly, setUnpaidOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const filters = {
        studentId: studentId === "all" ? undefined : studentId, // Updated to handle "all" value
        startDate,
        endDate,
        isPaid: paidOnly ? true : unpaidOnly ? false : undefined,
      }

      const sessions = await fetchSessionsForExport(filters)

      if (sessions.length === 0) {
        toast({
          title: "No Data",
          description: "No sessions found for the selected criteria",
          variant: "destructive",
        })
        return
      }

      if (exportType === "csv") {
        const csvContent = generateSessionsCSV(sessions)
        const filename = `tutoring-sessions-${startDate}-to-${endDate}.csv`
        downloadCSV(csvContent, filename)

        toast({
          title: "Export Successful",
          description: `Downloaded ${sessions.length} sessions as CSV`,
        })
      } else {
        // Generate invoice
        if (!studentId || studentId === "all") {
          // Updated condition to handle "all" value
          toast({
            title: "Error",
            description: "Please select a student for invoice generation",
            variant: "destructive",
          })
          return
        }

        const student = students.find((s) => s.id === studentId)
        if (!student) return

        const studentSessions = sessions.filter((s) => s.student_name === student.name)
        const totalAmount = studentSessions.reduce((sum, session) => sum + session.total_amount, 0)

        const invoiceData: InvoiceData = {
          student_name: student.name,
          student_email: student.email,
          sessions: studentSessions,
          total_amount: totalAmount,
          invoice_number: `INV-${Date.now()}`,
          date_range: { start: startDate, end: endDate },
        }

        printInvoice(invoiceData)

        toast({
          title: "Invoice Generated",
          description: `Generated invoice for ${student.name} with ${studentSessions.length} sessions`,
        })
      }

      setOpen(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="export-type">Export Type</Label>
            <Select value={exportType} onValueChange={(value: "csv" | "invoice") => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    CSV Report
                  </div>
                </SelectItem>
                <SelectItem value="invoice">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 mr-2" />
                    Student Invoice
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="student">
              Student {exportType === "invoice" && <span className="text-red-500">*</span>}
            </Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="All students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {exportType === "csv" && (
            <div className="space-y-2">
              <Label>Payment Status Filter</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid-only"
                    checked={paidOnly}
                    onCheckedChange={(checked) => {
                      setPaidOnly(checked as boolean)
                      if (checked) setUnpaidOnly(false)
                    }}
                  />
                  <Label htmlFor="paid-only">Paid only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unpaid-only"
                    checked={unpaidOnly}
                    onCheckedChange={(checked) => {
                      setUnpaidOnly(checked as boolean)
                      if (checked) setPaidOnly(false)
                    }}
                  />
                  <Label htmlFor="unpaid-only">Unpaid only</Label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? "Exporting..." : exportType === "csv" ? "Download CSV" : "Generate Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
