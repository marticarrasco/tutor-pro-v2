"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class DemoErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in Demo Component:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] w-full items-center justify-center p-4">
                    <Card className="w-full max-w-md border-destructive/50 shadow-lg">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                            <CardDescription>
                                The demo component encountered an unexpected error.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                {this.state.error?.message || "An unknown error occurred."}
                            </p>
                            <div className="rounded-md bg-muted p-3 text-xs font-mono text-left overflow-auto max-h-32">
                                {this.state.error?.stack?.split('\n')[0]}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null })
                                    window.location.reload()
                                }}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reload Demo
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
