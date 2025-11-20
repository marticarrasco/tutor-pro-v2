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

import { useTranslations } from 'next-intl'

export function ChartPeriodSelector({ value, onChange, className }: ChartPeriodSelectorProps) {
  const t = useTranslations('StatisticsPage.periodSelector')
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
        return t('week')
      case "month":
        return t('month')
      case "3months":
        return t('quarter')
      case "all":
        return t('all')
      default:
        return t('selectPeriod')
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value.type} onValueChange={handlePeriodTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>{getDisplayValue()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">{t('lastWeek')}</SelectItem>
          <SelectItem value="month">{t('lastMonth')}</SelectItem>
          <SelectItem value="3months">{t('last3Months')}</SelectItem>
          <SelectItem value="all">{t('allTime')}</SelectItem>
          <SelectItem value="custom">{t('customRange')}</SelectItem>
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
                <span>{t('pickRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              {currentStep === "to" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('toDate')}</label>
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
                      weekStartsOn={1}
                    />
                  </div>
                  <Button onClick={handleNextStep} disabled={!tempDateTo} className="w-full">
                    {t('nextSelectStart')}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('fromDate')}</label>
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
                      weekStartsOn={1}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentStep("to")} variant="outline" className="flex-1">
                      {t('back')}
                    </Button>
                    <Button onClick={handleApplyCustomRange} disabled={!tempDateFrom} className="flex-1">
                      {t('apply')}
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
