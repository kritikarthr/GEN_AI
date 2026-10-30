
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
  Star,
  Sparkles,
  Sun,
  Moon,
  Wallet,
  ListChecks,
  ArrowUpRight,
  Compass,
  Plane,
  Check,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface ItineraryContentProps {
  content: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  groupSize: number
}

interface DayActivity {
  time: string
  activity: string
  cost?: string
  type: "morning" | "afternoon" | "evening"
}

interface DayPlan {
  day: number
  date: string
  activities: DayActivity[]
  notes: string[]
}

const categoryPatterns = [
  { name: "Accommodation", icon: Bed, pattern: /accommodation|hotel|stay/i },
  { name: "Food & Dining", icon: Utensils, pattern: /food|dining|restaurant|meal/i },
  { name: "Transportation", icon: Car, pattern: /transport|travel|taxi|transfer/i },
  { name: "Activities", icon: Camera, pattern: /activit|attraction|sightseeing|experience/i },
  { name: "Other", icon: Wallet, pattern: /miscellaneous|other|shopping/i },
]

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
  const date = new Date(`${dateString.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function parseItinerary(content: string, startDate: string, endDate: string): DayPlan[] {
  const lines = content.split(/\r?\n/)
  const days: DayPlan[] = []
  let currentDay: DayPlan | null = null

  const pushDay = () => {
    if (currentDay) days.push(currentDay)
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const dayMatch = line.match(/^#{0,6}\s*\**\s*Day\s+(\d+)\b.*$/i)

    if (dayMatch) {
      pushDay()

      const dayNumber = Number(dayMatch[1])
      const date = new Date(`${startDate.slice(0, 10)}T12:00:00`)
      date.setDate(date.getDate() + dayNumber - 1)

      currentDay = {
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
      continue
    }

    if (!currentDay) continue

    const cleaned = cleanLine(line)

    if (/^(itinerary overview|budget breakdown|travel tips|important notes|estimated total|total budget|accommodation budget|food budget|transportation budget|activities budget)\s*:?\s*$/i.test(cleaned)) {
      continue
    }

    const activityMatch = cleaned.match(
      /^(?:(\d{1,2}(?::\d{2})?\s*(?:AM|PM))|(\d{1,2}:\d{2})|(morning|afternoon|evening))\s*[-–—:]\s*(.+)$/i
    )

    let time = ""
    let activity = ""

    if (activityMatch) {
      time = activityMatch[1] || activityMatch[2] || activityMatch[3]
      activity = activityMatch[4]
    } else if (
      /^[-*+]\s+/.test(line) ||
      /^\d+[.)]\s+/.test(line)
    ) {
      activity = cleaned
    } else if (
      /^(visit|explore|enjoy|have|lunch|dinner|breakfast|head to|return to|discover|walk|take|start|stop at|relax|depart|arrive|check in|check out)\b/i.test(cleaned)
    ) {
      activity = cleaned
    } else {
      currentDay.notes.push(cleaned)
      continue
    }

    activity = activity.replace(/^\*+|\*+$/g, "").trim()
    if (!activity) continue

    const costMatch = activity.match(/(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)/)

    const lowerTime = time.toLowerCase()
    let type: DayActivity["type"] = "morning"

    if (
      lowerTime.includes("evening") ||
      /\b(?:6|7|8|9|10|11)(?::\d{2})?\s*PM\b/i.test(time)
    ) {
      type = "evening"
    } else if (
      lowerTime.includes("afternoon") ||
      /\b(?:12|1|2|3|4|5)(?::\d{2})?\s*PM\b/i.test(time)
    ) {
      type = "afternoon"
    }

    currentDay.activities.push({
      time: time || "Flexible",
      activity: activity.replace(/\s*\$\s*[\d,]+(?:\.\d{1,2})?/g, "").trim(),
      cost: costMatch ? `$${costMatch[1]}` : undefined,
      type,
    })
  }

  pushDay()

  const start = new Date(`${startDate.slice(0, 10)}T12:00:00`)
  const end = new Date(`${endDate.slice(0, 10)}T12:00:00`)

  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    const tripDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
    )
    return days.filter((day) => day.day >= 1 && day.day <= tripDays)
  }

  return days
}

function getBudgetBreakdown(content: string) {
  const lines = content.split(/\r?\n/)
  const items: { name: string; amount: number; icon: typeof Bed }[] = []

  for (const line of lines) {
    const cleaned = cleanLine(line)
    const match = cleaned.match(
      /^([^:]+):\s*(?:USD\s*)?\$\s*([\d,]+(?:\.\d{1,2})?)\s*$/
    )

    if (!match) continue

    const name = match[1].trim()
    const category = categoryPatterns.find((item) => item.pattern.test(name))
    if (!category) continue

    const amount = Number(match[2].replace(/,/g, ""))

    if (Number.isFinite(amount) && amount > 0) {
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

    if (!trimmed) return <div key={index} className="h-3" />

    const isHeading = /^#{1,6}\s+/.test(trimmed)
    const isBullet = /^[-*+]\s+/.test(trimmed)
    const isNumbered = /^\d+[.)]\s+/.test(trimmed)
    const text = cleanLine(trimmed)

    if (isHeading) {
      return (
        <h3 key={index} className="mt-6 mb-3 text-lg font-bold text-slate-900 first:mt-0">
          {text}
        </h3>
      )
    }

    if (isBullet || isNumbered) {
      return (
        <div key={index} className="flex gap-3 py-2 text-sm leading-7 text-slate-600">
          <span className="mt-1 text-emerald-500">✦</span>
          <span>{text}</span>
        </div>
      )
    }

    return (
      <p key={index} className="py-1 text-sm leading-7 text-slate-600">
        {text}
      </p>
    )
  })
}

export function ItineraryContent({
  content,
  destination,
  startDate,
  endDate,
  budget,
  groupSize,
}: ItineraryContentProps) {
  const [checkedActivities, setCheckedActivities] = useState<Set<string>>(new Set())
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

  const totalTripDays =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1)
      : dayPlans.length

  const tripDuration = Math.max(totalTripDays, dayPlans.length)
  const perPersonBudget = Number(budget) / Math.max(1, Number(groupSize))

  const toggleActivity = (id: string) => {
    setCheckedActivities((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const periodIcon = (type: DayActivity["type"]) => {
    if (type === "morning") return <Sun className="h-4 w-4" />
    if (type === "afternoon") return <Camera className="h-4 w-4" />
    return <Moon className="h-4 w-4" />
  }

  const periodStyle = (type: DayActivity["type"]) => {
    if (type === "morning") return "border-amber-200 bg-amber-50 text-amber-700"
    if (type === "afternoon") return "border-sky-200 bg-sky-50 text-sky-700"
    return "border-violet-200 bg-violet-50 text-violet-700"
  }

  return (
    <div className="space-y-8">
      {/* Trip hero */}
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#102c27] px-6 py-9 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_15%,rgba(74,222,128,0.25),transparent_30%),radial-gradient(circle_at_10%_100%,rgba(45,212,191,0.18),transparent_35%)]" />
        <div className="absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-8 -z-10 h-48 w-48 rounded-full border border-white/10" />

        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-emerald-200">
          <Sparkles className="h-4 w-4" />
          YOUR NEXT ADVENTURE STARTS HERE
        </div>

        <div className="mt-6 max-w-3xl">
          <p className="mb-2 text-sm font-medium text-emerald-200">YOUR PERSONAL TRAVEL ITINERARY</p>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {destination}
            <span className="text-emerald-300">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
            Every day, thoughtfully planned. Every experience, ready to explore.
            Your trip is mapped out — now all that is left is to enjoy it.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { icon: CalendarDays, label: `${formatDate(startDate)} – ${formatDate(endDate)}` },
            { icon: Clock, label: `${tripDuration} days` },
            { icon: UsersIcon, label: `${groupSize} travellers` },
            { icon: DollarSign, label: `$${Number(budget).toLocaleString()} budget` },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur-sm"
            >
              <item.icon className="h-4 w-4 text-emerald-300" />
              {item.label}
            </div>
          ))}
        </div>

        <div className="mt-9 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-emerald-100/70">
          <Compass className="h-4 w-4 text-emerald-300" />
          Made for curious travellers
        </div>
      </section>

      {/* Trip stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Destination", value: destination, icon: MapPin },
          { label: "Trip duration", value: `${tripDuration} days`, icon: CalendarDays },
          { label: "Group size", value: `${groupSize} travellers`, icon: Plane },
          { label: "Per person", value: `$${perPersonBudget.toLocaleString()}`, icon: Wallet },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-slate-200/80 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <TabsTrigger value="timeline" className="gap-2 rounded-xl py-3 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4" />
            Daily plan
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2 rounded-xl py-3 text-xs sm:text-sm">
            <ListChecks className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2 rounded-xl py-3 text-xs sm:text-sm">
            <Wallet className="h-4 w-4" />
            Budget
          </TabsTrigger>
        </TabsList>

        {/* Daily plan */}
        <TabsContent value="timeline" className="mt-6 space-y-6">
          {dayPlans.length > 0 ? (
            dayPlans.map((day) => (
              <Card key={day.day} className="overflow-hidden rounded-3xl border-slate-200/80 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-[#f0f8f3] to-white px-5 py-5 sm:px-7">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="border-0 bg-[#d9f1e2] text-[#176344] hover:bg-[#d9f1e2]">
                          DAY {day.day}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {day.activities.length} planned {day.activities.length === 1 ? "activity" : "activities"}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        {day.date}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-medium text-emerald-800">
                      <MapPin className="h-3.5 w-3.5" />
                      {destination}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {day.activities.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {day.activities.map((activity, index) => {
                        const activityId = `${day.day}-${index}`
                        const checked = checkedActivities.has(activityId)

                        return (
                          <div
                            key={activityId}
                            className={`group flex gap-4 px-5 py-5 transition-colors sm:px-7 ${
                              checked ? "bg-emerald-50/60" : "hover:bg-slate-50/80"
                            }`}
                          >
                            <button
                              type="button"
                              aria-label={checked ? "Mark activity incomplete" : "Mark activity complete"}
                              aria-pressed={checked}
                              onClick={() => toggleActivity(activityId)}
                              className="mt-1 shrink-0 rounded-full text-slate-300 transition hover:text-emerald-600"
                            >
                              {checked ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                              ) : (
                                <Circle className="h-6 w-6" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={`gap-1.5 rounded-full px-3 py-1 ${periodStyle(activity.type)}`}>
                                  {periodIcon(activity.type)}
                                  {activity.time}
                                </Badge>
                                {activity.cost && (
                                  <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                                    {activity.cost}
                                  </Badge>
                                )}
                              </div>

                              <h3 className={`text-sm font-semibold leading-7 sm:text-base ${
                                checked ? "text-slate-400 line-through" : "text-slate-800"
                              }`}>
                                {activity.activity}
                              </h3>
                            </div>

                            {checked && (
                              <span className="hidden items-center gap-1 self-center text-xs font-medium text-emerald-700 sm:flex">
                                <Check className="h-3.5 w-3.5" />
                                Done
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3 px-6 py-6 text-sm leading-7 text-slate-600">
                      {day.notes.length > 0
                        ? day.notes.map((note, index) => <p key={index}>{note}</p>)
                        : <p>No activities could be identified for this day.</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Your travel plan
                </CardTitle>
                <CardDescription>
                  Your generated itinerary is shown below. For an automatic day-by-day timeline,
                  the generated content needs headings such as Day 1, Day 2, and so on.
                </CardDescription>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {formatContent(content)}
              </CardContent>
            </Card>
          )}

          {dayPlans.length > 0 && (
            <Card className="rounded-3xl border-emerald-100 bg-emerald-50/50 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5 sm:p-6">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">Your trip progress</p>
                    <p className="text-sm font-semibold text-emerald-800">
                      {checkedActivities.size}/{totalActivities}
                    </p>
                  </div>
                  <Progress value={completionPercentage} className="h-2.5" />
                  <p className="mt-2 text-xs text-slate-500">
                    {completionPercentage === 100
                      ? "Amazing! You have completed every planned activity."
                      : "Check off activities as you complete them during your trip."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="h-5 w-5 text-amber-500" />
                Your trip at a glance
              </CardTitle>
              <CardDescription>
                The important details, all in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Destination", value: destination, icon: MapPin },
                { label: "Travel dates", value: `${formatDate(startDate)} – ${formatDate(endDate)}`, icon: CalendarDays },
                { label: "Duration", value: `${tripDuration} days`, icon: Clock },
                { label: "Group size", value: `${groupSize} travellers`, icon: Plane },
                { label: "Total budget", value: `$${Number(budget).toLocaleString()}`, icon: Wallet },
                { label: "Per person", value: `$${perPersonBudget.toLocaleString()}`, icon: DollarSign },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-emerald-600" />
                Trip checklist
              </CardTitle>
              <CardDescription>
                Keep track of the experiences you have completed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Activities completed</span>
                <span className="font-bold text-slate-900">
                  {checkedActivities.size} of {totalActivities}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-sm text-slate-500">
                {totalActivities === 0
                  ? "Your full itinerary is available in the Daily Plan tab."
                  : completionPercentage === 100
                    ? "Wonderful! You have checked off every planned activity."
                    : "Open Daily Plan to check off activities as you go."}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Complete itinerary</CardTitle>
              <CardDescription>
                All additional recommendations and travel notes from your AI travel planner.
              </CardDescription>
            </CardHeader>
            <CardContent>{formatContent(content)}</CardContent>
          </Card>
        </TabsContent>

        {/* Budget */}
        <TabsContent value="budget" className="mt-6 space-y-6">
          <section className="overflow-hidden rounded-3xl bg-[#102c27] p-6 text-white shadow-lg shadow-emerald-950/10 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Wallet className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-emerald-200">Your planned trip budget</p>
                <p className="mt-1 text-3xl font-bold">${Number(budget).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-6 border-t border-white/10 pt-5">
              <div>
                <p className="text-xs text-emerald-200/70">Per person</p>
                <p className="mt-1 text-lg font-semibold">${perPersonBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-200/70">Travellers</p>
                <p className="mt-1 text-lg font-semibold">{groupSize}</p>
              </div>
            </div>
          </section>

          {budgetBreakdown.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {budgetBreakdown.map((item) => {
                const Icon = item.icon
                const percentage = budget > 0 ? (item.amount / budget) * 100 : 0

                return (
                  <Card key={item.name} className="rounded-3xl border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-2 flex justify-between text-xs text-slate-500">
                        <span>Share of total budget</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <Wallet className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                <h3 className="font-semibold text-slate-900">No structured budget breakdown found</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your total trip budget is available above. Category estimates will appear
                  when the generated itinerary includes lines such as “Accommodation: $300”.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="flex gap-3 p-5">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">A little budget reminder</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  These are estimates from your generated itinerary. Track your actual
                  spending separately in your Budget Manager.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
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
