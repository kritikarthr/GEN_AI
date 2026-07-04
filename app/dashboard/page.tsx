import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Calendar, DollarSign, Settings, Plus, Eye, Users } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user
  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Traveler"

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const hasPreferences = profile?.favorite_activities && profile.favorite_activities.length > 0

  const totalItineraries = itineraries?.length || 0
  const totalBudget = itineraries?.reduce((sum, itinerary) => sum + (itinerary.budget || 0), 0) || 0
  const uniqueDestinations = new Set(itineraries?.map((itinerary) => itinerary.destination)).size

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Plane className="h-8 w-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-gray-900">TravelAI Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/preferences">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                Preferences
              </Button>
            </Link>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{userName}</p>
            </div>
          </div>
        </div>

        {!hasPreferences && (
          <Card className="border-0 shadow-xl mb-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Travel Profile</h3>
                  <p className="text-cyan-100">
                    Set up your preferences to get personalized AI-powered itinerary recommendations.
                  </p>
                </div>
                <Link href="/preferences">
                  <Button className="bg-white text-cyan-600 hover:bg-gray-100">Set Up Preferences</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destinations</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueDestinations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trips Planned</p>
                  <p className="text-2xl font-bold text-gray-900">{totalItineraries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plane className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI Suggestions</p>
                  <p className="text-2xl font-bold text-gray-900">∞</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Ready to plan your next adventure? Let our AI create the perfect itinerary based on your preferences,
                budget, and travel style.
              </p>
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700 h-12"
                disabled={!hasPreferences}
                asChild={hasPreferences}
              >
                {hasPreferences ? (
                  <Link href="/create-itinerary">Start Planning Your Trip</Link>
                ) : (
                  <span>Complete Preferences First</span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Recent Itineraries</CardTitle>
            </CardHeader>
            <CardContent>
              {itineraries && itineraries.length > 0 ? (
                <div className="space-y-4">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{itinerary.destination}</h4>
                        <Badge variant="secondary">${itinerary.budget}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(itinerary.start_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {itinerary.group_size} people
                        </span>
                      </div>
                      <Link href={`/itinerary/${itinerary.id}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          View Itinerary
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {itineraries.length >= 5 && (
                    <div className="text-center pt-4">
                      <Link href="/itineraries">
                        <Button variant="outline">View All Itineraries</Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No itineraries yet</p>
                  <p className="text-sm text-gray-500">
                    Your travel plans will appear here once you create your first itinerary.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
