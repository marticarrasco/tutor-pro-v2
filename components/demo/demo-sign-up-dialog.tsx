"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"
import { useRouter } from "next/navigation"

interface DemoSignUpDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DemoSignUpDialog({ open, onOpenChange }: DemoSignUpDialogProps) {
    const router = useRouter()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Ready to take control?</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        This is a demo environment. To save your changes and unlock all features, create your free account today.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-green-500">✓</span> Save your data securely
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-green-500">✓</span> Access advanced analytics
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="text-green-500">✓</span> Manage unlimited students
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button
                        className="w-full text-lg py-6"
                        onClick={() => window.parent.location.href = '/auth/sign-up'}
                    >
                        Start for Free
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Continue Exploring Demo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
