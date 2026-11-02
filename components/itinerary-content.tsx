"use client"

import { useMemo, useState } from "react"
import {
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  Utensils,
  Car,
  Bed,
  Camera,
  CheckCircle2,
  Circle,
  Sparkles,
  Sun,
  Moon,
  Wallet,
  ListChecks,
  ArrowUpRight,
  Compass,
  Plane,
  Lightbulb,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface ItineraryContentProps {
  content: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  budgetInr?: number
  currencySymbol?: string
  currencyCode?: string
  groupSize: number
}

interface DayActivity {
  time: string
  activity: string
  location?: string
  cost?: number
  type: "morning" | "afternoon" | "evening"
}

interface DayPlan {
  day: number
  date: string
  activities: DayActivity[]
  notes: string[]
}

interface BudgetItem {
  name: string
  amount: number
  icon: typeof Bed
}

const categoryPatterns = [
  {
    name: "Accommodation",
    icon: Bed,
    pattern: /accommodation|hotel|stay|lodging/i,
  },
  {
    name: "Food & Dining",
    icon: Utensils,
    pattern: /food|dining|restaurant|meal/i,
  },
  {
    name: "Transportation",
    icon: Car,
    pattern: /transport|travel|taxi|transfer/i,
  },
  {
    name: "Activities",
    icon: Camera,
    pattern: /activit|attraction|sightseeing|experience/i,
  },
  {
    name: "Other",
    icon: Wallet,
    pattern: /miscellaneous|other|shopping/i,
  },
]

function formatMoney(amount: number, symbol: string) {
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`
}

function extractAmount(value: string): number | undefined {
  if (!value) return undefined

  // Supports values such as €25, € 25, EUR 25, 25 EUR, ₹1,500 and $20.
  const match = value.match(
    /(?:[$€£¥₹₩฿₺₱₫]|[A-Z]{3}\s*)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:[A-Z]{3})/i
  )

  if (!match) return undefined

  const amount = Number((match[1] || match[2]).replace(/,/g, ""))
  return Number.isFinite(amount) ? amount : undefined
}

function cleanLine(line: string) {
  return line
    .replace(/^\s{0,3}#{1,6}\s*/, "")
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim()
}

function formatDate(dateString: string) {
  if (!dateString) return "Date not set"

  const date = new Date(`${dateString.slice(0, 10)}T12:00:00`)

  if (Number.isNaN(date.getTime())) return dateString

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getActivityType(time: string): DayActivity["type"] {
  const match = time.match(/\d{1,2}/)
  let hour = match ? Number(match[0]) : 9

  if (/\bPM\b/i.test(time) && hour !== 12) hour += 12
  if (/\bAM\b/i.test(time) && hour === 12) hour = 0

  if (/evening/i.test(time) || hour >= 18) return "evening"
  if (/afternoon/i.test(time) || hour >= 12) return "afternoon"

  return "morning"
}

function parseItinerary(
  content: string,
  startDate: string,
  endDate: string
): DayPlan[] {
  const lines = content.split(/\r?\n/)
  const days: DayPlan[] = []
  let currentDay: DayPlan | null = null

  const createDay = (dayNumber: number): DayPlan => {
    const date = new Date(`${startDate.slice(0, 10)}T12:00:00`)
    date.setDate(date.getDate() + dayNumber - 1)

    return {
      day: dayNumber,
      date: Number.isNaN(date.getTime())
        ? `Day ${dayNumber}`
        : date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
      activities: [],
      notes: [],
    }
  }

  const saveDay = () => {
    if (currentDay) days.push(currentDay)
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const dayMatch = line.match(
      /^#{0,6}\s*(?:\*\*)?\s*Day\s+(\d+)/i
    )

    if (dayMatch) {
      saveDay()
      currentDay = createDay(Number(dayMatch[1]))
      continue
    }

    if (!currentDay) continue

    // Handle table-formatted activities.
    if (line.includes("|")) {
      const columns = line
        .split("|")
        .map((column) => column.trim())
        .filter(Boolean)

      if (columns.length < 2) continue
      if (/^time$/i.test(columns[0])) continue
      if (columns.every((column) => /^[-:\s]+$/.test(column))) continue
      if (/^day[-\s]*total/i.test(columns[0])) continue

      const time = columns[0]
      if (!/\d{1,2}:\d{2}/.test(time)) continue

      const activity = cleanLine(columns[1] || "")
      const location = cleanLine(columns[2] || "")
      const cost = extractAmount(columns.slice(3).join(" "))

      if (!activity) continue

      currentDay.activities.push({
        time,
        activity,
        location,
        cost,
        type: getActivityType(time),
      })

      continue
    }

    const cleaned = cleanLine(line)

    // Handle lines such as "9:00 AM - Visit the museum (€20)".
    const activityMatch = cleaned.match(
      /^(?:(\d{1,2}:\d{2}\s*(?:AM|PM)?)|(morning|afternoon|evening))\s*[-–—:]\s*(.+)$/i
    )

    if (activityMatch) {
      const time = activityMatch[1] || activityMatch[2]
      const activityText = activityMatch[3]
      const cost = extractAmount(activityText)

      const activity = activityText
        .replace(
          /(?:[$€£¥₹₩฿₺₱₫]|[A-Z]{3})\s*[\d,]+(?:\.\d{1,2})?/gi,
          ""
        )
        .replace(/\([\s]*\)/g, "")
        .trim()

      currentDay.activities.push({
        time,
        activity,
        cost,
        type: getActivityType(time),
      })
    } else if (/^[-*+]\s+/.test(line)) {
      currentDay.activities.push({
        time: "Flexible",
        activity: cleaned,
        type: "morning",
      })
    } else if (!/^---+$/.test(line)) {
      currentDay.notes.push(cleaned)
    }
  }

  saveDay()

  const start = new Date(`${startDate.slice(0, 10)}T12:00:00`)
  const end = new Date(`${endDate.slice(0, 10)}T12:00:00`)

  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    const tripDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
    )

    return days.filter(
      (day) => day.day >= 1 && day.day <= tripDays
    )
  }

  return days
}

function getBudgetBreakdown(content: string): BudgetItem[] {
  const items: BudgetItem[] = []

  for (const line of content.split(/\r?\n/)) {
    const cleaned = cleanLine(line)
    const match = cleaned.match(/^([^:]+):\s*(.+)$/)

    if (!match) continue

    const category = categoryPatterns.find((item) =>
      item.pattern.test(match[1])
    )

    if (!category) continue

    const amount = extractAmount(match[2])

    if (amount && amount > 0) {
      items.push({
        name: category.name,
        amount,
        icon: category.icon,
      })
    }
  }

  return items.filter(
    (item, index) =>
      items.findIndex((other) => other.name === item.name) === index
  )
}

function formatContent(content: string) {
  return content.split(/\r?\n/).map((line, index) => {
    const trimmed = line.trim()

    if (
      !trimmed ||
      /^\|/.test(trimmed) ||
      /^---+$/.test(trimmed)
    ) {
      return null
    }

    const isHeading = /^#{1,6}\s+/.test(trimmed)
    const isBullet = /^[-*+]\s+/.test(trimmed)
    const isNumbered = /^\d+[.)]\s+/.test(trimmed)
    const text = cleanLine(trimmed)

    if (isHeading) {
      return (
        <h3
          key={index}
          className="mt-5 mb-2 text-base font-bold text-slate-900"
        >
          {text}
        </h3>
      )
    }

    if (isBullet || isNumbered) {
      return (
        <div
          key={index}
          className="flex gap-2 py-1.5 text-sm leading-6 text-slate-600"
        >
          <span className="text-emerald-500">✦</span>
          <span>{text}</span>
        </div>
      )
    }

    return (
      <p
        key={index}
        className="py-1 text-sm leading-6 text-slate-600"
      >
        {text}
      </p>
    )
  })
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function ItineraryContent({
  content,
  destination,
  startDate,
  endDate,
  budget,
  budgetInr,
  currencySymbol = "₹",
  currencyCode = "INR",
  groupSize,
}: ItineraryContentProps) {
  const [checkedActivities, setCheckedActivities] = useState<Set<string>>(
    new Set()
  )

  const [activeView, setActiveView] = useState("timeline")

  const dayPlans = useMemo(
    () => parseItinerary(content || "", startDate, endDate),
    [content, startDate, endDate]
  )

  const budgetBreakdown = useMemo(
    () => getBudgetBreakdown(content || ""),
    [content]
  )

  const totalActivities = dayPlans.reduce(
    (total, day) => total + day.activities.length,
    0
  )

  const completionPercentage =
    totalActivities > 0
      ? (checkedActivities.size / totalActivities) * 100
      : 0

  const start = new Date(`${startDate.slice(0, 10)}T12:00:00`)
  const end = new Date(`${endDate.slice(0, 10)}T12:00:00`)

  const tripDuration =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
        )
      : dayPlans.length

  const totalBudget = Number(budget) || 0
  const originalInrBudget = Number(budgetInr ?? budget) || 0
  const people = Math.max(1, Number(groupSize) || 1)
  const perPersonBudget = totalBudget / people

  const toggleActivity = (id: string) => {
    setCheckedActivities((previous) => {
      const next = new Set(previous)

      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })
  }

  const periodIcon = (type: DayActivity["type"]) => {
    if (type === "morning") return <Sun className="h-3.5 w-3.5" />
    if (type === "afternoon") return <Camera className="h-3.5 w-3.5" />
    return <Moon className="h-3.5 w-3.5" />
  }

  const periodStyle = (type: DayActivity["type"]) => {
    if (type === "morning") {
      return "bg-amber-50 text-amber-700 border-amber-100"
    }

    if (type === "afternoon") {
      return "bg-sky-50 text-sky-700 border-sky-100"
    }

    return "bg-violet-50 text-violet-700 border-violet-100"
  }

  return (
    <div className="space-y-5">
      {/* Trip header */}
      <section className="relative overflow-hidden rounded-2xl bg-[#102c27] px-5 py-6 text-white shadow-md sm:px-7">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-8 h-32 w-32 rounded-full border border-white/10" />

        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            YOUR NEXT ADVENTURE
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {destination}
            <span className="text-emerald-300">.</span>
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {
                icon: CalendarDays,
                label: `${formatDate(startDate)} – ${formatDate(endDate)}`,
              },
              { icon: Clock, label: `${tripDuration} days` },
              { icon: UsersIcon, label: `${groupSize} travellers` },
              {
                icon: Wallet,
                label: formatMoney(totalBudget, currencySymbol),
              },
            ].map((item, index) => (
              <span
                key={index}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-emerald-50"
              >
                <item.icon className="h-3.5 w-3.5 text-emerald-300" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trip statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Destination", value: destination, icon: MapPin },
          {
            label: "Duration",
            value: `${tripDuration} days`,
            icon: CalendarDays,
          },
          {
            label: "Travellers",
            value: `${groupSize}`,
            icon: Plane,
          },
          {
            label: `Per person (${currencyCode})`,
            value: formatMoney(perPersonBudget, currencySymbol),
            icon: Wallet,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <stat.icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">{stat.label}</p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <Tabs
        value={activeView}
        onValueChange={setActiveView}
        className="w-full"
      >
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabsTrigger
            value="timeline"
            className="gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Daily plan
          </TabsTrigger>

          <TabsTrigger
            value="overview"
            className="gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm"
          >
            <ListChecks className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="budget"
            className="gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm"
          >
            <Wallet className="h-3.5 w-3.5" />
            Budget
          </TabsTrigger>
        </TabsList>

        {/* Daily plan */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          {dayPlans.length > 0 ? (
            dayPlans.map((day) => {
              const dayCost = day.activities.reduce(
                (total, activity) => total + (activity.cost || 0),
                0
              )

              const completed = day.activities.filter(
                (_, index) =>
                  checkedActivities.has(`${day.day}-${index}`)
              ).length

              return (
                <Card
                  key={day.day}
                  className="overflow-hidden rounded-2xl border-slate-200 shadow-sm"
                >
                  <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3.5 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Badge className="border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100">
                            DAY {day.day}
                          </Badge>

                          <span className="text-[11px] text-slate-500">
                            {day.activities.length} activities
                          </span>
                        </div>

                        <CardTitle className="text-lg font-bold text-slate-900">
                          {day.date}
                        </CardTitle>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {dayCost > 0 && (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            <Wallet className="mr-1 inline h-3 w-3" />
                            {formatMoney(dayCost, currencySymbol)}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500">
                          {completed}/{day.activities.length} done
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {day.activities.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {day.activities.map((activity, index) => {
                          const activityId = `${day.day}-${index}`
                          const checked =
                            checkedActivities.has(activityId)

                          return (
                            <div
                              key={activityId}
                              className={`group flex gap-3 px-4 py-3.5 transition-colors sm:px-5 ${
                                checked
                                  ? "bg-emerald-50/50"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex shrink-0 flex-col items-center">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                    activity.type === "morning"
                                      ? "bg-amber-50 text-amber-700"
                                      : activity.type === "afternoon"
                                        ? "bg-sky-50 text-sky-700"
                                        : "bg-violet-50 text-violet-700"
                                  }`}
                                >
                                  {periodIcon(activity.type)}
                                </div>

                                {index !== day.activities.length - 1 && (
                                  <div className="mt-1.5 min-h-4 w-px flex-1 bg-slate-200" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${periodStyle(
                                      activity.type
                                    )}`}
                                  >
                                    {activity.time}
                                  </span>

                                  {activity.cost !== undefined && (
                                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                      {formatMoney(
                                        activity.cost,
                                        currencySymbol
                                      )}
                                    </span>
                                  )}
                                </div>

                                <h3
                                  className={`text-sm font-semibold leading-5 ${
                                    checked
                                      ? "text-slate-400 line-through"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {activity.activity}
                                </h3>

                                {activity.location && (
                                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                    <MapPin className="h-3 w-3" />
                                    {activity.location}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleActivity(activityId)}
                                className="mt-1 shrink-0 text-slate-300 transition-colors hover:text-emerald-600"
                                aria-label={
                                  checked
                                    ? "Mark activity incomplete"
                                    : "Mark activity complete"
                                }
                              >
                                {checked ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="p-5 text-sm text-slate-500">
                        No structured activities were found for this day.
                        Check the full itinerary below.
                      </p>
                    )}

                    {day.notes.length > 0 && (
                      <div className="border-t border-slate-100 bg-amber-50/50 px-4 py-3 sm:px-5">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Notes
                        </p>

                        {day.notes.map((note, index) => (
                          <p
                            key={index}
                            className="text-xs leading-5 text-slate-600"
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Your travel plan
                </div>

                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Your generated itinerary is shown below.
                </p>

                {formatContent(content)}
              </CardContent>
            </Card>
          )}

          {/* Trip progress */}
          {dayPlans.length > 0 && (
            <Card className="rounded-xl border-emerald-100 bg-emerald-50/60 shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-white p-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800">
                      Your trip progress
                    </p>

                    <p className="text-xs font-bold text-emerald-800">
                      {checkedActivities.size}/{totalActivities}
                    </p>
                  </div>

                  <Progress
                    value={completionPercentage}
                    className="h-2"
                  />

                  <p className="mt-1.5 text-[10px] text-slate-500">
                    {completionPercentage === 100
                      ? "You've completed every planned activity. Amazing!"
                      : "Tick off each experience as you go."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Travel tip */}
          {dayPlans.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
              <div className="rounded-lg bg-white p-2 text-amber-600">
                <Lightbulb className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  A little travel tip
                </p>

                <p className="mt-0.5 text-xs leading-5 text-slate-600">
                  Keep some room for spontaneous discoveries. The best
                  travel memories sometimes happen between planned
                  activities!
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Compass className="h-4 w-4 text-emerald-600" />
                Trip at a glance
              </CardTitle>

              <CardDescription className="text-xs">
                Your travel details in one place.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-2.5 px-5 pb-5 sm:grid-cols-2">
              {[
                {
                  label: "Destination",
                  value: destination,
                  icon: MapPin,
                },
                {
                  label: "Travel dates",
                  value: `${formatDate(startDate)} – ${formatDate(endDate)}`,
                  icon: CalendarDays,
                },
                {
                  label: "Duration",
                  value: `${tripDuration} days`,
                  icon: Clock,
                },
                {
                  label: "Group size",
                  value: `${groupSize} travellers`,
                  icon: Plane,
                },
                {
                  label: `Total budget (${currencyCode})`,
                  value: formatMoney(totalBudget, currencySymbol),
                  icon: Wallet,
                },
                {
                  label: `Per person (${currencyCode})`,
                  value: formatMoney(perPersonBudget, currencySymbol),
                  icon: DollarSign,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div className="rounded-lg bg-white p-2 text-emerald-700 shadow-sm">
                    <item.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">
                      {item.label}
                    </p>

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks className="h-4 w-4 text-emerald-600" />
                Activity checklist
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 px-5 pb-5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Activities completed
                </span>

                <span className="font-semibold text-slate-800">
                  {checkedActivities.size} of {totalActivities}
                </span>
              </div>

              <Progress
                value={completionPercentage}
                className="h-2"
              />

              <p className="text-xs text-slate-500">
                {totalActivities === 0
                  ? "Your full itinerary is available in the Daily Plan tab."
                  : `${Math.round(
                      completionPercentage
                    )}% of your planned experiences completed.`}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="px-5 py-4">
              <CardTitle className="text-base">
                More travel notes
              </CardTitle>

              <CardDescription className="text-xs">
                Additional recommendations from your AI travel planner.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              {formatContent(content)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget */}
        <TabsContent value="budget" className="mt-4 space-y-4">
          <section className="rounded-2xl bg-[#102c27] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2.5">
                <Wallet className="h-5 w-5 text-emerald-300" />
              </div>

              <div>
                <p className="text-xs text-emerald-200">
                  Total planned budget ({currencyCode})
                </p>

                <p className="text-2xl font-bold">
                  {formatMoney(totalBudget, currencySymbol)}
                </p>

                <p className="mt-1 text-xs text-emerald-100/70">
                  INR equivalent: {formatMoney(originalInrBudget, "₹")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-8 border-t border-white/10 pt-3">
              <div>
                <p className="text-[11px] text-emerald-200/70">
                  Per person
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {formatMoney(perPersonBudget, currencySymbol)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-emerald-200/70">
                  Travellers
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {groupSize}
                </p>
              </div>
            </div>
          </section>

          {budgetBreakdown.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {budgetBreakdown.map((item) => {
                const Icon = item.icon

                const percentage =
                  totalBudget > 0
                    ? (item.amount / totalBudget) * 100
                    : 0

                return (
                  <Card
                    key={item.name}
                    className="rounded-xl border-slate-200 shadow-sm"
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                            <Icon className="h-4 w-4" />
                          </div>

                          <span className="text-xs font-semibold text-slate-800">
                            {item.name}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {formatMoney(item.amount, currencySymbol)}
                        </span>
                      </div>

                      <div className="mb-1.5 flex justify-between text-[10px] text-slate-500">
                        <span>Budget share</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>

                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-1.5"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <Wallet className="mx-auto mb-2 h-8 w-8 text-slate-300" />

                <p className="text-sm font-semibold text-slate-800">
                  No structured budget breakdown found
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Category estimates will appear when your generated
                  itinerary includes lines such as
                  {" "}Accommodation: €300.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

            <div>
              <p className="text-xs font-semibold text-slate-800">
                Budget reminder
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-600">
                These are estimates from your generated itinerary. Track
                your actual spending separately in your Budget Manager.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}