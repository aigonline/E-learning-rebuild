import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Users, Clock, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  instructor_avatar: string
  enrollment_count: number
  total_lessons: number
  duration_hours: number
  status: string
  progress?: number
}

interface CourseGridProps {
  courses: Course[]
  userRole?: string
}

export function CourseGrid({ courses, userRole }: CourseGridProps) {
  if (!courses?.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
        <p className="text-muted-foreground">
          {userRole === "instructor"
            ? "Create your first course to get started"
            : "Enroll in courses to begin learning"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="group hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </div>
              {userRole === "instructor" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}/edit`}>Edit Course</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/courses/${course.id}/analytics`}>View Analytics</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={course.instructor_avatar || "/placeholder.svg"} />
                <AvatarFallback>{course.instructor_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{course.instructor_name}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {course.enrollment_count} students
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {course.duration_hours}h
              </div>
            </div>

            {course.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
              <Button asChild size="sm">
                <Link href={`/dashboard/courses/${course.id}`}>
                  {userRole === "instructor" ? "Manage" : "Continue"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
