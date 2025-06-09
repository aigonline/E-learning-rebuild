import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.first_name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your courses today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardOverview userId={session.user.id} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <UpcomingAssignments userId={session.user.id} />
        </div>
        <div className="col-span-3">
          <RecentActivity userId={session.user.id} />
        </div>
      </div>

      <QuickActions userRole={profile?.role} />
    </div>
  )
}
