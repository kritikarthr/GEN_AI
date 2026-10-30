
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

async function validateDestination(destination: string) {
  const query = destination.trim()

  if (!query || query.length < 2) {
    return {
      valid: false,
      error: "Please enter a valid destination, such as Paris, Tokyo, or Bengaluru.",
    }
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.set("q", query)
    url.searchParams.set("format", "jsonv2")
    url.searchParams.set("limit", "1")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ItineraryAssist/1.0",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        valid: false,
        error:
          "We couldn't verify your destination right now. Please try again shortly.",
      }
    }

    const results = await response.json()

    if (!Array.isArray(results) || results.length === 0) {
      return {
        valid: false,
        error: `We couldn't find "${query}". Please check the spelling or enter a real city, region, or country.`,
      }
    }

    return { valid: true, error: "" }
  } catch (error) {
    console.error("Destination validation failed:", error)

    return {
      valid: false,
      error:
        "We couldn't verify your destination right now. Please check your connection and try again.",
    }
  }
}

export async function POST(request: Request) {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget,
      groupSize,
      preferences,
    } = await request.json()

    // Validate destination input
    if (typeof destination !== "string" || !destination.trim()) {
      return Response.json(
        { success: false, error: "Please enter a destination." },
        { status: 400 }
      )
    }

    // Authenticate user
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized. Please sign in again." },
        { status: 401 }
      )
    }

    // Check whether the destination exists before calling Groq
    const destinationCheck = await validateDestination(destination)

    if (!destinationCheck.valid) {
      return Response.json(
        {
          success: false,
          error: destinationCheck.error,
        },
        { status: 400 }
      )
    }

    // Get user preferences from database
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      duration <= 0
    ) {
      return Response.json(
        {
          success: false,
          error: "Please select valid travel dates. The end date must be after the start date.",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isFinite(Number(budget)) ||
      Number(budget) <= 0 ||
      !Number.isFinite(Number(groupSize)) ||
      Number(groupSize) < 1
    ) {
      return Response.json(
        {
          success: false,
          error: "Please enter a valid budget and group size.",
        },
        { status: 400 }
      )
    }

    const seasonalContext = `
IMPORTANT SEASONAL CONTEXT for ${destination} in ${start.toLocaleDateString(
      "en-US",
      { month: "long" }
    )}:
- Analyze the specific weather patterns, temperature ranges, and precipitation for this destination and time of year.
- Consider local seasonal events, festivals, and cultural celebrations.
- Account for tourist seasons and how they affect pricing and crowds.
- Identify seasonal activities that are particularly good or should be avoided.
- Consider daylight hours and how they affect daily scheduling.
- Factor in seasonal closures and changes in operating hours.
- Consider region-specific conditions such as monsoons, hurricanes, or winter weather.
`

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${duration} days)
- Budget: $${budget} USD total
- Group Size: ${groupSize} people
- Budget per person per day: $${Math.round(
      Number(budget) / Number(groupSize) / duration
    )}

User Preferences:
- Favorite Activities: ${preferences?.activities?.join(", ") || userProfile?.favorite_activities?.join(", ") || "General sightseeing"}
- Travel Style: ${preferences?.travelStyle || userProfile?.travel_style || "Balanced"}
- Accommodation Type: ${preferences?.accommodation || userProfile?.accommodation_preference || "Mid-range hotels"}
- Languages: ${userProfile?.languages?.join(", ") || "English"}
- Special Requirements: ${preferences?.specialRequirements || userProfile?.special_requirements || "None"}

${seasonalContext}

Please create a comprehensive itinerary that includes:

1. Daily Schedule with morning, afternoon, and evening activities, specific times, and estimated costs.
2. Accommodation Recommendations with suggested lodging and estimated rates.
3. Transportation options and estimated costs.
4. Food and Dining recommendations, local specialties, and estimated food costs.
5. Budget Breakdown for accommodation, activities, food, transportation, and miscellaneous expenses. Keep estimates consistent with the total budget.
6. Seasonal Considerations, expected weather, packing advice, seasonal activities, and possible closures.
7. Safety and Practical Tips, including local customs, safety considerations, emergency contacts, currency, payment methods, and seasonal health considerations.

Format the response as a well-structured itinerary. Include specific venue names, addresses when possible, and realistic time estimates. Do not claim that weather, opening hours, prices, or events have been verified in real time unless they actually have been.`

    // Generate itinerary using Groq
    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      prompt,
      maxOutputTokens: 4000,
    })

    // Save itinerary to database
    const { data: itinerary, error: saveError } = await supabase
      .from("itineraries")
      .insert({
        user_id: user.id,
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        budget,
        group_size: groupSize,
        preferences,
        content: text,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving itinerary:", saveError)

      return Response.json(
        { success: false, error: "Failed to save itinerary. Please try again." },
        { status: 500 }
      )
    }

    return Response.json({
      itinerary: text,
      id: itinerary.id,
      success: true,
    })
  } catch (error) {
    console.error("Error generating itinerary:", error)

    return Response.json(
      {
        success: false,
        error: "Something went wrong while generating your itinerary. Please try again.",
      },
      { status: 500 }
    )
  }
}
