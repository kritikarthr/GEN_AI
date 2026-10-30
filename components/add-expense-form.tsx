
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddExpenseFormProps {
  itineraryId: string
}

const categories = [
  { value: "accommodation", label: "Accommodation" },
  { value: "food", label: "Food & Dining" },
  { value: "transportation", label: "Transportation" },
  { value: "activities", label: "Activities" },
  { value: "shopping", label: "Shopping" },
  { value: "miscellaneous", label: "Miscellaneous" },
]

function getLocalDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function AddExpenseForm({ itineraryId }: AddExpenseFormProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    expenseDate: getLocalDate(),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen && !isSubmitting) {
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")

    const amount = Number(formData.amount)

    if (!formData.category) {
      setErrorMessage("Please select an expense category.")
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("Please enter an amount greater than zero.")
      return
    }

    if (!formData.description.trim()) {
      setErrorMessage("Please enter a description.")
      return
    }

    if (!formData.expenseDate) {
      setErrorMessage("Please select the expense date.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itineraryId,
          category: formData.category,
          amount,
          description: formData.description.trim(),
          expenseDate: formData.expenseDate,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        const message = [
          data?.error || "Failed to add expense.",
          data?.details,
          data?.code ? `Database code: ${data.code}` : "",
        ]
          .filter(Boolean)
          .join("\n")

        throw new Error(message)
      }

      setFormData({
        category: "",
        amount: "",
        description: "",
        expenseDate: getLocalDate(),
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding expense:", error)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for your trip.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-category">Category</Label>

            <Select
              value={formData.category}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, category: value }))
                setErrorMessage("")
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="expense-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount ($)</Label>

            <Input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
                setErrorMessage("")
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-description">Description</Label>

            <Textarea
              id="expense-description"
              placeholder="What did you spend money on?"
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
                setErrorMessage("")
              }}
              required
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Date</Label>

            <Input
              id="expense-date"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  expenseDate: e.target.value,
                }))
                setErrorMessage("")
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap break-words"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
