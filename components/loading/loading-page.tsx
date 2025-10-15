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
      {/* Animated background gradient with pulse effect */}
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl animate-pulse-slow" />
      
      {/* Floating orbs for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-primary/10 blur-2xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-primary/5 blur-3xl animate-float-slower" />
      </div>

      <div className="relative w-full max-w-xl animate-fade-in">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-primary/25 via-primary/10 to-primary/5 opacity-80 blur-2xl animate-pulse-slow" />
        <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/80 p-10 shadow-2xl backdrop-blur animate-scale-in">
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-[28px]">
            <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Enhanced spinner with multiple layers */}
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 animate-pulse-gentle">
              <Loader2 className="absolute h-16 w-16 animate-spin text-primary/30" />
              <div className="absolute h-12 w-12 rounded-full border-2 border-primary/20 animate-ping" />
              <Icon className="relative h-8 w-8 text-primary animate-float" />
            </span>
            
            <div className="space-y-2 animate-slide-up">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
              <p className="text-sm text-muted-foreground sm:text-base animate-fade-in-delayed">{description}</p>
            </div>
            
            <div className="flex w-full flex-col gap-3">
              {/* Enhanced progress bar with shimmer */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70 relative">
                <div className="animate-progress-bar-smooth h-full w-[60%] rounded-full bg-gradient-to-r from-primary via-primary/60 to-primary shadow-lg shadow-primary/20" />
                <div className="animate-shimmer-fast absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              
              {/* Pulsing dots indicator */}
              <div className="flex justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse-dot" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse-dot" style={{ animationDelay: '300ms' }} />
              </div>
              
              {tip ? <p className="text-xs text-muted-foreground sm:text-sm animate-fade-in-more-delayed">{tip}</p> : null}
            </div>
          </div>
          {children ? <div className="mt-8 animate-fade-in-more-delayed">{children}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default LoadingPage
