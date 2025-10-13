import LoadingPage from "@/components/loading/loading-page"
import { Calendar } from "lucide-react"

export default function Loading() {
  return (
    <LoadingPage
      title="Preparing your schedule"
      description="Syncing lessons, availability, and reminders so everything is perfectly aligned."
      tip="Tip: Review upcoming sessions once the page loads to stay ahead of every class."
      icon={Calendar}
    />
  )
}
