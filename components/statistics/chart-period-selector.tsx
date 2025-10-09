"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PeriodType = "week" | "month" | "3months" | "custom" | "all"

export interface DateRange {
  from: Date
  to: Date
}

export interface ChartPeriod {
  type: PeriodType
  customRange?: DateRange
}

interface ChartPeriodSelectorProps {
  value: ChartPeriod
  onChange: (period: ChartPeriod) => void
  className?: string
}

export function ChartPeriodSelector({ value, onChange, className }: ChartPeriodSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [tempDateFrom, setTempDateFrom] = useState<Date | undefined>(value.customRange?.from)
  const [tempDateTo, setTempDateTo] = useState<Date | undefined>(value.customRange?.to)
  const [currentStep, setCurrentStep] = useState<"to" | "from">("to")
  const [dateInputTo, setDateInputTo] = useState(tempDateTo ? format(tempDateTo, "MM/dd/yyyy") : "")
  const [dateInputFrom, setDateInputFrom] = useState(tempDateFrom ? format(tempDateFrom, "MM/dd/yyyy") : "")

  const handlePeriodTypeChange = (type: PeriodType) => {
    if (type === "custom") {
      setCurrentStep("to")
      setIsCalendarOpen(true)
      onChange({ type, customRange: value.customRange })
    } else {
      onChange({ type })
    }
  }

  const handleDateInputToChange = (inputValue: string) => {
    setDateInputTo(inputValue)
    const parsedDate = parse(inputValue, "MM/dd/yyyy", new Date())
    if (isValid(parsedDate) && parsedDate <= new Date()) {
      setTempDateTo(parsedDate)
    }
  }

  const handleDateInputFromChange = (inputValue: string) => {
    setDateInputFrom(inputValue)
    const parsedDate = parse(inputValue, "MM/dd/yyyy", new Date())
    if (isValid(parsedDate) && parsedDate <= new Date() && (!tempDateTo || parsedDate <= tempDateTo)) {
      setTempDateFrom(parsedDate)
    }
  }

  const handleCalendarToSelect = (date: Date | undefined) => {
    setTempDateTo(date)
    if (date) {
      setDateInputTo(format(date, "MM/dd/yyyy"))
    }
  }

  const handleCalendarFromSelect = (date: Date | undefined) => {
    setTempDateFrom(date)
    if (date) {
      setDateInputFrom(format(date, "MM/dd/yyyy"))
    }
  }

  const handleNextStep = () => {
    if (currentStep === "to" && tempDateTo) {
      setCurrentStep("from")
    }
  }

  const handleApplyCustomRange = () => {
    if (tempDateFrom && tempDateTo) {
      onChange({
        type: "custom",
        customRange: {
          from: tempDateFrom,
          to: tempDateTo,
        },
      })
      setIsCalendarOpen(false)
      setCurrentStep("to")
    }
  }

  const getDisplayValue = () => {
    if (value.type === "custom" && value.customRange) {
      return `${format(value.customRange.from, "MMM d")} - ${format(value.customRange.to, "MMM d, yyyy")}`
    }
    switch (value.type) {
      case "week":
        return "Last Week"
      case "month":
        return "Last Month"
      case "3months":
        return "Last 3 Months"
      case "all":
        return "All Time"
      default:
        return "Select Period"
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value.type} onValueChange={handlePeriodTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>{getDisplayValue()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Last Week</SelectItem>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="3months">Last 3 Months</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {value.type === "custom" && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal text-sm">
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {value.customRange ? (
                <>
                  {format(value.customRange.from, "MMM d")} - {format(value.customRange.to, "MMM d, yyyy")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              {currentStep === "to" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date (End)</label>
                    <Input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={dateInputTo}
                      onChange={(e) => handleDateInputToChange(e.target.value)}
                      className="mb-2 text-sm"
                    />
                    <Calendar
                      mode="single"
                      selected={tempDateTo}
                      onSelect={handleCalendarToSelect}
                      initialFocus
                      disabled={(date) => date > new Date()}
                      className="text-sm"
                    />
                  </div>
                  <Button onClick={handleNextStep} disabled={!tempDateTo} className="w-full">
                    Next: Select Start Date
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date (Start)</label>
                    <Input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      value={dateInputFrom}
                      onChange={(e) => handleDateInputFromChange(e.target.value)}
                      className="mb-2 text-sm"
                    />
                    <Calendar
                      mode="single"
                      selected={tempDateFrom}
                      onSelect={handleCalendarFromSelect}
                      initialFocus
                      disabled={(date) => date > new Date() || (tempDateTo ? date > tempDateTo : false)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentStep("to")} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleApplyCustomRange} disabled={!tempDateFrom} className="flex-1">
                      Apply
                    </Button>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
