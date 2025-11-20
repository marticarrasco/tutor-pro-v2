"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDocumentTitle, useDocumentMeta } from "@/hooks/use-document-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User } from "@supabase/supabase-js"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/page-header"
import { Settings as SettingsIcon } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Currency } from "@/lib/currency-utils"
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('SettingsPage')
  const tProfile = useTranslations('SettingsPage.profileInformation')
  const tAccount = useTranslations('SettingsPage.accountInformation')
  useDocumentTitle(t('documentTitle'))
  useDocumentMeta(t('documentDescription'))

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [currency, setCurrency] = useState<Currency>("USD")
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setFullName(user?.user_metadata?.full_name || "")
      setEmail(user?.email || "")

      // Fetch profile data to get currency
      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user?.id)
        .single()

      if (profile?.currency) {
        setCurrency(profile.currency as Currency)
      } else {
        // Fallback to metadata or default
        setCurrency((user?.user_metadata?.currency as Currency) || "USD")
      }

      setLoading(false)
    }

    getUser()
  }, [supabase.auth])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      if (!user) {
        throw new Error("You must be signed in to update your profile")
      }

      const trimmedName = fullName.trim()
      if (!trimmedName) {
        throw new Error(tProfile('nameRequired'))
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName, currency: currency },
      })

      if (error) throw error

      setUser(data.user ?? user)

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: trimmedName,
          currency: currency,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

      if (profileError) throw profileError

      toast({
        title: tProfile('updateSuccess'),
        description: tProfile('updateSuccessDescription'),
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: tProfile('updateError'),
        description:
          error instanceof Error ? error.message : tProfile('updateErrorDescription'),
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="p-8 space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="p-8 space-y-6">
          <PageHeader
            className="pt-0"
            icon={<SettingsIcon className="h-6 w-6" />}
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
          />

          <Card>
            <CardHeader>
              <CardTitle>{tProfile('title')}</CardTitle>
              <CardDescription>{tProfile('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">{tProfile('fullName')}</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={tProfile('fullNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{tProfile('currency')}</Label>
                  <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder={tProfile('selectCurrency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">{tProfile('usd')}</SelectItem>
                      <SelectItem value="EUR">{tProfile('eur')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{tProfile('email')}</Label>
                  <Input id="email" value={email} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground">{tProfile('emailCannotChange')}</p>
                </div>
                <Button type="submit" disabled={updating}>
                  {updating ? tProfile('updating') : tProfile('updateProfile')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tAccount('title')}</CardTitle>
              <CardDescription>{tAccount('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{tAccount('userId')}</span>
                <span className="font-mono text-sm">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">{tAccount('accountCreated')}</span>
                <span className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">{tAccount('lastSignIn')}</span>
                <span className="text-sm">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

