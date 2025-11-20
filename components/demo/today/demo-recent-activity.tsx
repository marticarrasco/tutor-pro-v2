"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { useDemoSignUp } from "@/lib/demo-signup-context"

interface RecentSession {
    id: string
    student_name: string
    date: string
    duration: number
    total_amount: number
    payment_status: "paid" | "pending" | "cancelled"
}

interface DemoRecentActivityProps {
    recentSessions: RecentSession[]
}

export function DemoRecentActivity({ recentSessions }: DemoRecentActivityProps) {
    const { showSignUpDialog } = useDemoSignUp()

    const handlePaymentClick = () => {
        // Show sign-up dialog when trying to change payment status
        showSignUpDialog()
    }

    if (recentSessions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-8">
                        No recent sessions found
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentSessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="font-medium">{session.student_name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {format(new Date(session.date), "MMM d, yyyy")} • {session.duration}h
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="font-bold">${session.total_amount.toFixed(2)}</div>
                                </div>
                                <Badge
                                    variant={session.payment_status === "paid" ? "default" : session.payment_status === "cancelled" ? "outline" : "secondary"}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={handlePaymentClick}
                                >
                                    {session.payment_status === "paid" ? "Paid" : session.payment_status === "cancelled" ? "Cancelled" : "Pending"}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
