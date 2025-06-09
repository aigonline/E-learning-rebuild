import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"

interface RecentActivityProps {
  userId: string
}

export async function RecentActivity({ userId }: RecentActivityProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get recent activity
  const { data: activities } = await supabase
    .from("activities")
    .select(`
      *,
      profiles!inner(first_name, last_name, avatar_url)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assignment_submitted":
        return "📝"
      case "grade_received":
        return "🎯"
      case "discussion_posted":
        return "💬"
      case "course_enrolled":
        return "📚"
      default:
        return "📌"
    }
  }

  const getActivityMessage = (activity: any) => {
    switch (activity.type) {
      case "assignment_submitted":
        return `Submitted assignment "${activity.metadata?.assignment_title}"`
      case "grade_received":
        return `Received grade for "${activity.metadata?.assignment_title}"`
      case "discussion_posted":
        return `Posted in discussion "${activity.metadata?.discussion_title}"`
      case "course_enrolled":
        return `Enrolled in "${activity.metadata?.course_title}"`
      default:
        return activity.description
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest course activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        {!activities?.length ? (
          <p className="text-center text-muted-foreground py-4">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="text-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{getActivityMessage(activity)}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
