"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)

      if (!user) {
        router.push("/auth/login")
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        router.push("/auth/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-2 border-primary/30 animate-spin" style={{ borderTopColor: 'transparent' }} />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/10 animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
