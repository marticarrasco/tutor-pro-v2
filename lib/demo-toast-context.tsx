"use client"

import { createContext, useContext, ReactNode } from "react"
import { toast as originalToast } from "@/hooks/use-toast"
import { useDemoSignUp } from "@/lib/demo-signup-context"

interface DemoToastContextType {
    toast: typeof originalToast
}

const DemoToastContext = createContext<DemoToastContextType | undefined>(undefined)

export function DemoToastProvider({ children }: { children: ReactNode }) {
    const { showSignUpDialog } = useDemoSignUp()

    const demoToast: typeof originalToast = (props) => {
        // If it's an error toast (destructive variant), show sign-up dialog instead
        if (props.variant === "destructive") {
            showSignUpDialog()
            return { id: "", dismiss: () => { }, update: () => { } }
        }

        // For success toasts, show them normally
        return originalToast(props)
    }

    return (
        <DemoToastContext.Provider value={{ toast: demoToast }}>
            {children}
        </DemoToastContext.Provider>
    )
}

export function useDemoToast() {
    const context = useContext(DemoToastContext)
    if (context === undefined) {
        // Fallback to original toast if not in demo context
        return { toast: originalToast }
    }
    return context
}
