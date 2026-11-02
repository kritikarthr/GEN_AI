import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { createServerClient } from "@/lib/supabase/server"
import { getDestinationCurrency, convertInrToLocal } from "@/lib/currency"
import { cookies } from "next/headers"

export const runtime = "nodejs"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

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

    if (typeof destination !== "string" || !destination.trim()) {
      return Response.json(
        { success: false, error: "Please enter a destination." },
        { status: 400 }
      )
    }

    const budgetInr = Number(budget)
    const numberOfPeople = Number(groupSize)

    if (
      !Number.isFinite(budgetInr) ||
      budgetInr <= 0 ||
      !Number.isInteger(numberOfPeople) ||
      numberOfPeople < 1 ||
      numberOfPeople > 8
    ) {
      return Response.json(
        {
          success: false,
          error: "Please enter a valid INR budget and group size.",
        },
        { status: 400 }
      )
    }

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
          error:
            "Please select valid travel dates. The end date must be after the start date.",
        },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized. Please sign in again.",
        },
        { status: 401 }
      )
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Identify the destination's official currency.
    const currency = await getDestinationCurrency(destination)

    // Convert the user's INR budget into the destination currency.
    const localBudget = convertInrToLocal(
      budgetInr,
      currency.exchangeRateInr
    )

    const localDailyBudgetPerPerson = convertInrToLocal(
      budgetInr / numberOfPeople / duration,
      currency.exchangeRateInr
    )

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

TRIP AND CURRENCY DETAILS:
- Destination: ${destination}
- Destination country: ${currency.country}
- Dates: ${startDate} to ${endDate} (${duration} days)
- Group size: ${numberOfPeople} people
- User's original total budget: INR ${budgetInr.toFixed(2)}
- Converted total budget: ${currency.currencyCode} ${localBudget.toFixed(2)}
- Destination currency: ${currency.currencyName} (${currency.currencyCode}, symbol ${currency.currencySymbol})
- Reference exchange rate: 1 INR = ${currency.exchangeRateInr} ${currency.currencyCode}
- Converted daily budget per person: ${currency.currencyCode} ${localDailyBudgetPerPerson.toFixed(2)}

CURRENCY RULES (IMPORTANT):
- All accommodation prices, activity costs, food costs, transport fares, shopping estimates, daily totals, and budget breakdown figures MUST be expressed in ${currency.currencyCode} (${currency.currencySymbol}).
- Do not use USD or the dollar sign unless the destination's official currency is USD.
- Do not invent or switch to another currency.
- Keep the overall trip estimate within the converted budget of ${currency.currencyCode} ${localBudget.toFixed(2)} where reasonably possible. If the budget is insufficient, clearly explain the shortfall instead of pretending the plan fits.
- At the end of each day's schedule, include a clearly labelled estimated daily total in ${currency.currencyCode}.
- At the end of each day's schedule, also show an approximate INR equivalent using the supplied exchange rate. Use the rate above; do not make up a different rate.
- In the final budget summary, show the estimated trip total in ${currency.currencyCode} and its approximate INR equivalent.
- Treat the exchange rate as a planning reference. Actual card/bank rates and fees may differ.

User Preferences:
- Favorite Activities: ${preferences?.activities?.join(", ") || userProfile?.favorite_activities?.join(", ") || "General sightseeing"}
- Travel Style: ${preferences?.travelStyle || userProfile?.travel_style || "Balanced"}
- Accommodation Type: ${preferences?.accommodation || userProfile?.accommodation_preference || "Mid-range hotels"}
- Languages: ${userProfile?.languages?.join(", ") || "English"}
- Special Requirements: ${preferences?.specialRequirements || userProfile?.special_requirements || "None"}

${seasonalContext}

Please create a comprehensive itinerary that includes:
1. Daily schedule with morning, afternoon, and evening activities, specific times, and estimated costs.
2. Accommodation recommendations with suggested lodging and estimated rates.
3. Transportation options and estimated costs.
4. Food and dining recommendations, local specialties, and estimated food costs.
5. Budget breakdown for accommodation, activities, food, transportation, and miscellaneous expenses. Keep estimates consistent with the total budget.
6. Seasonal considerations, expected weather, packing advice, seasonal activities, and possible closures.
7. Safety and practical tips, including local customs, safety considerations, emergency contacts, local currency, payment methods, and seasonal health considerations.

Format the response as a well-structured itinerary. Include specific venue names, addresses when possible, and realistic time estimates. Do not claim that weather, opening hours, prices, or events have been verified in real time unless they actually have been. Clearly label all costs as estimates.`

    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      prompt,
      maxOutputTokens: 5000,
    })

    const { data: itinerary, error: saveError } = await supabase
      .from("itineraries")
      .insert({
        user_id: user.id,
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        budget: budgetInr,
        group_size: numberOfPeople,
        preferences,
        content: text,
        currency_country: currency.country,
        currency_code: currency.currencyCode,
        currency_name: currency.currencyName,
        currency_symbol: currency.currencySymbol,
        exchange_rate_inr: currency.exchangeRateInr,
        exchange_rate_updated_at: currency.exchangeRateUpdatedAt,
        budget_inr: budgetInr,
        local_budget: localBudget,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving itinerary:", saveError)

      return Response.json(
        {
          success: false,
          error: "Failed to save itinerary. Please try again.",
        },
        { status: 500 }
      )
    }

    return Response.json({
      itinerary: text,
      id: itinerary.id,
      success: true,
      currency: {
        country: currency.country,
        code: currency.currencyCode,
        name: currency.currencyName,
        symbol: currency.currencySymbol,
        exchangeRateInr: currency.exchangeRateInr,
        exchangeRateUpdatedAt: currency.exchangeRateUpdatedAt,
        budgetInr,
        localBudget,
      },
    })
  } catch (error) {
    console.error("Error generating itinerary:", error)

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating your itinerary. Please try again.",
      },
      { status: 500 }
    )
  }
}