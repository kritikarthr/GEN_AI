import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Receipt,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"

interface BudgetPageProps {
  params: {
    id: string
  }
}

export default async function BudgetPage({ params }: BudgetPageProps) {
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

  // Fetch expenses
  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("itinerary_id", params.id)
    .order("expense_date", { ascending: false })

  // Currency information saved with the itinerary
  const currencyCode = itinerary.currency_code || "INR"
  const currencySymbol = itinerary.currency_symbol || "₹"
  const currencyName = itinerary.currency_name || "Indian Rupee"

  // Exchange rate: local currency received for ₹1
  const exchangeRateInr = Number(itinerary.exchange_rate_inr) || 1

  // Calculate total additional expenses
  const totalSpentLocal =
    expenses?.reduce(
      (sum, expense) => sum + (Number(expense.amount) || 0),
      0,
    ) || 0

  const totalSpentInr =
    exchangeRateInr > 0
      ? totalSpentLocal / exchangeRateInr
      : totalSpentLocal

  // Format local currency
  const formatLocal = (amount: number) => {
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      return `${currencySymbol}${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`
    }
  }

  // Format INR
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate category spending
  const categorySpending =
    expenses?.reduce(
      (acc, expense) => {
        acc[expense.category] =
          (acc[expense.category] || 0) +
          (Number(expense.amount) || 0)

        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const categories = [
    { key: "accommodation", label: "Accommodation", color: "bg-blue-500" },
    { key: "food", label: "Food & Dining", color: "bg-green-500" },
    {
      key: "transportation",
      label: "Transportation",
      color: "bg-yellow-500",
    },
    { key: "activities", label: "Activities", color: "bg-purple-500" },
    { key: "shopping", label: "Shopping", color: "bg-pink-500" },
    { key: "miscellaneous", label: "Miscellaneous", color: "bg-gray-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/itinerary/${params.id}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Itinerary
              </Button>
            </Link>

            <AddExpenseForm
              itineraryId={params.id}
              currencyCode={currencyCode}
              currencySymbol={currencySymbol}
              exchangeRateInr={exchangeRateInr}
            />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Budget Manager
          </h1>

          <p className="text-xl text-gray-600">
            {itinerary.destination} • Track your additional expenses
          </p>

          <p className="text-sm text-gray-500 mt-2">
            All expenses are recorded in {currencyName} ({currencyCode}).
            INR equivalents are shown for reference.
          </p>
        </div>

        {/* Total Additional Expenses */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    Total Additional Expenses
                  </p>

                  <p className="text-3xl font-bold text-gray-900">
                    {formatLocal(totalSpentLocal)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatINR(totalSpentInr)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown & Recent Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Category Spending */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                See how your additional expenses are distributed
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const spentLocal =
                    categorySpending[category.key] || 0

                  const spentInr =
                    exchangeRateInr > 0
                      ? spentLocal / exchangeRateInr
                      : spentLocal

                  const percentage =
                    totalSpentLocal > 0
                      ? (spentLocal / totalSpentLocal) * 100
                      : 0

                  return (
                    <div key={category.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          />

                          <span className="text-sm font-medium">
                            {category.label}
                          </span>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            {formatLocal(spentLocal)}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatINR(spentInr)} (
                            {percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>

                      <Progress
                        value={percentage}
                        className="h-2"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>
                    Your latest additional expenses
                  </CardDescription>
                </div>

                <Link href={`/expenses/${params.id}`}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              <ExpenseList
                expenses={expenses?.slice(0, 5) || []}
                currencyCode={currencyCode}
                currencySymbol={currencySymbol}
                exchangeRateInr={exchangeRateInr}
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}