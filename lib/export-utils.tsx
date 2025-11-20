// Utility functions for exporting data to various formats
import { createClient } from "@/lib/supabase/client"
import { requireAuthUser } from "@/lib/supabase/user"

export interface SessionData {
  id: string
  student_name: string
  student_email: string
  date: string
  duration: number
  hourly_rate: number
  total_amount: number
  is_paid: boolean
  notes?: string
}

export interface InvoiceData {
  student_name: string
  student_email: string
  sessions: SessionData[]
  total_amount: number
  invoice_number: string
  currency: "USD" | "EUR"
  date_range: {
    start: string
    end: string
  }
}

// Generate CSV content from sessions data
export function generateSessionsCSV(sessions: SessionData[]): string {
  const headers = ["Date", "Student", "Duration (hours)", "Hourly Rate", "Total Amount", "Paid Status", "Notes"]

  const csvContent = [
    headers.join(","),
    ...sessions.map((session) =>
      [
        session.date,
        `"${session.student_name}"`,
        session.duration.toString(),
        session.hourly_rate.toString(),
        session.total_amount.toString(),
        session.is_paid ? "Paid" : "Unpaid",
        `"${session.notes || ""}"`,
      ].join(","),
    ),
  ].join("\n")

  return csvContent
}

// Download CSV file
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generate HTML invoice content
export function generateInvoiceHTML(invoiceData: InvoiceData): string {
  const { student_name, student_email, sessions, total_amount, invoice_number, date_range, currency } = invoiceData
  const formatMoney = (amount: number) => currency === "USD" ? `$${amount.toFixed(2)}` : `${amount.toFixed(2)} €`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .sessions-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .sessions-table th, .sessions-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .sessions-table th { background-color: #f2f2f2; }
        .total { text-align: right; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Tutoring Invoice</h1>
        <p>Invoice #${invoice_number}</p>
      </div>
      
      <div class="invoice-details">
        <div>
          <h3>Bill To:</h3>
          <p>${student_name}<br>${student_email}</p>
        </div>
        <div>
          <h3>Invoice Details:</h3>
          <p>Period: ${date_range.start} to ${date_range.end}<br>
          Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <table class="sessions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Duration</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sessions
      .map(
        (session) => `
            <tr>
              <td>${new Date(session.date).toLocaleDateString()}</td>
              <td>${session.duration} hours</td>
              <td>${formatMoney(session.hourly_rate)}/hour</td>
              <td>${formatMoney(session.total_amount)}</td>
            </tr>
          `,
      )
      .join("")}
        </tbody>
      </table>
      
      <div class="total">
        <p>Total Amount: ${formatMoney(total_amount)}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `
}

// Print invoice (opens print dialog)
export function printInvoice(invoiceData: InvoiceData) {
  const htmlContent = generateInvoiceHTML(invoiceData)
  const printWindow = window.open("", "_blank")

  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}

// Fetch sessions for export
export async function fetchSessionsForExport(filters: {
  studentId?: string
  startDate?: string
  endDate?: string
  isPaid?: boolean
}) {
  const supabase = createClient()
  const user = await requireAuthUser(supabase)

  let query = supabase
    .from("tutoring_sessions")
    .select(`
      id,
      date,
      duration_minutes,
      hourly_rate,
      total_amount,
      is_paid,
      notes,
      students (
        name,
        email
      )
    `)
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  if (filters.studentId) {
    query = query.eq("student_id", filters.studentId)
  }

  if (filters.startDate) {
    query = query.gte("date", filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte("date", filters.endDate)
  }

  if (filters.isPaid !== undefined) {
    query = query.eq("is_paid", filters.isPaid)
  }

  const { data, error } = await query

  if (error) throw error

  return (
    data?.map((session) => {
      const student = Array.isArray(session.students) ? session.students[0] : session.students
      return {
        id: session.id,
        student_name: student?.name || "Unknown",
        student_email: student?.email || "",
        date: session.date,
        duration: session.duration_minutes / 60, // Convert minutes to hours
        hourly_rate: session.hourly_rate,
        total_amount: session.total_amount,
        is_paid: session.is_paid,
        notes: session.notes,
      }
    }) || []
  )
}
