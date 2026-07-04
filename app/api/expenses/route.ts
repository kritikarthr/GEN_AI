import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { itineraryId, category, amount, description, expenseDate } = await request.json()

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", itineraryId)
      .eq("user_id", user.id)
      .single()

    if (itineraryError || !itinerary) {
      return Response.json({ error: "Itinerary not found" }, { status: 404 })
    }

    // Add expense
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        itinerary_id: itineraryId,
        user_id: user.id,
        category,
        amount,
        description,
        expense_date: expenseDate,
      })
      .select()
      .single()

    if (expenseError) {
      console.error("Error adding expense:", expenseError)
      return Response.json({ error: "Failed to add expense" }, { status: 500 })
    }

    return Response.json({ expense, success: true })
  } catch (error) {
    console.error("Error in expenses API:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
