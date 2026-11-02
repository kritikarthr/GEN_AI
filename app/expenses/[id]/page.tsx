
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Receipt } from "lucide-react"
import { ExpenseList } from "@/components/expense-list"

interface ExpensesPageProps {
  params: {
    id: string
  }
}

export default async function ExpensesPage({
  params,
}: ExpensesPageProps) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch itinerary
  const { data: itinerary, error: itineraryError } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (itineraryError || !itinerary) {
    notFound()
  }

  // Fetch all expenses for this itinerary
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("*")
    .eq("itinerary_id", params.id)
    .order("expense_date", { ascending: false })

  if (expensesError) {
    console.error("Error fetching expenses:", expensesError)
  }

  // Currency information
  const currencyCode = itinerary.currency_code || "INR"
  const currencySymbol = itinerary.currency_symbol || "₹"
  const exchangeRateInr = Number(itinerary.exchange_rate_inr) || 1

  // Calculate total spending
  const totalSpentLocal =
    expenses?.reduce(
      (sum, expense) => sum + (Number(expense.amount) || 0),
      0
    ) || 0

  const totalSpentInr =
    exchangeRateInr > 0
      ? totalSpentLocal / exchangeRateInr
      : totalSpentLocal

  const formatLocal = (amount: number) => {
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currencySymbol}${amount.toLocaleString("en-IN")}`
    }
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">

        {/* Header */}
        <div className="mb-8">
          <Link href={`/budget/${params.id}`}>
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Budget Manager
            </Button>
          </Link>

          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            All Expenses
          </h1>

          <p className="text-xl text-gray-600">
            {itinerary.destination}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Expenses are recorded in {currencyCode}.
            INR equivalents are shown for reference.
          </p>
        </div>

        {/* Total Spending */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Total Expenses
            </CardTitle>
            <CardDescription>
              Your total spending for this itinerary
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatLocal(totalSpentLocal)}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {formatINR(totalSpentInr)}
            </p>

            <p className="mt-3 text-sm text-gray-500">
              {expenses?.length || 0} expense
              {(expenses?.length || 0) === 1 ? "" : "s"} recorded
            </p>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>
              All your expenses, arranged from newest to oldest
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ExpenseList
              expenses={expenses || []}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              exchangeRateInr={exchangeRateInr}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
