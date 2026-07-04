import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TravelPreferencesForm from "@/components/travel-preferences-form"

export default async function PreferencesPage() {
  const supabase = await createClient()

  // Get logged-in user
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get existing preferences if any
  const { data: profileData } = await supabase
    .from("profiles")
    .select("travel_preferences")
    .eq("id", data.user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <TravelPreferencesForm
          userId={data.user.id}
          existingPreferences={profileData?.travel_preferences || {}}
        />
      </div>
    </div>
  )
}
