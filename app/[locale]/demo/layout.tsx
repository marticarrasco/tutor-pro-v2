import { DemoProvider } from "@/lib/demo-context"
import { DemoErrorBoundary } from "@/components/demo/demo-error-boundary"
import { ThemeProvider } from "@/components/theme-provider"
import { DemoSignUpProvider } from "@/lib/demo-signup-context"
import { DemoToastProvider } from "@/lib/demo-toast-context"

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DemoErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["dark", "light"]}>
        <DemoProvider>
          <DemoSignUpProvider>
            <DemoToastProvider>
              {children}
            </DemoToastProvider>
          </DemoSignUpProvider>
        </DemoProvider>
      </ThemeProvider>
    </DemoErrorBoundary>
  )
}

