"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, FileText, Video, File, CheckCircle, Clock, Play, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface CourseModulesProps {
  courseId: string
  isInstructor: boolean
  userRole: string
}

export function CourseModules({ courseId, isInstructor, userRole }: CourseModulesProps) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true)
      try {
        // Check if modules table exists by trying to fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true })

        if (modulesError) {
          // If table doesn't exist, just show empty state
          console.log("Modules table not found:", modulesError)
          setModules([])
          setIsLoading(false)
          return
        }

        // Fetch lessons for each module
        const modulesWithLessons = await Promise.all(
          (modulesData || []).map(async (module) => {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from("lessons")
              .select("*")
              .eq("module_id", module.id)
              .order("order_index", { ascending: true })

            if (lessonsError) {
              console.log("Lessons table not found:", lessonsError)
              return {
                ...module,
                lessons: [],
              }
            }

            return {
              ...module,
              lessons: lessonsData || [],
            }
          }),
        )

        setModules(modulesWithLessons)
      } catch (error) {
        console.error("Error fetching modules:", error)
        setModules([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()
  }, [courseId, supabase])

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "quiz":
        return <FileText className="h-4 w-4" />
      case "assignment":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getLessonStatusIcon = (lesson: any) => {
    if (lesson.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No modules yet</p>
          <p className="text-muted-foreground mb-6">
            {isInstructor
              ? "Start creating modules and lessons for your course."
              : "The instructor hasn't added any modules to this course yet."}
          </p>
          {isInstructor && (
            <Button onClick={() => router.push(`/dashboard/courses/${courseId}/modules/create`)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Module
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {isInstructor && (
        <div className="flex justify-end">
          <Button onClick={() => router.push(`/dashboard/courses/${courseId}/modules/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="space-y-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex flex-col items-start text-left">
                <h3 className="text-lg font-medium">{module.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">{module.description}</p>

                <div className="space-y-2">
                  {module.lessons.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/courses/${courseId}/lessons/${lesson.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        {getLessonIcon(lesson.type)}
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.duration_minutes} min • {formatDate(lesson.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getLessonStatusIcon(lesson)}
                        <Button size="sm" variant="ghost">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {isInstructor && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/courses/${courseId}/modules/${module.id}/lessons/create`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
