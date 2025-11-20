"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { DemoSignUpDialog } from "@/components/demo/demo-sign-up-dialog"

interface DemoSignUpContextType {
    showSignUpDialog: () => void
}

const DemoSignUpContext = createContext<DemoSignUpContextType | undefined>(undefined)

export function DemoSignUpProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const showSignUpDialog = () => {
        setIsOpen(true)
    }

    return (
        <DemoSignUpContext.Provider value={{ showSignUpDialog }}>
            {children}
            <DemoSignUpDialog open={isOpen} onOpenChange={setIsOpen} />
        </DemoSignUpContext.Provider>
    )
}

export function useDemoSignUp() {
    const context = useContext(DemoSignUpContext)
    if (context === undefined) {
        throw new Error("useDemoSignUp must be used within a DemoSignUpProvider")
    }
    return context
}
