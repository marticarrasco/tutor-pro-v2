"use client"

import { DemoProvider } from "@/lib/demo-context"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light"]}>
          <DemoProvider>
            {children}
          </DemoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

