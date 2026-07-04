"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign, Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const popularActivities = [
  "Sightseeing",
  "Museums",
  "Food Tours",
  "Adventure Sports",
  "Beach Activities",
  "Nightlife",
  "Shopping",
  "Cultural Experiences",
  "Nature & Hiking",
  "Photography",
  "Art Galleries",
  "Local Markets",
  "Historical Sites",
  "Music & Concerts",
  "Wellness & Spa",
]

const travelStyles = [
  { value: "budget", label: "Budget Traveler", description: "Maximize experiences, minimize costs" },
  { value: "balanced", label: "Balanced Explorer", description: "Mix of comfort and adventure" },
  { value: "luxury", label: "Luxury Seeker", description: "Premium experiences and comfort" },
  { value: "adventure", label: "Adventure Enthusiast", description: "Thrilling and active experiences" },
  { value: "cultural", label: "Cultural Immersion", description: "Deep local cultural experiences" },
]

export default function CreateItinerary() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    groupSize: "2",
    travelStyle: "",
    activities: [] as string[],
    accommodation: "",
    specialRequirements: "",
  })

  const handleActivityToggle = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: Number.parseInt(formData.budget),
          groupSize: Number.parseInt(formData.groupSize),
          preferences: {
            activities: formData.activities,
            travelStyle: formData.travelStyle,
            accommodation: formData.accommodation,
            specialRequirements: formData.specialRequirements,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/itinerary/${data.id}`)
      } else {
        alert("Failed to generate itinerary. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return duration > 0 ? duration : 0
    }
    return 0
  }

  const duration = calculateDuration()
  const dailyBudget =
    formData.budget && duration > 0
      ? Math.round(Number.parseInt(formData.budget) / Number.parseInt(formData.groupSize) / duration)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Perfect Itinerary</h1>
          <p className="text-xl text-gray-600">Let AI craft a personalized travel experience just for you</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-600" />
                Trip Details
              </CardTitle>
              <CardDescription>Tell us about your dream destination and travel dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {duration > 0 && (
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-cyan-800">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Trip Duration: <strong>{duration} days</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget & Group */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget & Group
              </CardTitle>
              <CardDescription>Set your budget and group size for personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Total Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="e.g., 2000"
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="groupSize">Group Size</Label>
                  <Select
                    value={formData.groupSize}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, groupSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {dailyBudget > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <Users className="inline h-4 w-4 mr-1" />
                    Daily Budget: <strong>${dailyBudget} per person</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Travel Preferences
              </CardTitle>
              <CardDescription>Customize your experience based on your interests and style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Travel Style</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {travelStyles.map((style) => (
                    <div
                      key={style.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.travelStyle === style.value
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, travelStyle: style.value }))}
                    >
                      <h4 className="font-medium text-gray-900">{style.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Favorite Activities</Label>
                <p className="text-sm text-gray-600 mb-3">Select activities you enjoy (choose multiple)</p>
                <div className="flex flex-wrap gap-2">
                  {popularActivities.map((activity) => (
                    <Badge
                      key={activity}
                      variant={formData.activities.includes(activity) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-cyan-100"
                      onClick={() => handleActivityToggle(activity)}
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="accommodation">Accommodation Preference</Label>
                <Select
                  value={formData.accommodation}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, accommodation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget (Hostels, Budget Hotels)</SelectItem>
                    <SelectItem value="mid-range">Mid-range (3-star Hotels, B&Bs)</SelectItem>
                    <SelectItem value="luxury">Luxury (4-5 star Hotels, Resorts)</SelectItem>
                    <SelectItem value="unique">Unique (Boutique, Local Stays)</SelectItem>
                    <SelectItem value="apartment">Apartments/Vacation Rentals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Any dietary restrictions, accessibility needs, or special interests..."
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialRequirements: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Perfect Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate My Itinerary
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
