"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Currency } from "@/lib/currency-utils"
import { User } from "@supabase/supabase-js"

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    formatCurrency: (amount: number) => string
    isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("EUR")
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Try to get from profile first
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("currency")
                        .eq("id", user.id)
                        .single()

                    if (profile?.currency) {
                        setCurrency(profile.currency as Currency)
                    } else {
                        // Fallback to metadata
                        setCurrency((user.user_metadata?.currency as Currency) || "EUR")
                    }
                }
            } catch (error) {
                console.error("Error fetching currency:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCurrency()
    }, [])

    const formatCurrency = (amount: number) => {
        if (currency === "USD") {
            return `$${amount}`
        } else {
            return `${amount} €`
        }
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider")
    }
    return context
}
