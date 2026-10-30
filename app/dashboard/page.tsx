
import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plane,
  MapPin,
  CalendarDays,
  Wallet,
  Eye,
  Users,
  ArrowRight,
  Sparkles,
  Compass,
  Luggage,
  Globe2,
  Plus,
  Clock3,
} from "lucide-react"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const user = data.user

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Traveler"

  const { data: itineraries } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalItineraries = itineraries?.length || 0

  const totalBudget =
    itineraries?.reduce(
      (sum, itinerary) => sum + (Number(itinerary.budget) || 0),
      0
    ) || 0

  const uniqueDestinations = new Set(
    itineraries?.map((itinerary) => itinerary.destination)
  ).size

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-slate-900">

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:py-10">

        {/* NAVIGATION */}
        <header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <Link href="/" className="flex w-fit items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Compass className="h-6 w-6" />
            </span>

            <span>
              <span className="block text-xl font-bold tracking-tight">
                Itinerary<span className="text-emerald-700">Assist</span>
              </span>
              <span className="block text-xs text-slate-500">
                Your personal travel space
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-base font-bold text-emerald-800">
              {userName.slice(0, 1).toUpperCase()}
            </span>

            <span>
              <span className="block text-[11px] text-slate-500">
                Logged in as
              </span>
              <span className="block max-w-[170px] truncate text-sm font-semibold">
                {userName}
              </span>
            </span>
          </div>

        </header>

        {/* HERO BANNER */}
        <section className="relative isolate mb-9 overflow-hidden rounded-[2rem] bg-[#073e34] shadow-xl shadow-emerald-950/10">

          <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-35"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1800&q=85')",
            }}
          />

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-emerald-900/35" />

          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-10 px-7 py-10 sm:px-11 sm:py-14 lg:flex-row lg:items-center">

            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wider text-emerald-50 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-amber-300" />
                YOUR NEXT ADVENTURE STARTS HERE
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Ready to wander,
                <span className="block text-emerald-300">
                  {userName}?
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/85 sm:text-lg">
                Your travel plans, ideas and adventures all in one place.
                Let's make your next journey unforgettable.
              </p>

              <Link href="/create-itinerary">
                <Button className="mt-8 h-13 rounded-full bg-white px-7 py-6 text-base font-bold text-emerald-950 shadow-lg transition hover:-translate-y-1 hover:bg-emerald-50">
                  <Plus className="mr-2 h-5 w-5" />
                  Create a new trip
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </Link>

            </div>

            <div className="hidden lg:block">
              <div className="w-64 rounded-[1.8rem] border border-white/20 bg-white/10 p-5 text-white shadow-xl backdrop-blur-xl">

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-50">
                    Your travel journal
                  </span>
                  <Globe2 className="h-5 w-5 text-emerald-300" />
                </div>

                <div className="my-7 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Plane className="h-11 w-11 -rotate-12 text-emerald-200" />
                  </div>
                </div>

                <p className="text-center text-2xl font-bold">
                  {totalItineraries} trips
                </p>

                <p className="mt-2 text-center text-sm text-emerald-100/75">
                  And many more adventures to come.
                </p>

              </div>
            </div>

          </div>
        </section>

        {/* STATISTICS */}
        <section className="mb-10 grid gap-5 sm:grid-cols-3">

          <Card className="group overflow-hidden rounded-[1.6rem] border-0 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="relative flex items-center gap-5 p-6">
              <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-emerald-50 transition group-hover:scale-125" />

              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <MapPin className="h-6 w-6" />
              </span>

              <div className="relative">
                <p className="text-sm font-medium text-slate-500">
                  Destinations explored
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {uniqueDestinations}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden rounded-[1.6rem] border-0 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="relative flex items-center gap-5 p-6">
              <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-sky-50 transition group-hover:scale-125" />

              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
                <CalendarDays className="h-6 w-6" />
              </span>

              <div className="relative">
                <p className="text-sm font-medium text-slate-500">
                  Trips planned
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {totalItineraries}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden rounded-[1.6rem] border-0 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardContent className="relative flex items-center gap-5 p-6">
              <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-amber-50 transition group-hover:scale-125" />

              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Wallet className="h-6 w-6" />
              </span>

              <div className="relative">
                <p className="text-sm font-medium text-slate-500">
                  Planned budget*
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

        </section>

        <p className="-mt-6 mb-9 text-xs text-slate-400">
          *Combined budget across your five most recent itineraries.
        </p>

        {/* MAIN CONTENT */}
        <section className="grid items-start gap-7 lg:grid-cols-[.85fr_1.15fr]">

          {/* PLANNING CARD */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-700 p-7 text-white sm:p-9">

              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[25px] border-white/10" />

              <div className="relative">
                <span className="inline-flex rounded-full bg-white/15 p-3">
                  <Luggage className="h-6 w-6" />
                </span>

                <p className="mt-7 text-xs font-bold tracking-[0.2em] text-emerald-200">
                  YOUR NEXT CHAPTER
                </p>

                <h2 className="mt-3 text-3xl font-bold leading-tight">
                  There's a whole world waiting.
                </h2>

                <p className="mt-4 leading-7 text-emerald-50/85">
                  Pick a destination, decide your budget and tell us
                  what you love. We'll help organize the journey.
                </p>
              </div>
            </div>

            <div className="p-7 sm:p-9">

              <div className="mb-6 space-y-4">

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    Choose your destination
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    Set your dates and group size
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    Plan around your budget
                  </span>
                </div>

              </div>

              <Link href="/create-itinerary">
                <Button className="h-12 w-full rounded-full bg-emerald-800 font-bold text-white shadow-md shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-900">
                  Start planning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

            </div>
          </div>

          {/* RECENT ITINERARIES */}
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

            <div className="mb-7 flex items-center justify-between gap-3">

              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-emerald-700">
                  YOUR TRAVEL COLLECTION
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Recent itineraries
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your adventures, all in one place.
                </p>
              </div>

              <span className="hidden rounded-2xl bg-emerald-50 p-3 text-emerald-800 sm:flex">
                <Compass className="h-6 w-6" />
              </span>

            </div>

            {itineraries && itineraries.length > 0 ? (

              <div className="space-y-4">

                {itineraries.map((itinerary, index) => (

                  <div
                    key={itinerary.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-[#fbfcfa] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-md"
                  >

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                          {index % 2 === 0 ? (
                            <Plane className="h-5 w-5" />
                          ) : (
                            <Globe2 className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-bold text-slate-900">
                            {itinerary.destination}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">

                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(itinerary.start_date)}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {itinerary.group_size} people
                            </span>

                          </div>

                          <div className="mt-3">
                            <Badge className="border-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              ${Number(itinerary.budget).toLocaleString()} budget
                            </Badge>
                          </div>

                        </div>
                      </div>

                      <Link href={`/itinerary/${itinerary.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full border-slate-200 bg-white transition group-hover:border-emerald-300 group-hover:text-emerald-800 sm:w-auto"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View trip
                        </Button>
                      </Link>

                    </div>
                  </div>

                ))}

                {itineraries.length >= 5 && (
                  <div className="pt-2 text-center">
                    <Link href="/itineraries">
                      <Button
                        variant="ghost"
                        className="rounded-full text-emerald-800 hover:bg-emerald-50"
                      >
                        View all itineraries
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}

              </div>

            ) : (

              <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-12 text-center">

                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Luggage className="h-7 w-7" />
                </span>

                <h3 className="mt-5 text-lg font-bold">
                  Your travel story starts here
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  You haven't created an itinerary yet. Let's plan your first adventure!
                </p>

                <Link href="/create-itinerary">
                  <Button className="mt-6 rounded-full bg-emerald-800 px-6 text-white hover:bg-emerald-900">
                    <Plus className="mr-2 h-4 w-4" />
                    Plan your first trip
                  </Button>
                </Link>

              </div>

            )}

          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-7 text-xs text-slate-400 sm:flex-row">
          <span>
            © {new Date().getFullYear()} ItineraryAssist
          </span>

          <span className="flex items-center gap-2">
            Made for your next adventure
            <span aria-hidden="true">✈️</span>
          </span>
        </footer>

      </div>
    </main>
  )
}
