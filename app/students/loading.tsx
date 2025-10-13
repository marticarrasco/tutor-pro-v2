import LoadingPage from "@/components/loading/loading-page"
import { Users } from "lucide-react"

export default function Loading() {
  return (
    <LoadingPage
      title="Gathering student profiles"
      description="Collecting attendance, progress, and contact details for every learner."
      tip="While you wait, think about which student could use a quick check-in today."
      icon={Users}
    />
  )
}
