import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookies
    const supabase = createServerClient(cookies())

    // Get logged-in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Upsert travel preferences
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          travel_preferences: {
            favorite_activities: body.favorite_activities,
            budget_range: body.budget_range,
            travel_style: body.travel_style,
            accommodation_preference: body.accommodation_preference,
            preferred_destinations: body.preferred_destinations,
            group_size: body.group_size,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" } // update if already exists
      )
      .select()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
