import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"

interface UpcomingAssignmentsProps {
  userId: string
}

export async function UpcomingAssignments({ userId }: UpcomingAssignmentsProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get upcoming assignments
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      *,
      courses!inner(
        title,
        course_enrollments!inner(student_id)
      )
    `)
    .eq("courses.course_enrollments.student_id", userId)
    .gte("due_date", new Date().toISOString())
    .order("due_date", { ascending: true })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Assignments</CardTitle>
        <CardDescription>Your next assignments and their due dates</CardDescription>
      </CardHeader>
      <CardContent>
        {!assignments?.length ? (
          <p className="text-center text-muted-foreground py-4">No upcoming assignments</p>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground">{assignment.courses.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    Due {formatDateTime(assignment.due_date)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{assignment.points} pts</Badge>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/assignments/${assignment.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/assignments">View All Assignments</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
