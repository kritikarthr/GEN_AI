import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, Users, DollarSign, Plus, Search, Eye } from "lucide-react"
import Link from "next/link"

export default async function ItinerariesPage() {
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

  // Fetch all itineraries
  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return "bg-blue-100 text-blue-800"
    if (now >= start && now <= end) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now < start) return "Upcoming"
    if (now >= start && now <= end) return "Active"
    return "Completed"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
            <Link href="/create-itinerary">
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Itinerary
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Travel Itineraries</h1>
          <p className="text-xl text-gray-600">Manage and view all your AI-generated travel plans</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search destinations..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trips</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="date">Travel Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Itineraries Grid */}
        {itineraries && itineraries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => {
              const duration = calculateDuration(itinerary.start_date, itinerary.end_date)
              const statusColor = getStatusColor(itinerary.start_date, itinerary.end_date)
              const statusText = getStatusText(itinerary.start_date, itinerary.end_date)

              return (
                <Card key={itinerary.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{itinerary.destination}</CardTitle>
                      <Badge className={statusColor}>{statusText}</Badge>
                    </div>
                    <CardDescription>
                      {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{duration} days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{itinerary.group_size} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm">${itinerary.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm">Trip</span>
                      </div>
                    </div>

                    {itinerary.preferences?.activities && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {itinerary.preferences.activities.slice(0, 3).map((activity: string) => (
                            <Badge key={activity} variant="outline" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                          {itinerary.preferences.activities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{itinerary.preferences.activities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Link href={`/itinerary/${itinerary.id}`}>
                      <Button className="w-full bg-transparent" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Itinerary
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No itineraries yet</h3>
              <p className="text-gray-600 mb-6">Create your first AI-powered travel itinerary to get started!</p>
              <Link href="/create-itinerary">
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Itinerary
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
