import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"

interface Assignment {
  id: string
  title: string
  description: string
  course_title: string
  due_date: string
  points: number
  status: string
  submission_status?: string
  grade?: number
  submission_count?: number
  total_students?: number
}

interface AssignmentListProps {
  assignments: Assignment[]
  userRole?: string
}

export function AssignmentList({ assignments, userRole }: AssignmentListProps) {
  if (!assignments?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No assignments found</h3>
        <p className="text-muted-foreground">
          {userRole === "instructor"
            ? "Create your first assignment to get started"
            : "No assignments available at the moment"}
        </p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "default"
      case "graded":
        return "secondary"
      case "overdue":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-2">
                  {assignment.title}
                  <Badge variant={getStatusColor(assignment.submission_status || assignment.status)}>
                    {assignment.submission_status || assignment.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{assignment.course_title}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{assignment.points} points</div>
                {assignment.grade !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    Grade: {assignment.grade}/{assignment.points}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Due {formatDateTime(assignment.due_date)}
                </div>
                {userRole === "instructor" && (
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    {assignment.submission_count || 0}/{assignment.total_students || 0} submitted
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/assignments/${assignment.id}`}>View Details</Link>
                </Button>
                {userRole === "student" && assignment.submission_status !== "submitted" && (
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/assignments/${assignment.id}/submit`}>Submit</Link>
                  </Button>
                )}
                {userRole === "instructor" && (
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/assignments/${assignment.id}/grade`}>Grade</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
