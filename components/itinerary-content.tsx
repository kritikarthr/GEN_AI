"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, DollarSign, Utensils, Car, Bed, Camera, CheckCircle, Circle, Star } from "lucide-react"

interface ItineraryContentProps {
  content: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  groupSize: number
}

interface DayActivity {
  time: string
  activity: string
  location?: string
  cost?: string
  description?: string
  type: "morning" | "afternoon" | "evening"
}

interface DayPlan {
  day: number
  date: string
  activities: DayActivity[]
  totalCost?: string
}

export function ItineraryContent({
  content,
  destination,
  startDate,
  endDate,
  budget,
  groupSize,
}: ItineraryContentProps) {
  const [checkedActivities, setCheckedActivities] = useState<Set<string>>(new Set())
  const [activeView, setActiveView] = useState<"timeline" | "overview" | "budget">("timeline")

  // Parse the AI-generated content into structured data
  const parseItinerary = (content: string): DayPlan[] => {
    const days: DayPlan[] = []
    const lines = content.split("\n")
    let currentDay: DayPlan | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Detect day headers (Day 1, Day 2, etc.)
      const dayMatch = line.match(/^Day (\d+)/i)
      if (dayMatch) {
        if (currentDay) {
          days.push(currentDay)
        }
        const dayNumber = Number.parseInt(dayMatch[1])
        const dayDate = new Date(startDate)
        dayDate.setDate(dayDate.getDate() + dayNumber - 1)

        currentDay = {
          day: dayNumber,
          date: dayDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          activities: [],
        }
        continue
      }

      // Parse activities with time patterns
      const timeMatch = line.match(/^(\d{1,2}:\d{2}|\d{1,2}\s*(?:AM|PM)|Morning|Afternoon|Evening)[\s\-:]*(.+)/i)
      if (timeMatch && currentDay) {
        const time = timeMatch[1]
        const activity = timeMatch[2]

        // Determine activity type
        let type: "morning" | "afternoon" | "evening" = "morning"
        if (time.toLowerCase().includes("afternoon") || time.includes("PM")) {
          type = "afternoon"
        } else if (time.toLowerCase().includes("evening") || Number.parseInt(time.split(":")[0]) >= 18) {
          type = "evening"
        }

        // Extract cost if present
        const costMatch = activity.match(/\$(\d+(?:\.\d{2})?)/)
        const cost = costMatch ? `$${costMatch[1]}` : undefined

        currentDay.activities.push({
          time,
          activity: activity.replace(/\$\d+(?:\.\d{2})?/g, "").trim(),
          cost,
          type,
        })
      }
    }

    if (currentDay) {
      days.push(currentDay)
    }

    return days
  }

  // Extract budget breakdown from content
  const extractBudgetBreakdown = (content: string) => {
    const budgetSection = content.match(/Budget Breakdown:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i)
    if (!budgetSection) return null

    const categories = [
      { name: "Accommodation", pattern: /Accommodation:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, icon: Bed },
      { name: "Activities", pattern: /Activities:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, icon: Camera },
      { name: "Food", pattern: /Food:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, icon: Utensils },
      { name: "Transportation", pattern: /Transportation:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, icon: Car },
      { name: "Miscellaneous", pattern: /Miscellaneous:\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i, icon: DollarSign },
    ]

    return categories
      .map((category) => {
        const match = budgetSection[0].match(category.pattern)
        return {
          ...category,
          amount: match ? Number.parseFloat(match[1].replace(/,/g, "")) : 0,
        }
      })
      .filter((cat) => cat.amount > 0)
  }

  const toggleActivity = (activityId: string) => {
    const newChecked = new Set(checkedActivities)
    if (newChecked.has(activityId)) {
      newChecked.delete(activityId)
    } else {
      newChecked.add(activityId)
    }
    setCheckedActivities(newChecked)
  }

  const dayPlans = parseItinerary(content)
  const budgetBreakdown = extractBudgetBreakdown(content)

  const getTimeIcon = (type: "morning" | "afternoon" | "evening") => {
    switch (type) {
      case "morning":
        return "🌅"
      case "afternoon":
        return "☀️"
      case "evening":
        return "🌙"
    }
  }

  const getTypeColor = (type: "morning" | "afternoon" | "evening") => {
    switch (type) {
      case "morning":
        return "bg-yellow-100 text-yellow-800"
      case "afternoon":
        return "bg-blue-100 text-blue-800"
      case "evening":
        return "bg-purple-100 text-purple-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Daily Timeline</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget Details</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {dayPlans.length > 0 ? (
            dayPlans.map((day) => (
              <Card key={day.day} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span>Day {day.day}</span>
                    <Badge variant="secondary" className="bg-white text-cyan-600">
                      {day.date}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {day.activities.length > 0 ? (
                    <div className="divide-y">
                      {day.activities.map((activity, index) => {
                        const activityId = `${day.day}-${index}`
                        const isChecked = checkedActivities.has(activityId)

                        return (
                          <div
                            key={index}
                            className={`p-4 hover:bg-gray-50 transition-colors ${isChecked ? "bg-green-50" : ""}`}
                          >
                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => toggleActivity(activityId)}
                                className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                {isChecked ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getTypeColor(activity.type)}>
                                    {getTimeIcon(activity.type)} {activity.time}
                                  </Badge>
                                  {activity.cost && (
                                    <Badge variant="outline" className="text-green-600">
                                      {activity.cost}
                                    </Badge>
                                  )}
                                </div>

                                <h4
                                  className={`font-medium ${isChecked ? "line-through text-gray-500" : "text-gray-900"}`}
                                >
                                  {activity.activity}
                                </h4>

                                {activity.location && (
                                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3" />
                                    {activity.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">No activities planned for this day</div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-4">Unable to parse daily activities from the itinerary.</p>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-left">{content}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Trip Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-600" />
                    <span className="text-sm">Exploring {destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{dayPlans.length} days of adventure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">${Math.round(budget / groupSize)} per person</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Progress Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Activities Completed</span>
                    <span className="font-medium">
                      {checkedActivities.size} / {dayPlans.reduce((total, day) => total + day.activities.length, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          dayPlans.reduce((total, day) => total + day.activities.length, 0) > 0
                            ? (
                                checkedActivities.size /
                                  dayPlans.reduce((total, day) => total + day.activities.length, 0)
                              ) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">Check off activities as you complete them!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Content Fallback */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Itinerary Details</CardTitle>
              <CardDescription>Full AI-generated recommendations and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{content}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {budgetBreakdown && budgetBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetBreakdown.map((category) => {
                const Icon = category.icon
                const percentage = budget > 0 ? (category.amount / budget) * 100 : 0

                return (
                  <Card key={category.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-lg font-bold">${category.amount.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Percentage of budget</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Budget breakdown not available in structured format.</p>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-left">{content}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
