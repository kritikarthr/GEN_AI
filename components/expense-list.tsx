import { Badge } from "@/components/ui/badge"
import { Receipt, Calendar } from "lucide-react"

interface Expense {
  id: string
  category: string
  amount: string
  description: string
  expense_date: string
  created_at: string
}

interface ExpenseListProps {
  expenses: Expense[]
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

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No expenses recorded yet</p>
        <p className="text-sm text-gray-500">Start tracking your spending by adding your first expense</p>
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
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={categoryColors[expense.category as keyof typeof categoryColors]}>
                {categoryLabels[expense.category as keyof typeof categoryLabels]}
              </Badge>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(expense.expense_date)}
              </span>
            </div>
            <p className="font-medium text-gray-900">{expense.description}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">${Number.parseFloat(expense.amount).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
