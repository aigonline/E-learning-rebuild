import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AssignmentList } from "@/components/assignments/assignment-list"
import { AssignmentFilters } from "@/components/assignments/assignment-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function AssignmentsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get assignments based on user role
  const { data: assignments } = await supabase.rpc("get_user_assignments", {
    user_id: session.user.id,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            {profile?.role === "instructor"
              ? "Create and manage assignments for your courses"
              : "View and submit your assignments"}
          </p>
        </div>
        {profile?.role === "instructor" && (
          <Link href="/dashboard/assignments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        )}
      </div>

      <AssignmentFilters />
      <AssignmentList assignments={assignments || []} userRole={profile?.role} />
    </div>
  )
}
