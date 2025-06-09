import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, MessageSquare, Upload, Plus, Calendar } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  userRole?: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const studentActions = [
    {
      title: "Browse Courses",
      description: "Explore available courses",
      icon: BookOpen,
      href: "/dashboard/courses",
    },
    {
      title: "View Assignments",
      description: "Check your assignments",
      icon: FileText,
      href: "/dashboard/assignments",
    },
    {
      title: "Join Discussion",
      description: "Participate in discussions",
      icon: MessageSquare,
      href: "/dashboard/discussions",
    },
    {
      title: "View Calendar",
      description: "Check your schedule",
      icon: Calendar,
      href: "/dashboard/calendar",
    },
  ]

  const instructorActions = [
    {
      title: "Create Course",
      description: "Start a new course",
      icon: Plus,
      href: "/dashboard/courses/create",
    },
    {
      title: "Create Assignment",
      description: "Add new assignment",
      icon: FileText,
      href: "/dashboard/assignments/create",
    },
    {
      title: "Upload Resource",
      description: "Share course materials",
      icon: Upload,
      href: "/dashboard/resources/upload",
    },
    {
      title: "View Analytics",
      description: "Check course performance",
      icon: BookOpen,
      href: "/dashboard/analytics",
    },
  ]

  const actions = userRole === "instructor" ? instructorActions : studentActions

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
