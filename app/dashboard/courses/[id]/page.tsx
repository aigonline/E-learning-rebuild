import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { CourseHeader } from "@/components/courses/course-header"
import { CourseModules } from "@/components/courses/course-modules"
import { CourseAnnouncements } from "@/components/courses/course-announcements"
import { CourseResources } from "@/components/courses/course-resources"
import { CourseDiscussions } from "@/components/courses/course-discussions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CoursePageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get course details
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      profiles!courses_instructor_id_fkey(first_name, last_name, avatar_url)
    `)
    .eq("id", params.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Check if user is enrolled or is the instructor
  const isInstructor = course.instructor_id === session.user.id
  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", params.id)
    .eq("student_id", session.user.id)
    .maybeSingle()

  const isEnrolled = !!enrollment

  // If user is not enrolled and not the instructor, redirect to enrollment page
  if (!isEnrolled && !isInstructor && profile?.role !== "admin") {
    return (
      <div className="max-w-5xl mx-auto">
        <CourseHeader course={course} isInstructor={isInstructor} isEnrolled={isEnrolled} userRole={profile?.role} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <CourseHeader course={course} isInstructor={isInstructor} isEnrolled={isEnrolled} userRole={profile?.role} />

      <Tabs defaultValue="modules" className="mt-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="modules">Modules & Lessons</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>
        <TabsContent value="modules">
          <CourseModules courseId={params.id} isInstructor={isInstructor} userRole={profile?.role} />
        </TabsContent>
        <TabsContent value="announcements">
          <CourseAnnouncements courseId={params.id} isInstructor={isInstructor} userRole={profile?.role} />
        </TabsContent>
        <TabsContent value="resources">
          <CourseResources courseId={params.id} isInstructor={isInstructor} userRole={profile?.role} />
        </TabsContent>
        <TabsContent value="discussions">
          <CourseDiscussions courseId={params.id} isInstructor={isInstructor} userRole={profile?.role} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
