import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SeasonalRecommendations } from "@/components/seasonal-recommendations"

interface SeasonalPageProps {
  params: {
    id: string
  }
}

export default async function SeasonalPage({ params }: SeasonalPageProps) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch itinerary
  const { data: itinerary, error: itineraryError } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (itineraryError || !itinerary) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/itinerary/${params.id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Itinerary
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seasonal Guide</h1>
          <p className="text-xl text-gray-600">
            {itinerary.destination} • Weather, activities, and packing recommendations
          </p>
        </div>

        {/* Seasonal Recommendations */}
        <SeasonalRecommendations
          destination={itinerary.destination}
          startDate={itinerary.start_date}
          endDate={itinerary.end_date}
        />
      </div>
    </div>
  )
}
