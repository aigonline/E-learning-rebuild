"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Users, Calendar, Edit, Share, Settings, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

interface CourseHeaderProps {
  course: any
  isInstructor: boolean
  isEnrolled: boolean
  userRole: string
}

export function CourseHeader({ course, isInstructor, isEnrolled, userRole }: CourseHeaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const instructor = course.profiles
  const metadata = course.metadata || {}
  const difficulty = metadata.difficulty || "beginner"
  const category = metadata.category || "other"

  const handleEnroll = async () => {
    setIsLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to enroll in a course")
      }

      const { error } = await supabase.from("course_enrollments").insert({
        course_id: course.id,
        student_id: user.id,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Enrolled successfully",
        description: `You are now enrolled in ${course.name}`,
      })

      // Refresh the page to show enrolled content
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to enroll. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className="border-t-8" style={{ borderTopColor: course.color }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl">{course.name}</CardTitle>
            <CardDescription className="text-lg mt-1">{course.code}</CardDescription>
          </div>
          {isInstructor && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/courses/${course.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>
              <Button variant="outline" size="sm">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{category}</Badge>
          <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
          {metadata.tags &&
            metadata.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
        </div>

        <p className="text-muted-foreground">{course.description}</p>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            Created {formatDate(course.created_at)}
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            {course.enrollment_count || 0} students
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={instructor?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>
              {instructor?.first_name?.[0]}
              {instructor?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {instructor?.first_name} {instructor?.last_name}
            </p>
            <p className="text-xs text-muted-foreground">Instructor</p>
          </div>
        </div>

        {!isEnrolled && !isInstructor && userRole !== "admin" && (
          <Button onClick={handleEnroll} disabled={isLoading} className="mt-4">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <BookOpen className="mr-2 h-4 w-4" />
            Enroll in Course
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
