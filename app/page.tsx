
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  DollarSign,
  Globe2,
  MapPin,
  Mountain,
  Plane,
  ShieldCheck,
  Sparkles,
  Sun,
  Sunset,
  Wallet,
  WandSparkles,
  Utensils,
  Camera,
  Heart,
  Users,
  Luggage,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: WandSparkles,
    title: "AI-generated itineraries",
    description:
      "Get a structured day-by-day travel plan with activities, timings, places to visit and estimated costs.",
  },
  {
    icon: Wallet,
    title: "Intelligent budget planning",
    description:
      "Plan around your total budget, group size and trip duration with estimated expense categories.",
  },
  {
    icon: Heart,
    title: "Travel that feels personal",
    description:
      "Choose your travel style, favourite activities and accommodation preferences.",
  },
  {
    icon: Globe2,
    title: "Season-aware suggestions",
    description:
      "Consider seasonal weather, local events, packing advice and travel conditions.",
  },
  {
    icon: CalendarDays,
    title: "Organized daily schedules",
    description:
      "Turn your travel ideas into a clear schedule with morning, afternoon and evening activities.",
  },
  {
    icon: ShieldCheck,
    title: "Your plans, saved",
    description:
      "Access your saved itineraries and revisit your travel plans whenever you need them.",
  },
]

const sampleActivities = [
  {
    time: "09:00 AM",
    title: "Explore the historic city centre",
    detail: "Discover local architecture and iconic landmarks",
    icon: Camera,
    color: "bg-amber-50 text-amber-700",
  },
  {
    time: "12:30 PM",
    title: "Local food experience",
    detail: "Try regional cuisine at a traditional restaurant",
    icon: Utensils,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    time: "03:00 PM",
    title: "Visit a cultural attraction",
    detail: "Explore museums, art and local history",
    icon: Mountain,
    color: "bg-sky-50 text-sky-700",
  },
  {
    time: "07:00 PM",
    title: "Evening city walk",
    detail: "Enjoy the atmosphere and discover local cafés",
    icon: Sunset,
    color: "bg-violet-50 text-violet-700",
  },
]

const budgetItems = [
  { name: "Accommodation", amount: 350, color: "bg-emerald-600" },
  { name: "Food & dining", amount: 200, color: "bg-sky-500" },
  { name: "Activities", amount: 180, color: "bg-violet-500" },
  { name: "Transportation", amount: 120, color: "bg-amber-500" },
  { name: "Miscellaneous", amount: 150, color: "bg-slate-400" },
]

