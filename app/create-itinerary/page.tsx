
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react"
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
  {
    value: "budget",
    label: "Budget Traveler",
    description: "Maximize experiences, minimize costs",
  },
  {
    value: "balanced",
    label: "Balanced Explorer",
    description: "Mix of comfort and adventure",
  },
  {
    value: "luxury",
    label: "Luxury Seeker",
    description: "Premium experiences and comfort",
  },
  {
    value: "adventure",
    label: "Adventure Enthusiast",
    description: "Thrilling and active experiences",
  },
  {
    value: "cultural",
    label: "Cultural Immersion",
    description: "Deep local cultural experiences",
  },
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

    const destination = formData.destination.trim()
    const budget = Number(formData.budget)
    const groupSize = Number(formData.groupSize)

    if (!destination) {
      alert("Please enter a destination.")
      return
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select both travel dates.")
      return
    }

    const start = new Date(`${formData.startDate}T00:00:00`)
    const end = new Date(`${formData.endDate}T00:00:00`)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      alert("Please enter valid travel dates.")
      return
    }

    if (start < today) {
      alert("The start date cannot be in the past.")
      return
    }

    if (end <= start) {
      alert("The end date must be after the start date.")
      return
    }

    if (!Number.isFinite(budget) || budget <= 0) {
      alert("Please enter a budget greater than zero.")
      return
    }

    if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 8) {
      alert("Group size must be between 1 and 8 people.")
      return
    }

    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    const dailyBudget = budget / groupSize / duration

    const wantsLuxury =
      formData.travelStyle === "luxury" ||
      formData.accommodation === "luxury"

    if (wantsLuxury && dailyBudget < 100) {
      const proceed = window.confirm(
        `Your budget is about $${dailyBudget.toFixed(2)} per person per day. ` +
          "Luxury travel may exceed this budget. Continue anyway?"
      )

      if (!proceed) return
    } else if (dailyBudget < 25) {
      const proceed = window.confirm(
        `Your budget is about $${dailyBudget.toFixed(2)} per person per day. ` +
          "This may be insufficient for some destinations. Continue anyway?"
      )

      if (!proceed) return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget,
          groupSize,
          preferences: {
            activities: formData.activities,
            travelStyle: formData.travelStyle,
            accommodation: formData.accommodation,
            specialRequirements: formData.specialRequirements,
          },
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.id) {
        router.push(`/itinerary/${data.id}`)
      } else {
        alert(
          data.error ||
            "Failed to generate itinerary. Please try again."
        )
      }
    } catch (error) {
      console.error("Error generating itinerary:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      const duration = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )

      return duration > 0 ? duration : 0
    }

    return 0
  }

  const duration = calculateDuration()

  const dailyBudget =
    formData.budget && duration > 0
      ? Math.round(
          Number(formData.budget) /
            Number(formData.groupSize) /
            duration
        )
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Perfect Itinerary
          </h1>
          <p className="text-xl text-gray-600">
            Let AI craft a personalized travel experience just for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-600" />
                Trip Details
              </CardTitle>
              <CardDescription>
                Tell us about your dream destination and travel dates
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Paris, France or Tokyo, Japan"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={
                      formData.startDate ||
                      new Date().toLocaleDateString("en-CA")
                    }
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
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
                Budget &amp; Group
              </CardTitle>
              <CardDescription>
                Set your budget and group size for personalized recommendations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Total Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g., 2000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="groupSize">Group Size</Label>
                  <Select
                    value={formData.groupSize}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        groupSize: value,
                      }))
                    }
                  >
                    <SelectTrigger id="groupSize">
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
              <CardDescription>
                Customize your experience based on your interests and style
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label>Travel Style</Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {travelStyles.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      aria-pressed={formData.travelStyle === style.value}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.travelStyle === style.value
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          travelStyle: style.value,
                        }))
                      }
                    >
                      <h4 className="font-medium text-gray-900">
                        {style.label}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {style.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Favorite Activities</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select activities you enjoy (choose multiple)
                </p>

                <div className="flex flex-wrap gap-2">
                  {popularActivities.map((activity) => {
                    const selected = formData.activities.includes(activity)

                    return (
                      <Badge
                        key={activity}
                        variant={selected ? "default" : "outline"}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        className="cursor-pointer hover:bg-cyan-100"
                        onClick={() => handleActivityToggle(activity)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleActivityToggle(activity)
                          }
                        }}
                      >
                        {activity}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="accommodation">
                  Accommodation Preference
                </Label>

                <Select
                  value={formData.accommodation}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      accommodation: value,
                    }))
                  }
                >
                  <SelectTrigger id="accommodation">
                    <SelectValue placeholder="Select accommodation type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="budget">
                      Budget (Hostels, Budget Hotels)
                    </SelectItem>
                    <SelectItem value="mid-range">
                      Mid-range (3-star Hotels, B&amp;Bs)
                    </SelectItem>
                    <SelectItem value="luxury">
                      Luxury (4-5 star Hotels, Resorts)
                    </SelectItem>
                    <SelectItem value="unique">
                      Unique (Boutique, Local Stays)
                    </SelectItem>
                    <SelectItem value="apartment">
                      Apartments/Vacation Rentals
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialRequirements">
                  Special Requirements
                </Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Any dietary restrictions, accessibility needs, or special interests..."
                  value={formData.specialRequirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      specialRequirements: e.target.value,
                    }))
                  }
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
