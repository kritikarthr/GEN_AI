
"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  IndianRupee,
  Sparkles,
  Loader2,
  ArrowLeftRight,
  Globe,
  AlertCircle,
  CheckCircle2,
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

type CurrencyInfo = {
  country: string
  currencyCode: string
  currencyName: string
  currencySymbol: string
  exchangeRate: number
  updatedAt: string
}

export default function CreateItinerary() {
  const router = useRouter()

  const [isGenerating, setIsGenerating] = useState(false)
  const [isLookingUpCurrency, setIsLookingUpCurrency] = useState(false)
  const [currencyError, setCurrencyError] = useState("")
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null)

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

  // Automatically identify the destination's local currency.
  useEffect(() => {
    const destination = formData.destination.trim()

    setCurrencyInfo(null)
    setCurrencyError("")

    if (destination.length < 3) {
      setIsLookingUpCurrency(false)
      return
    }

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setIsLookingUpCurrency(true)

      try {
        const response = await fetch(
          `/api/currency?destination=${encodeURIComponent(destination)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to identify destination currency."
          )
        }

        setCurrencyInfo(data)
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          setCurrencyError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLookingUpCurrency(false)
        }
      }
    }, 1200)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [formData.destination])

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatLocalCurrency = (
    amount: number,
    currencyCode: string
  ) => {
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currencyCode} ${amount.toFixed(2)}`
    }
  }

  const handleActivityToggle = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(`${formData.startDate}T00:00:00`)
      const end = new Date(`${formData.endDate}T00:00:00`)

      const days = Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      )

      return days > 0 ? days : 0
    }

    return 0
  }

  const duration = calculateDuration()

  const budgetINR = Number(formData.budget)

  const dailyBudget =
    budgetINR > 0 && duration > 0
      ? Math.round(
          budgetINR /
            Number(formData.groupSize) /
            duration
        )
      : 0

  const convertedBudget =
    currencyInfo && budgetINR > 0
      ? budgetINR * currencyInfo.exchangeRate
      : null

  const convertedDailyBudget =
    currencyInfo && dailyBudget > 0
      ? dailyBudget * currencyInfo.exchangeRate
      : null

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

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
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
      alert("Please enter a valid budget in Indian Rupees.")
      return
    }

    if (
      !Number.isInteger(groupSize) ||
      groupSize < 1 ||
      groupSize > 8
    ) {
      alert("Group size must be between 1 and 8 people.")
      return
    }

    if (!currencyInfo) {
      alert(
        "Please wait until the destination's local currency has been identified."
      )
      return
    }

    const tripDuration = Math.ceil(
      (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    const perPersonDailyINR =
      budget / groupSize / tripDuration

    const wantsLuxury =
      formData.travelStyle === "luxury" ||
      formData.accommodation === "luxury"

    // Approximate INR warning thresholds.
    if (wantsLuxury && perPersonDailyINR < 8500) {
      const proceed = window.confirm(
        `Your budget is approximately ${formatINR(
          perPersonDailyINR
        )} per person per day. Luxury travel may exceed this budget. Continue anyway?`
      )

      if (!proceed) return
    } else if (perPersonDailyINR < 2100) {
      const proceed = window.confirm(
        `Your budget is approximately ${formatINR(
          perPersonDailyINR
        )} per person per day. This may be insufficient for some destinations. Continue anyway?`
      )

      if (!proceed) return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(
        "/api/generate-itinerary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destination,
            startDate: formData.startDate,
            endDate: formData.endDate,

            // The original user-entered budget is always INR.
            budget,
            budgetCurrency: "INR",

            // Currency metadata for backend itinerary generation.
            currency: {
              country: currencyInfo.country,
              code: currencyInfo.currencyCode,
              name: currencyInfo.currencyName,
              symbol: currencyInfo.currencySymbol,
              exchangeRateINR: currencyInfo.exchangeRate,
              updatedAt: currencyInfo.updatedAt,
              localBudget: convertedBudget,
            },

            groupSize,

            preferences: {
              activities: formData.activities,
              travelStyle: formData.travelStyle,
              accommodation: formData.accommodation,
              specialRequirements:
                formData.specialRequirements,
            },
          }),
        }
      )

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
                <Label htmlFor="destination">
                  Destination
                </Label>

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

                {/* Destination currency lookup status */}
                {isLookingUpCurrency && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Identifying destination currency...
                  </div>
                )}

                {currencyError && !isLookingUpCurrency && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {currencyError}
                  </div>
                )}

                {currencyInfo && (
                  <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                    <div className="flex items-center gap-2 text-cyan-800">
                      <CheckCircle2 className="h-5 w-5" />

                      <span className="font-semibold">
                        Destination currency identified
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-700">
                      <Globe className="h-4 w-4" />

                      <span>
                        {currencyInfo.country}
                      </span>

                      <span className="text-gray-400">•</span>

                      <span className="font-semibold">
                        {currencyInfo.currencyName} ({currencyInfo.currencyCode})
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      Exchange rate:
                      <strong className="ml-1">
                        1 INR = {currencyInfo.exchangeRate.toFixed(4)}{" "}
                        {currencyInfo.currencyCode}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">
                    Start Date
                  </Label>

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
                  <Label htmlFor="endDate">
                    End Date
                  </Label>

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
                <IndianRupee className="h-5 w-5 text-green-600" />
                Budget &amp; Group
              </CardTitle>

              <CardDescription>
                Enter your budget in Indian Rupees. We will automatically
                convert it into your destination's local currency.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">
                    Total Budget (INR ₹)
                  </Label>

                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g., 100000"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        budget: e.target.value,
                      }))
                    }
                    required
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Enter your total trip budget in Indian Rupees.
                  </p>
                </div>

                <div>
                  <Label htmlFor="groupSize">
                    Group Size
                  </Label>

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
                        <SelectItem
                          key={num}
                          value={num.toString()}
                        >
                          {num} {num === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* INR to local currency conversion */}
              {currencyInfo && budgetINR > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-green-800 font-semibold">
                    <ArrowLeftRight className="h-5 w-5" />
                    Your Budget Conversion
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Your budget (India)
                      </p>

                      <p className="text-2xl font-bold text-gray-900">
                        {formatINR(budgetINR)}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Indian Rupee (INR)
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Local destination budget
                      </p>

                      <p className="text-2xl font-bold text-green-700">
                        {formatLocalCurrency(
                          convertedBudget!,
                          currencyInfo.currencyCode
                        )}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {currencyInfo.currencyName} ({currencyInfo.currencyCode})
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-green-800">
                    1 INR = {currencyInfo.exchangeRate.toFixed(4)}{" "}
                    {currencyInfo.currencyCode}
                  </div>

                  <p className="text-xs text-gray-500">
                    Indicative exchange rate. Actual bank and card
                    conversion rates may differ.
                  </p>
                </div>
              )}

              {dailyBudget > 0 && (
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-green-800">
                    <Users className="inline h-4 w-4 mr-1" />
                    Daily Budget:{" "}
                    <strong>
                      {formatINR(dailyBudget)} per person
                    </strong>
                  </p>

                  {convertedDailyBudget !== null && currencyInfo && (
                    <p className="text-sm text-green-800">
                      Local equivalent:{" "}
                      <strong>
                        {formatLocalCurrency(
                          convertedDailyBudget,
                          currencyInfo.currencyCode
                        )} per person
                      </strong>
                    </p>
                  )}
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
                      aria-pressed={
                        formData.travelStyle === style.value
                      }
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
                    const selected =
                      formData.activities.includes(activity)

                    return (
                      <Badge
                        key={activity}
                        variant={selected ? "default" : "outline"}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        className="cursor-pointer hover:bg-cyan-100"
                        onClick={() =>
                          handleActivityToggle(activity)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
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
              disabled={isGenerating || isLookingUpCurrency || !currencyInfo}
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

            {!currencyInfo && formData.destination.trim().length >= 3 && (
              <p className="text-xs text-gray-500 mt-2">
                Waiting for destination currency identification...
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