export default function HomePage() {
  const sampleBudget = 1000

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafaf7] text-slate-900">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#fafaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg shadow-emerald-900/20">
              <Compass className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Itinerary<span className="text-emerald-700">Assist</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="#features"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-emerald-800 sm:block"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-emerald-800 sm:block"
            >
              How it works
            </a>
            <Link href="/auth/login">
              <Button variant="ghost" className="rounded-full">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="rounded-full bg-emerald-800 px-5 text-white hover:bg-emerald-900">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2200&q=90')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071d1b]/90 via-[#071d1b]/65 to-[#071d1b]/20" />

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_.9fr]">

          <div className="max-w-2xl text-white">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Meet your AI travel companion
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Your next adventure.
              <span className="mt-2 block text-emerald-300">
                Thoughtfully planned.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/85 sm:text-xl">
              Forget the endless tabs and hours of research.
              Tell us what you love, set your budget, and let
              AI bring your next journey together.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-emerald-500 px-8 text-base font-bold text-white shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-emerald-400"
                >
                  Build my itinerary
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <a href="#product-preview">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-white/50 bg-white/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  See what you get
                </Button>
              </a>
            </div>

            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-4 text-sm text-white/85">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Personalized plans
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Budget-aware ideas
              </span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-300" />
                Saved itineraries
              </span>
            </div>
          </div>

          {/* HERO PRODUCT CARD */}
          <div className="hidden lg:block">
            <div className="ml-auto max-w-md rounded-[2rem] border border-white/30 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                    YOUR NEXT JOURNEY
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    Made for exploring
                  </h2>
                </div>
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                  <Plane className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=85"
                  alt="Beautiful Italian coastal village"
                  className="h-48 w-full object-cover"
                />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    A journey worth remembering
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    Your next destination
                  </p>
                </div>
                <Sparkles className="h-6 w-6 text-emerald-700" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
                <div>
                  <CalendarDays className="mx-auto h-5 w-5 text-emerald-700" />
                  <p className="mt-2 text-xs font-medium text-slate-500">Your dates</p>
                </div>
                <div>
                  <Wallet className="mx-auto h-5 w-5 text-emerald-700" />
                  <p className="mt-2 text-xs font-medium text-slate-500">Your budget</p>
                </div>
                <div>
                  <Heart className="mx-auto h-5 w-5 text-emerald-700" />
                  <p className="mt-2 text-xs font-medium text-slate-500">Your style</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section id="product-preview" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              MORE THAN JUST A TRAVEL PLANNER
            </span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
              From a simple idea to a complete travel plan.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-500">
              Here's a preview of the kind of experience
              Itinerary Assist helps you create.
            </p>
          </div>

          {/* ITINERARY PREVIEW */}
          <div className="grid items-stretch gap-8 lg:grid-cols-[1.1fr_.9fr]">

            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">

              <div className="bg-gradient-to-r from-emerald-950 to-teal-800 p-7 text-white sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider">
                    SAMPLE ITINERARY
                  </span>
                  <Sparkles className="h-6 w-6 text-emerald-300" />
                </div>

                <h3 className="mt-6 text-3xl font-bold">
                  A day of discovery
                </h3>

                <p className="mt-2 text-sm text-emerald-100">
                  An example of your personalized daily travel schedule
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                    <CalendarDays className="h-4 w-4" />
                    Day 1
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                    <Sun className="h-4 w-4" />
                    Morning to evening
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="space-y-7">
                  {sampleActivities.map((activity, index) => {
                    const Icon = activity.icon

                    return (
                      <div key={activity.time} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activity.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {index !== sampleActivities.length - 1 && (
                            <div className="mt-2 h-full min-h-8 w-px bg-slate-200" />
                          )}
                        </div>

                        <div className="min-w-0 pb-2">
                          <p className="text-xs font-bold tracking-wider text-emerald-700">
                            {activity.time}
                          </p>
                          <h4 className="mt-1 font-bold text-slate-900">
                            {activity.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {activity.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <p className="mt-5 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
                  Illustrative preview — your actual itinerary is generated from your trip details.
                </p>
              </div>
            </div>

            {/* BUDGET PREVIEW */}
            <div className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    SMART BUDGETING
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">
                    Know where your money goes.
                  </h3>
                </div>
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                  <Wallet className="h-6 w-6" />
                </span>
              </div>

              <div className="mt-9 rounded-2xl bg-[#f4f8f4] p-6">
                <p className="text-sm font-medium text-slate-500">
                  Example total trip budget
                </p>
                <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                  ${sampleBudget.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Illustrative budget allocation
                </p>

                <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-200">
                  {budgetItems.map((item) => (
                    <div
                      key={item.name}
                      className={item.color}
                      style={{ width: `${(item.amount / sampleBudget) * 100}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {budgetItems.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-slate-700">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        ${item.amount}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${(item.amount / sampleBudget) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <Check className="h-5 w-5 shrink-0 text-emerald-700" />
                  <p className="text-sm leading-6 text-emerald-900">
                    Plan your trip with your budget and group size in mind.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-14 max-w-2xl">
            <p className="text-sm font-bold tracking-[0.2em] text-emerald-700">
              BUILT AROUND YOUR TRAVEL STYLE
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Every trip is different. Your itinerary should be too.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-500">
              Choose the experiences you enjoy and let
              Itinerary Assist help organize the details.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-slate-100 bg-[#fafaf7] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-100 p-3 text-emerald-800 transition group-hover:bg-emerald-800 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-24 bg-[#eef4ee] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.2em] text-emerald-700">
              YOUR JOURNEY STARTS HERE
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Three steps. One unforgettable trip.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Tell us what you want",
                text: "Enter your destination, dates, budget, group size and travel preferences.",
                icon: Compass,
              },
              {
                number: "02",
                title: "Let AI plan the details",
                text: "Generate a personalized itinerary with daily activities, dining and estimated expenses.",
                icon: Sparkles,
              },
              {
                number: "03",
                title: "Explore with confidence",
                text: "View your saved itinerary, keep track of your plan and manage your trip budget.",
                icon: Plane,
              },
            ].map((step) => {
              const Icon = step.icon

              return (
                <div
                  key={step.number}
                  className="rounded-[1.8rem] border border-white bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-[0.2em] text-emerald-700">
                      {step.number}
                    </span>
                    <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-800">
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                  <p className="mt-4 leading-7 text-slate-500">{step.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-24 sm:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 px-7 py-16 text-center text-white shadow-2xl shadow-emerald-950/20 sm:px-14 sm:py-20">

          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-teal-300/10 blur-3xl" />

          <div className="relative z-10">
            <Sparkles className="mx-auto h-9 w-9 text-amber-300" />

            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
              Your next great journey deserves a great plan.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-emerald-100">
              Bring your ideas, your budget and your sense of adventure.
              Let Itinerary Assist help you put it all together.
            </p>

            <Link href="/auth/signup">
              <Button
                size="lg"
                className="mt-9 h-14 rounded-full bg-white px-9 text-base font-bold text-emerald-900 shadow-lg hover:bg-emerald-50"
              >
                Start planning your trip
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-5 py-9 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white">
              <Compass className="h-5 w-5" />
            </span>
            <span className="font-bold">
              Itinerary<span className="text-emerald-700">Assist</span>
            </span>
          </Link>

          <p className="text-center text-sm text-slate-500">
            Made for curious minds and unforgettable journeys.
          </p>

          <Link
            href="/auth/login"
            className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </footer>

    </main>
  )
}
