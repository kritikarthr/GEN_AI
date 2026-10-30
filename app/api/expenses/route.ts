
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const VALID_CATEGORIES = [
  "accommodation",
  "food",
  "transportation",
  "activities",
  "shopping",
  "miscellaneous",
]

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { itineraryId, category, amount, description, expenseDate } = body

    // Validate the submitted data
    if (
      typeof itineraryId !== "string" ||
      !itineraryId.trim() ||
      typeof category !== "string" ||
      !VALID_CATEGORIES.includes(category) ||
      amount === "" ||
      amount === null ||
      amount === undefined ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof expenseDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) ||
      Number.isNaN(Date.parse(`${expenseDate}T00:00:00Z`))
    ) {
      return Response.json(
        { error: "Please provide a valid category, positive amount, description, and date." },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Verify the logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      )
    }

    // Verify itinerary ownership
    const { data: itinerary, error: itineraryError } = await supabase
      .from("itineraries")
      .select("id")
      .eq("id", itineraryId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (itineraryError) {
      console.error("Itinerary lookup failed:", itineraryError.message)

      return Response.json(
        { error: "Could not verify the itinerary. Check the server logs." },
        { status: 500 }
      )
    }

    if (!itinerary) {
      return Response.json(
        { error: "Itinerary not found or you do not have access to it." },
        { status: 404 }
      )
    }

    // Save the expense
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        itinerary_id: itineraryId,
        user_id: user.id,
        category,
        amount: Number(amount),
        description: description.trim(),
        expense_date: expenseDate,
      })
      .select()
      .single()

    if (expenseError) {
      console.error("Expense insert failed:", {
        code: expenseError.code,
        message: expenseError.message,
        details: expenseError.details,
        hint: expenseError.hint,
      })

      // Return the actual database error so we can diagnose it.
      return Response.json(
        {
          error: "Could not save expense.",
          details: expenseError.message,
          code: expenseError.code,
        },
        { status: 500 }
      )
    }

    return Response.json({ success: true, expense }, { status: 201 })
  } catch (error) {
    console.error("Expenses API error:", error)

    return Response.json(
      { error: "Unexpected server error while adding the expense." },
      { status: 500 }
    )
  }
}
