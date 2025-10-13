import LoadingPage from "@/components/loading/loading-page"
import { TrendingUp } from "lucide-react"

export default function Loading() {
  return (
    <LoadingPage
      title="Crunching your analytics"
      description="Building revenue trends, session metrics, and performance insights."
      tip="Grab a coffee—these insights will help you plan your next big move."
      icon={TrendingUp}
    />
  )
}
