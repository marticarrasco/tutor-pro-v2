import LoadingPage from "@/components/loading/loading-page"
import { Clock } from "lucide-react"

export default function Loading() {
  return (
    <LoadingPage
      title="Loading recent sessions"
      description="Compiling session notes, outcomes, and payments to give you the full picture."
      tip="Pro tip: Filter by student or subject once the data appears to jump right into insights."
      icon={Clock}
    />
  )
}
