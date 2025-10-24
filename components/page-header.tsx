import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface PageHeaderProps {
  title: ReactNode
  description?: string
  eyebrow?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:items-center">
          <SidebarTrigger className="sm:hidden" />
          {icon ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {icon}
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            {eyebrow ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {description ? (
              <p className="max-w-2xl text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  )
}
