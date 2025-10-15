import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 animate-scale-in", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted animate-skeleton" />
          <div className="h-6 w-6 rounded bg-muted animate-skeleton" />
        </div>
        <div className="h-8 w-32 rounded bg-muted animate-skeleton" />
        <div className="h-3 w-40 rounded bg-muted/70 animate-skeleton" style={{ animationDelay: '0.1s' }} />
      </div>
    </div>
  )
}

interface SkeletonChartProps {
  className?: string
}

export function SkeletonChart({ className }: SkeletonChartProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 animate-scale-in", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-48 rounded bg-muted animate-skeleton" />
            <div className="h-3 w-64 rounded bg-muted/70 animate-skeleton mt-2" style={{ animationDelay: '0.1s' }} />
          </div>
          <div className="h-8 w-32 rounded bg-muted animate-skeleton" />
        </div>
        <div className="h-[300px] w-full rounded bg-muted/50 animate-skeleton flex items-end justify-around p-4" style={{ animationDelay: '0.2s' }}>
          {[60, 80, 70, 90, 75, 85].map((height, i) => (
            <div
              key={i}
              className="w-12 rounded-t bg-muted animate-pulse-gentle"
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  className?: string
}

export function SkeletonTable({ rows = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("rounded-lg border bg-card animate-scale-in", className)}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted animate-skeleton" />
          <div className="h-8 w-24 rounded bg-muted animate-skeleton" />
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full max-w-[200px] rounded bg-muted animate-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
              <div className="h-3 w-full max-w-[150px] rounded bg-muted/70 animate-skeleton" style={{ animationDelay: `${i * 0.05 + 0.05}s` }} />
            </div>
            <div className="h-8 w-20 rounded bg-muted animate-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn("rounded-full border-2 border-primary/30 animate-spin", sizeClasses[size])} style={{ borderTopColor: 'transparent' }} />
        <div className={cn("absolute inset-0 rounded-full border-2 border-primary/10 animate-ping", sizeClasses[size])} />
      </div>
    </div>
  )
}
