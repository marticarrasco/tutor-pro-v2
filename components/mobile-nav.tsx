"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CalendarDays, Home, Users, BookOpen } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/students",
    label: "Students",
    icon: Users,
  },
  {
    href: "/sessions",
    label: "Sessions",
    icon: BookOpen,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: CalendarDays,
  },
  {
    href: "/statistics",
    label: "Insights",
    icon: BarChart3,
  },
] satisfies Array<{
  href: string
  label: string
  icon: typeof Home
}>

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)] md:hidden"
      aria-label="Primary"
    >
      <div className="pointer-events-auto w-full max-w-md px-4">
        <div className="border-border/60 bg-card/95 supports-[backdrop-filter]:bg-card/60 supports-[backdrop-filter]:backdrop-blur-md shadow-lg ring-1 ring-black/5 rounded-2xl">
          <ul className="grid grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

