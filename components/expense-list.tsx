
import { Badge } from "@/components/ui/badge"
import { Receipt, Calendar } from "lucide-react"

interface Expense {
  id: string
  category: string
  amount: string | number
  description: string
  expense_date: string
  created_at: string
}

interface ExpenseListProps {
  expenses: Expense[]
  currencyCode?: string
  currencySymbol?: string
  exchangeRateInr?: number
}

const categoryColors = {
  accommodation: "bg-blue-100 text-blue-800",
  food: "bg-green-100 text-green-800",
  transportation: "bg-yellow-100 text-yellow-800",
  activities: "bg-purple-100 text-purple-800",
  shopping: "bg-pink-100 text-pink-800",
  miscellaneous: "bg-gray-100 text-gray-800",
}

const categoryLabels = {
  accommodation: "Accommodation",
  food: "Food & Dining",
  transportation: "Transportation",
  activities: "Activities",
  shopping: "Shopping",
  miscellaneous: "Miscellaneous",
}

export function ExpenseList({
  expenses,
  currencyCode = "INR",
  currencySymbol = "₹",
  exchangeRateInr = 1,
}: ExpenseListProps) {
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

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No expenses recorded yet</p>
        <p className="text-sm text-gray-500">
          Start tracking your spending by adding your first expense
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const localAmount = Number(expense.amount) || 0

        // Exchange rate represents local currency received for ₹1
        const inrAmount =
          exchangeRateInr > 0
            ? localAmount / exchangeRateInr
            : localAmount

        const categoryKey =
          expense.category as keyof typeof categoryColors

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className={
                    categoryColors[categoryKey] ||
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {categoryLabels[categoryKey] || expense.category}
                </Badge>

                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(expense.expense_date)}
                </span>
              </div>

              <p className="font-medium text-gray-900 break-words">
                {expense.description}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900">
                {formatLocal(localAmount)}
              </p>
              <p className="text-sm text-gray-500">
                {formatINR(inrAmount)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
