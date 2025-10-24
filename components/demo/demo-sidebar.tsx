"use client"

import { Calendar, Home, Users, BookOpen, BarChart3 } from "lucide-react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"

const items = [
  {
    title: "Home",
    url: "/demo",
    icon: Home,
  },
  {
    title: "Students",
    url: "/demo/students",
    icon: Users,
  },
  {
    title: "Sessions",
    url: "/demo/sessions",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    url: "/demo/schedule",
    icon: Calendar,
  },
  {
    title: "Statistics",
    url: "/demo/statistics",
    icon: BarChart3,
  },
]

export function DemoSidebar() {
  const { theme } = useTheme()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src={theme === "dark" ? "/logo derno_dark.png" : "/logo derno.png"}
            alt="Derno Logo"
            width={100}
            height={80}
            className="object-contain"
          />
          <Badge variant="secondary" className="text-xs">Demo</Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border space-y-2">
        <div className="px-4 pt-3">
          <ThemeToggle />
        </div>
        <div className="px-4 py-2 flex items-center gap-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder-user.jpg" alt="Demo User" />
            <AvatarFallback>DU</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">Demo User</span>
            <span className="text-xs text-muted-foreground">demo@derno.app</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

