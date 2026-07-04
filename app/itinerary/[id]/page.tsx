import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, DollarSign, Download, Share2, Sun } from "lucide-react"
import Link from "next/link"
import { ItineraryContent } from "@/components/itinerary-content"

interface ItineraryPageProps {
  params: {
    id: string
  }
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
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

  const calculateDuration = () => {
    const start = new Date(itinerary.start_date)
    const end = new Date(itinerary.end_date)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const duration = calculateDuration()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <div className="flex gap-2">
              <Link href={`/seasonal/${itinerary.id}`}>
                <Button variant="outline" size="sm">
                  <Sun className="h-4 w-4 mr-2" />
                  Seasonal Guide
                </Button>
              </Link>
              <Link href={`/budget/${itinerary.id}`}>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Budget Manager
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your {itinerary.destination} Adventure</h1>

          {/* Trip Summary */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="font-medium">{itinerary.group_size} people</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="font-medium">${itinerary.budget}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Travel Dates</p>
                <p className="font-medium">
                  {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                </p>
              </div>

              {itinerary.preferences?.activities && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Selected Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.preferences.activities.map((activity: string) => (
                      <Badge key={activity} variant="secondary">
                        {activity}
                      </Badge>
                    ))}
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

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Link href="/create-itinerary">
            <Button variant="outline">Create Another Itinerary</Button>
          </Link>
          <Link href="/dashboard">
            <Button>View All Itineraries</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
