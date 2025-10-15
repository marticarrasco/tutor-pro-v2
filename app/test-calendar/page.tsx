"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader
          className="pt-0"
          icon={<CalendarIcon className="h-6 w-6" />}
          eyebrow="Sandbox"
          title="Calendar Component Lab"
          description="Experiment with the date picker and popover states to verify layout and behaviour across use cases."
        />
        <Card className="w-full">
        <CardHeader>
          <CardTitle>Calendar Date Picker Test</CardTitle>
          <CardDescription>
            Testing the calendar component to ensure it displays properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test 1: Popover with Calendar */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test 1: Calendar in Popover (Controlled)</h3>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  onClick={() => console.log("Controlled button clicked, open:", open)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate)
                    setOpen(false)
                  }}
                  initialFocus
                  weekStartsOn={1}
                />
              </PopoverContent>
            </Popover>
            {date && (
              <div className="text-sm text-muted-foreground">
                Selected date: {date.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Test 1b: Simple Popover Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test 1b: Simple Popover (No Calendar)</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Click me for popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="p-4 bg-green-500 text-white font-bold">
                  This is a simple popover!
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Test 1c: Uncontrolled Popover with Calendar */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test 1c: Calendar in Popover (Uncontrolled)</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  onClick={() => console.log("Uncontrolled button clicked")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date (uncontrolled)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  weekStartsOn={1}
                />
              </PopoverContent>
            </Popover>
            {date && (
              <div className="text-sm text-muted-foreground">
                Selected date: {date.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Test 2: Standalone Calendar */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test 2: Standalone Calendar</h3>
            <div className="border rounded-md p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="mx-auto"
                weekStartsOn={1}
              />
            </div>
          </div>

          {/* Debug Info */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-lg font-semibold">Debug Information</h3>
            <div className="text-sm space-y-1">
              <p><strong>Formatted date:</strong> {date ? format(date, "PPP") : "N/A"}</p>
              <p><strong>ISO date:</strong> {date ? date.toISOString().split('T')[0] : "N/A"}</p>
              <p><strong>Popover open:</strong> {open ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

