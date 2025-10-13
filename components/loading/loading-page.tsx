import { cn } from "@/lib/utils"
import { Loader2, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface LoadingPageProps {
  title: string
  description: string
  tip?: string
  icon?: LucideIcon
  className?: string
  children?: ReactNode
}

export function LoadingPage({
  title,
  description,
  tip,
  icon: Icon = Loader2,
  className,
  children,
}: LoadingPageProps) {
  return (
    <div className={cn("relative flex min-h-[60vh] items-center justify-center px-6 py-24", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl" />
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-primary/25 via-primary/10 to-primary/5 opacity-80 blur-2xl" />
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/80 p-10 shadow-2xl backdrop-blur">
          <div className="flex flex-col items-center gap-6 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <Loader2 className="absolute h-16 w-16 animate-spin text-primary/30" />
              <Icon className="relative h-8 w-8 text-primary" />
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
              <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
            </div>
            <div className="flex w-full flex-col gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                <div className="animate-progress-bar h-full w-[60%] rounded-full bg-gradient-to-r from-primary via-primary/40 to-primary" />
              </div>
              {tip ? <p className="text-xs text-muted-foreground sm:text-sm">{tip}</p> : null}
            </div>
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
