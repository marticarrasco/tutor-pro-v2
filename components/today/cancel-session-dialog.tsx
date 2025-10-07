"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface CancelSessionForm {
  cancelledBy: "teacher" | "student"
  reason: string
}

interface CancelSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (values: CancelSessionForm) => Promise<void>
  isSubmitting: boolean
  studentName?: string
  sessionTime?: string
}

export function CancelSessionDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
  studentName,
  sessionTime,
}: CancelSessionDialogProps) {
  const [formState, setFormState] = useState<CancelSessionForm>({ cancelledBy: "student", reason: "" })

  useEffect(() => {
    if (open) {
      setFormState({ cancelledBy: "student", reason: "" })
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel today's class</DialogTitle>
          <DialogDescription>
            {studentName ? `${studentName}'s` : "This"} class {sessionTime ? `at ${sessionTime} ` : ""}will be marked as cancelled
            with a $0 charge.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cancelled by</Label>
            <RadioGroup
              value={formState.cancelledBy}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, cancelledBy: value as "teacher" | "student" }))}
              className="grid grid-cols-2 gap-2"
            >
              <Label
                htmlFor="cancelled-by-student"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <RadioGroupItem id="cancelled-by-student" value="student" /> Student
              </Label>
              <Label
                htmlFor="cancelled-by-teacher"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              >
                <RadioGroupItem id="cancelled-by-teacher" value="teacher" /> Teacher
              </Label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Notes (optional)</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Add a short note about the cancellation"
              value={formState.reason}
              onChange={(event) => setFormState((prev) => ({ ...prev, reason: event.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Back
          </Button>
          <Button onClick={() => onConfirm(formState)} disabled={isSubmitting}>
            {isSubmitting ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
