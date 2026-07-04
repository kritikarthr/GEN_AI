import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})
export async function POST(request: Request) {
  console.log("TYPE:", typeof process.env.GROQ_API_KEY)
  console.log("VALUE:", process.env.GROQ_API_KEY)
  console.log("TEST:", process.env.TEST_VARIABLE)
  try {
    const { destination, startDate, endDate, budget, groupSize, preferences } = await request.json()

    // Get user from Supabase
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user preferences from database
    const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const month = start.getMonth() + 1
    const seasonalContext = `

IMPORTANT SEASONAL CONTEXT for ${destination} in ${start.toLocaleDateString("en-US", { month: "long" })}:
- Analyze the specific weather patterns, temperature ranges, and precipitation for this destination and time of year
- Consider local seasonal events, festivals, and cultural celebrations happening during this period
- Account for tourist season patterns (peak/off-peak) and how they affect pricing and crowds
- Identify seasonal activities that are particularly good or should be avoided during this time
- Consider daylight hours and how they affect daily scheduling
- Factor in any seasonal closures of attractions or changes in operating hours
- Include region-specific seasonal considerations (monsoons, hurricane seasons, winter conditions, etc.)
    `

    // Create comprehensive prompt for AI
    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination}.

Trip Details:
- Destination: ${destination}
- Dates: ${startDate} to ${endDate} (${duration} days)
- Budget: $${budget} USD total
- Group Size: ${groupSize} people
- Budget per person per day: $${Math.round(budget / groupSize / duration)}

User Preferences:
- Favorite Activities: ${preferences.activities?.join(", ") || userProfile?.favorite_activities?.join(", ") || "General sightseeing"}
- Travel Style: ${preferences.travelStyle || userProfile?.travel_style || "Balanced"}
- Accommodation Type: ${preferences.accommodation || userProfile?.accommodation_preference || "Mid-range hotels"}
- Languages: ${userProfile?.languages?.join(", ") || "English"}
- Special Requirements: ${preferences.specialRequirements || userProfile?.special_requirements || "None"}

${seasonalContext}

Please create a comprehensive itinerary that includes:

1. **Daily Schedule** (Day 1, Day 2, etc.):
   - Morning activities with specific times
   - Afternoon activities with specific times  
   - Evening activities with specific times
   - Estimated costs for each activity

2. **Accommodation Recommendations**:
   - Specific hotel/lodging suggestions within budget
   - Nightly rates and total accommodation cost

3. **Transportation**:
   - How to get around the city/region
   - Estimated transportation costs

4. **Food & Dining**:
   - Restaurant recommendations for each meal
   - Local specialties to try
   - Estimated food costs per day

5. **Budget Breakdown**:
   - Accommodation: $X
   - Activities: $X
   - Food: $X
   - Transportation: $X
   - Miscellaneous: $X
   - Total: $${budget}

6. **Detailed Seasonal Considerations**:
   - Specific weather expectations for ${startDate} to ${endDate}
   - Detailed packing recommendations based on local climate
   - Seasonal activities and events happening during your visit
   - Best times of day for outdoor activities considering weather
   - Any seasonal closures or limited hours for attractions
   - Local seasonal specialties (food, festivals, natural phenomena)

7. **Safety & Practical Tips**:
   - Important local customs
   - Safety considerations
   - Emergency contacts
   - Currency and payment methods
   - Seasonal health considerations (sun protection, hydration, etc.)

Format the response as a well-structured itinerary that's easy to read and follow. Include specific venue names, addresses when possible, and realistic time estimates. Pay special attention to seasonal factors that could significantly impact the travel experience.`

    // Generate itinerary using updated Groq model
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"), // ← updated model
      prompt,
      maxTokens: 4000,
    })

    // Save itinerary to database
    const { data: itinerary, error: saveError } = await supabase
      .from("itineraries")
      .insert({
        user_id: user.id,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget,
        group_size: groupSize,
        preferences: preferences,
        content: text,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving itinerary:", saveError)
      return Response.json({ error: "Failed to save itinerary" }, { status: 500 })
    }

    return Response.json({
      itinerary: text,
      id: itinerary.id,
      success: true,
    })
  } catch (error) {
    console.error("Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
