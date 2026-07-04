"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, DollarSign, Users, Calendar, Mountain, Building, Waves, TreePine, Camera, Utensils, ShoppingBag, Music, Dumbbell, BookOpen, X } from 'lucide-react'

interface TravelPreferencesFormProps {
  userId: string
  existingPreferences: any
}

const activities = [
  { id: "adventure", label: "Adventure & Outdoor", icon: Mountain },
  { id: "culture", label: "Cultural Experiences", icon: Building },
  { id: "beach", label: "Beach & Water Sports", icon: Waves },
  { id: "nature", label: "Nature & Wildlife", icon: TreePine },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "food", label: "Food & Culinary", icon: Utensils },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "nightlife", label: "Nightlife & Entertainment", icon: Music },
  { id: "sports", label: "Sports & Fitness", icon: Dumbbell },
  { id: "history", label: "Historical Sites", icon: BookOpen },
]

export default function TravelPreferencesForm({ userId, existingPreferences }: TravelPreferencesFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Form state
  const [selectedActivities, setSelectedActivities] = useState<string[]>(existingPreferences?.favorite_activities || [])
  const [budgetRange, setBudgetRange] = useState<number[]>(existingPreferences?.budget_range ? [1000, 5000] : [1000, 5000])
  const [travelStyle, setTravelStyle] = useState(existingPreferences?.travel_style || "balanced")
  const [accommodationType, setAccommodationType] = useState(existingPreferences?.accommodation_preference || "hotel")
  const [destinations, setDestinations] = useState<string[]>(existingPreferences?.preferred_destinations || [])
  const [groupSize, setGroupSize] = useState(existingPreferences?.group_size?.toString() || "2")

  const [newDestination, setNewDestination] = useState("")

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations(prev => [...prev, newDestination.trim()])
      setNewDestination("")
    }
  }

  const removeDestination = (destination: string) => {
    setDestinations(prev => prev.filter(d => d !== destination))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorite_activities: selectedActivities,
          budget_range: `$${budgetRange[0]} - $${budgetRange[1]}`,
          travel_style: travelStyle,
          accommodation_preference: accommodationType,
          preferred_destinations: destinations,
          group_size: parseInt(groupSize) || 2,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save preferences')
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Error saving preferences:', error)
      setError(error instanceof Error ? error.message : 'Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Plane className="h-8 w-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-gray-900">Travel Preferences</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us understand your travel style so we can create the perfect AI-powered itineraries for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destinations */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-600" />
              Dream Destinations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a destination (e.g., Tokyo, Paris, Bali)"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDestination())}
              />
              <Button type="button" onClick={addDestination} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {destinations.map((destination: string) => (
                <Badge key={destination} variant="secondary" className="text-sm">
                  {destination}
                  <button
                    type="button"
                    onClick={() => removeDestination(destination)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Favorite Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {activities.map((activity) => {
                const Icon = activity.icon
                const isSelected = selectedActivities.includes(activity.id)
                return (
                  <div
                    key={activity.id}
                    onClick={() => handleActivityToggle(activity.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-sm text-center font-medium">{activity.label}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Travel Style & Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Travel Style</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={travelStyle} onValueChange={setTravelStyle}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="budget" id="budget" />
                  <Label htmlFor="budget">Budget-Conscious</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="luxury" id="luxury" />
                  <Label htmlFor="luxury">Luxury</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget Range (USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="px-2">
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  max={10000}
                  min={100}
                  step={100}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>${budgetRange[0]}</span>
                <span>${budgetRange[1]}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Size & Accommodation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Typical Group Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={groupSize} onValueChange={setGroupSize}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="solo" />
                  <Label htmlFor="solo">Solo Travel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="couple" />
                  <Label htmlFor="couple">Couple</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3-5" id="small-group" />
                  <Label htmlFor="small-group">Small Group (3-5)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6+" id="large-group" />
                  <Label htmlFor="large-group">Large Group (6+)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Accommodation Preference</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={accommodationType} onValueChange={setAccommodationType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hotel" id="hotel" />
                  <Label htmlFor="hotel">Hotels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="airbnb" id="airbnb" />
                  <Label htmlFor="airbnb">Vacation Rentals</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hostel" id="hostel" />
                  <Label htmlFor="hostel">Hostels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mix of Options</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          {!isSaved ? (
            <Button type="submit" disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 px-8 py-3 text-lg">
              {isLoading ? "Saving Preferences..." : "Save Preferences"}
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Preferences Saved!</h3>
                </div>
                <p className="text-green-700 mb-4">Your travel preferences have been successfully saved.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/create-itinerary">
                    <Button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 w-full sm:w-auto">
                      Create Itinerary
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="px-6 py-2 w-full sm:w-auto bg-transparent">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}