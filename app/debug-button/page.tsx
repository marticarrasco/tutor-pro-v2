"use client"

import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugButtonPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Button Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Default Button</h3>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Default Button
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Outline Button (Date Picker Style)</h3>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              October 7th, 2025
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Outline Button (Minimal)</h3>
            <Button variant="outline">
              Click Me
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Secondary Button</h3>
            <Button variant="secondary">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Secondary Style
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Ghost Button</h3>
            <Button variant="ghost">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Ghost Style
            </Button>
          </div>

          <div className="border p-4 rounded">
            <p className="text-sm text-muted-foreground mb-2">Button in a bordered container:</p>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Should have visible border
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

