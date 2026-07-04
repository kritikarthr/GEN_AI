"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  Wind,
  Umbrella,
  Shirt,
  Backpack,
  Camera,
  AlertTriangle,
  Info,
} from "lucide-react"

interface SeasonalRecommendationsProps {
  destination: string
  startDate: string
  endDate: string
}

interface SeasonalData {
  season: string
  weather: {
    temperature: string
    conditions: string
    rainfall: string
    icon: React.ComponentType<any>
  }
  activities: {
    recommended: string[]
    avoid: string[]
  }
  packing: {
    essentials: string[]
    optional: string[]
  }
  tips: string[]
  alerts: string[]
}

export function SeasonalRecommendations({ destination, startDate, endDate }: SeasonalRecommendationsProps) {
  const getSeasonalData = (destination: string, date: string): SeasonalData => {
    const month = new Date(date).getMonth() + 1
    const destinationLower = destination.toLowerCase()

    // Determine hemisphere and season
    const isNorthernHemisphere =
      !destinationLower.includes("australia") &&
      !destinationLower.includes("new zealand") &&
      !destinationLower.includes("argentina") &&
      !destinationLower.includes("chile") &&
      !destinationLower.includes("south africa")

    let season: string
    if (isNorthernHemisphere) {
      if (month >= 3 && month <= 5) season = "Spring"
      else if (month >= 6 && month <= 8) season = "Summer"
      else if (month >= 9 && month <= 11) season = "Fall"
      else season = "Winter"
    } else {
      if (month >= 3 && month <= 5) season = "Fall"
      else if (month >= 6 && month <= 8) season = "Winter"
      else if (month >= 9 && month <= 11) season = "Spring"
      else season = "Summer"
    }

    // Get region-specific data
    if (
      destinationLower.includes("europe") ||
      destinationLower.includes("paris") ||
      destinationLower.includes("london") ||
      destinationLower.includes("rome")
    ) {
      return getEuropeSeasonalData(season, month)
    } else if (
      destinationLower.includes("asia") ||
      destinationLower.includes("japan") ||
      destinationLower.includes("thailand") ||
      destinationLower.includes("india")
    ) {
      return getAsiaSeasonalData(season, month)
    } else if (
      destinationLower.includes("tropical") ||
      destinationLower.includes("caribbean") ||
      destinationLower.includes("hawaii")
    ) {
      return getTropicalSeasonalData(season, month)
    } else {
      return getGeneralSeasonalData(season, month)
    }
  }

  const getEuropeSeasonalData = (season: string, month: number): SeasonalData => {
    switch (season) {
      case "Spring":
        return {
          season: "Spring",
          weather: {
            temperature: "10-18°C (50-65°F)",
            conditions: "Mild with occasional rain",
            rainfall: "Moderate",
            icon: Cloud,
          },
          activities: {
            recommended: ["City walking tours", "Museum visits", "Garden tours", "Outdoor cafes", "Photography"],
            avoid: ["Beach activities", "Outdoor swimming", "Heavy hiking"],
          },
          packing: {
            essentials: ["Light jacket", "Umbrella", "Comfortable walking shoes", "Layers"],
            optional: ["Light sweater", "Scarf", "Waterproof jacket"],
          },
          tips: [
            "Book accommodations early as spring is popular",
            "Pack layers for changing weather",
            "Many attractions have shorter queues than summer",
          ],
          alerts: ["Variable weather - check forecasts daily"],
        }
      case "Summer":
        return {
          season: "Summer",
          weather: {
            temperature: "20-28°C (68-82°F)",
            conditions: "Warm and generally sunny",
            rainfall: "Low to moderate",
            icon: Sun,
          },
          activities: {
            recommended: ["Outdoor festivals", "Beach visits", "Hiking", "Outdoor dining", "Sightseeing"],
            avoid: ["Indoor activities during peak hours"],
          },
          packing: {
            essentials: ["Sunscreen", "Sunglasses", "Light clothing", "Comfortable sandals"],
            optional: ["Hat", "Light cardigan for evenings", "Swimwear"],
          },
          tips: [
            "Book everything well in advance - peak season",
            "Start sightseeing early to avoid crowds",
            "Stay hydrated and take breaks in shade",
          ],
          alerts: ["Peak tourist season - expect crowds and higher prices"],
        }
      case "Fall":
        return {
          season: "Fall",
          weather: {
            temperature: "8-16°C (46-61°F)",
            conditions: "Cool with increasing rain",
            rainfall: "Moderate to high",
            icon: CloudRain,
          },
          activities: {
            recommended: ["Museum visits", "Indoor attractions", "Food tours", "Cultural events"],
            avoid: ["Outdoor picnics", "Beach activities"],
          },
          packing: {
            essentials: ["Warm jacket", "Waterproof shoes", "Umbrella", "Warm layers"],
            optional: ["Gloves", "Warm hat", "Thermal underwear"],
          },
          tips: [
            "Great time for indoor cultural activities",
            "Fewer crowds than summer",
            "Check opening hours - some attractions have reduced schedules",
          ],
          alerts: ["Increasing rainfall - pack waterproof gear"],
        }
      default: // Winter
        return {
          season: "Winter",
          weather: {
            temperature: "2-8°C (36-46°F)",
            conditions: "Cold with possible snow",
            rainfall: "Low, but snow possible",
            icon: Snowflake,
          },
          activities: {
            recommended: ["Christmas markets", "Museums", "Indoor attractions", "Cozy cafes", "Winter festivals"],
            avoid: ["Outdoor swimming", "Long outdoor walks", "Beach activities"],
          },
          packing: {
            essentials: ["Heavy coat", "Warm boots", "Gloves", "Warm hat", "Thermal layers"],
            optional: ["Scarf", "Hand warmers", "Waterproof gloves"],
          },
          tips: [
            "Many outdoor attractions may be closed",
            "Shorter daylight hours - plan accordingly",
            "Great time for indoor cultural experiences",
          ],
          alerts: ["Cold weather - dress warmly", "Some attractions may have limited hours"],
        }
    }
  }

  const getAsiaSeasonalData = (season: string, month: number): SeasonalData => {
    // Simplified Asia data - in reality this would be much more region-specific
    if (month >= 6 && month <= 9) {
      return {
        season: "Monsoon Season",
        weather: {
          temperature: "25-32°C (77-90°F)",
          conditions: "Hot and humid with heavy rain",
          rainfall: "Very high",
          icon: CloudRain,
        },
        activities: {
          recommended: ["Indoor attractions", "Covered markets", "Temples", "Museums"],
          avoid: ["Outdoor trekking", "Beach activities", "Street food tours"],
        },
        packing: {
          essentials: ["Waterproof jacket", "Quick-dry clothes", "Waterproof bag", "Umbrella"],
          optional: ["Rain boots", "Waterproof phone case"],
        },
        tips: [
          "Plan indoor activities during heavy rain periods",
          "Book covered transportation",
          "Keep electronics in waterproof bags",
        ],
        alerts: ["Monsoon season - expect heavy rainfall and flooding"],
      }
    }

    return getGeneralSeasonalData(season, month)
  }

  const getTropicalSeasonalData = (season: string, month: number): SeasonalData => {
    const isDrySeasonNorth = month >= 11 || month <= 4

    return {
      season: isDrySeasonNorth ? "Dry Season" : "Wet Season",
      weather: {
        temperature: "24-30°C (75-86°F)",
        conditions: isDrySeasonNorth ? "Warm and sunny" : "Hot and humid with rain",
        rainfall: isDrySeasonNorth ? "Low" : "High",
        icon: isDrySeasonNorth ? Sun : CloudRain,
      },
      activities: {
        recommended: isDrySeasonNorth
          ? ["Beach activities", "Water sports", "Hiking", "Outdoor dining"]
          : ["Indoor attractions", "Covered activities", "Spa treatments"],
        avoid: isDrySeasonNorth
          ? ["Indoor activities during peak sun"]
          : ["Outdoor hiking", "Beach activities during storms"],
      },
      packing: {
        essentials: isDrySeasonNorth
          ? ["Sunscreen", "Swimwear", "Light clothing", "Sandals"]
          : ["Waterproof jacket", "Quick-dry clothes", "Umbrella"],
        optional: isDrySeasonNorth ? ["Hat", "Reef-safe sunscreen", "Beach towel"] : ["Rain boots", "Waterproof bag"],
      },
      tips: isDrySeasonNorth
        ? ["Perfect weather for outdoor activities", "Book water activities in advance"]
        : ["Plan flexible indoor alternatives", "Rain usually comes in short bursts"],
      alerts: isDrySeasonNorth ? ["Peak season - book early"] : ["Wet season - expect afternoon storms"],
    }
  }

  const getGeneralSeasonalData = (season: string, month: number): SeasonalData => {
    // Default seasonal data
    return {
      season,
      weather: {
        temperature: "Variable",
        conditions: "Check local weather forecast",
        rainfall: "Variable",
        icon: Cloud,
      },
      activities: {
        recommended: ["Research local seasonal activities", "Check weather-dependent attractions"],
        avoid: ["Plan flexible alternatives for weather changes"],
      },
      packing: {
        essentials: ["Weather-appropriate clothing", "Comfortable shoes", "Layers"],
        optional: ["Umbrella", "Light jacket"],
      },
      tips: [
        "Research local weather patterns for your specific destination",
        "Pack versatile clothing for changing conditions",
        "Check local events and seasonal attractions",
      ],
      alerts: ["Check local weather forecasts before departure"],
    }
  }

  const seasonalData = getSeasonalData(destination, startDate)
  const WeatherIcon = seasonalData.weather.icon

  return (
    <div className="space-y-6">
      {/* Weather Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WeatherIcon className="h-5 w-5 text-blue-600" />
            {seasonalData.season} Weather in {destination}
          </CardTitle>
          <CardDescription>Weather conditions and what to expect during your visit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="font-medium">{seasonalData.weather.temperature}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Conditions</p>
                <p className="font-medium">{seasonalData.weather.conditions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Umbrella className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Rainfall</p>
                <p className="font-medium">{seasonalData.weather.rainfall}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {seasonalData.alerts.length > 0 && (
        <div className="space-y-2">
          {seasonalData.alerts.map((alert, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Camera className="h-5 w-5" />
              Recommended Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seasonalData.activities.recommended.map((activity, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2">
                  {activity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Activities to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seasonalData.activities.avoid.map((activity, index) => (
                <Badge key={index} variant="outline" className="mr-2 mb-2">
                  {activity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packing Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Backpack className="h-5 w-5 text-blue-600" />
              Essential Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seasonalData.packing.essentials.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5 text-gray-600" />
              Optional Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {seasonalData.packing.optional.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-cyan-600" />
            Seasonal Travel Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {seasonalData.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
