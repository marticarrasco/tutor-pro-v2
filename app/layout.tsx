import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import LoadingPage from "@/components/loading/loading-page"
import "./globals.css"

export const metadata: Metadata = {
  title: "TutorPro - Tutoring Management",
  description: "Professional tutoring management application",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light", "clear"]}>
          <Suspense
            fallback={
              <LoadingPage
                title="Launching TutorPro"
                description="Polishing the dashboard experience and loading your personalized workspace."
                tip="Stay tuned—the tools you need to run your tutoring business are seconds away."
              />
            }
          >
            {children}
          </Suspense>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
