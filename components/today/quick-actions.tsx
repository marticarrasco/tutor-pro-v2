"use client"

import { Plus, Users, BookOpen, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button asChild className="justify-start h-auto p-4">
          <Link href="/sessions">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Log New Session</div>
                <div className="text-sm text-muted-foreground">Record a completed tutoring session</div>
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
          <Link href="/students">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">Manage Students</div>
                <div className="text-sm text-muted-foreground">Add or edit student information</div>
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
          <Link href="/schedule">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">View Schedule</div>
                <div className="text-sm text-muted-foreground">Check your weekly class schedule</div>
              </div>
            </div>
          </Link>
        </Button>

        <Button asChild variant="outline" className="justify-start h-auto p-4 bg-transparent">
          <Link href="/statistics">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">View Statistics</div>
                <div className="text-sm text-muted-foreground">Analyze your tutoring performance</div>
              </div>
            </div>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
