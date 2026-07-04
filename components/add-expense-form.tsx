"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export function AddExpenseForm({ itineraryId }: AddExpenseFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          amount: Number.parseFloat(formData.amount),
          description: formData.description,
          expenseDate: formData.expenseDate,
        }),
      })

      if (response.ok) {
        setFormData({
          category: "",
          amount: "",
          description: "",
          expenseDate: new Date().toISOString().split("T")[0],
        })
        setOpen(false)
        router.refresh()
      } else {
        alert("Failed to add expense. Please try again.")
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Record a new expense for your trip</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger>
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

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you spend money on?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="expenseDate">Date</Label>
            <Input
              id="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, expenseDate: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
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
