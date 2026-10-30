
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { ItineraryContent } from "@/components/itinerary-content"
import ExportPDFButton from "@/components/export-pdf-button"
import ShareItineraryButton from "@/components/share-itinerary-button"

interface ItineraryPageProps {
  params: {
    id: string
  }
}

export default async function ItineraryPage({
  params,
}: ItineraryPageProps) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: itinerary, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error || !itinerary) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const start = new Date(itinerary.start_date)
  const end = new Date(itinerary.end_date)

  const duration = Math.max(
    1,
    Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard">
              <Button variant="outline">
                ← Back to Dashboard
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2">
              <Link href={`/seasonal/${itinerary.id}`}>
                <Button variant="outline" size="sm">
                  <Sun className="mr-2 h-4 w-4" />
                  Seasonal Guide
                </Button>
              </Link>

              <Link href={`/budget/${itinerary.id}`}>
                <Button variant="outline" size="sm">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Budget Manager
                </Button>
              </Link>

              <ShareItineraryButton
                destination={itinerary.destination}
              />

              <ExportPDFButton />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Your {itinerary.destination} Adventure
          </h1>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium">{itinerary.destination}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{duration} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Group Size</p>
                    <p className="font-medium">
                      {itinerary.group_size} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="font-medium">
                      ${Number(itinerary.budget).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm text-gray-600">Travel Dates</p>
                <p className="font-medium">
                  {formatDate(itinerary.start_date)} –{" "}
                  {formatDate(itinerary.end_date)}
                </p>
              </div>

              {itinerary.preferences?.activities?.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-sm text-gray-600">
                    Selected Activities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.preferences.activities.map(
                      (activity: string) => (
                        <Badge key={activity} variant="secondary">
                          {activity}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ItineraryContent
          content={itinerary.content}
          destination={itinerary.destination}
          startDate={itinerary.start_date}
          endDate={itinerary.end_date}
          budget={itinerary.budget}
          groupSize={itinerary.group_size}
        />

        <div className="mt-8 space-x-4 text-center">
          <Link href="/create-itinerary">
            <Button variant="outline">
              Create Another Itinerary
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button>
              View All Itineraries
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
