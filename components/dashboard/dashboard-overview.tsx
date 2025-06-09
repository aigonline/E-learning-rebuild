import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, MessageSquare, TrendingUp } from "lucide-react"

interface DashboardOverviewProps {
  userId: string
}

export async function DashboardOverview({ userId }: DashboardOverviewProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get user's courses count
  const { count: coursesCount } = await supabase
    .from("course_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("student_id", userId)

  // Get assignments count
  const { count: assignmentsCount } = await supabase
    .from("assignments")
    .select("*, courses!inner(course_enrollments!inner(student_id))", { count: "exact", head: true })
    .eq("courses.course_enrollments.student_id", userId)

  // Get discussions count
  const { count: discussionsCount } = await supabase
    .from("discussions")
    .select("*, courses!inner(course_enrollments!inner(student_id))", { count: "exact", head: true })
    .eq("courses.course_enrollments.student_id", userId)

  // Get student performance
  const { data: performance } = await supabase.rpc("get_student_performance", { student_id: userId })

  const stats = [
    {
      title: "Enrolled Courses",
      value: coursesCount || 0,
      icon: BookOpen,
      description: "Active enrollments",
    },
    {
      title: "Assignments",
      value: assignmentsCount || 0,
      icon: FileText,
      description: "Total assignments",
    },
    {
      title: "Discussions",
      value: discussionsCount || 0,
      icon: MessageSquare,
      description: "Course discussions",
    },
    {
      title: "Average Grade",
      value: performance?.[0]?.average_grade ? `${performance[0].average_grade}%` : "N/A",
      icon: TrendingUp,
      description: "Overall performance",
    },
  ]

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
