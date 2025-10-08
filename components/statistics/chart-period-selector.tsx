"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

  const handlePeriodTypeChange = (type: PeriodType) => {
    if (type === "custom") {
      setIsCalendarOpen(true)
      onChange({ type, customRange: value.customRange })
    } else {
      onChange({ type })
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
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.customRange ? (
                <>
                  {format(value.customRange.from, "MMM d, yyyy")} - {format(value.customRange.to, "MMM d, yyyy")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Calendar
                  mode="single"
                  selected={tempDateFrom}
                  onSelect={setTempDateFrom}
                  initialFocus
                  disabled={(date) => date > new Date() || (tempDateTo ? date > tempDateTo : false)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Calendar
                  mode="single"
                  selected={tempDateTo}
                  onSelect={setTempDateTo}
                  disabled={(date) => date > new Date() || (tempDateFrom ? date < tempDateFrom : false)}
                />
              </div>
              <Button onClick={handleApplyCustomRange} disabled={!tempDateFrom || !tempDateTo} className="w-full">
                Apply Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
