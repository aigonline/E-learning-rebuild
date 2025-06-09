import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CourseGrid } from "@/components/courses/course-grid"
import { CourseFilters } from "@/components/courses/course-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get user's courses
  const { data: courses } = await supabase.rpc("get_user_courses", {
    user_id: session.user.id,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            {profile?.role === "instructor"
              ? "Manage your courses and track student progress"
              : "View your enrolled courses and track your progress"}
          </p>
        </div>
        {profile?.role === "instructor" && (
          <Link href="/dashboard/courses/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      <CourseFilters />
      <CourseGrid courses={courses || []} userRole={profile?.role} />
    </div>
  )
}
