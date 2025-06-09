"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, MessageSquare, Search, ThumbsUp, MessageCircle, Loader2, Pin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime } from "@/lib/utils"

interface CourseDiscussionsProps {
  courseId: string
  isInstructor: boolean
  userRole: string
}

export function CourseDiscussions({ courseId, isInstructor, userRole }: CourseDiscussionsProps) {
  const [discussions, setDiscussions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDiscussions = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("discussions")
          .select(`
          *,
          profiles:author_id(first_name, last_name, avatar_url)
        `)
          .eq("course_id", courseId)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })

        if (error) {
          console.log("Error fetching discussions:", error)
          setDiscussions([])
        } else {
          // Get reply count for each discussion
          const discussionsWithCounts = await Promise.all(
            (data || []).map(async (discussion) => {
              const { count } = await supabase
                .from("discussion_replies")
                .select("*", { count: "exact", head: true })
                .eq("discussion_id", discussion.id)

              return {
                ...discussion,
                reply_count: count || 0,
              }
            }),
          )
          setDiscussions(discussionsWithCounts)
        }
      } catch (error) {
        console.error("Error fetching discussions:", error)
        setDiscussions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiscussions()
  }, [courseId, supabase])

  const filteredDiscussions = discussions.filter(
    (discussion) =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => router.push(`/dashboard/courses/${courseId}/discussions/create`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Discussion
        </Button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {discussions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No discussions yet</p>
            <p className="text-muted-foreground mb-6">Start a new discussion to engage with your peers.</p>
            <Button onClick={() => router.push(`/dashboard/courses/${courseId}/discussions/create`)}>
              <Plus className="mr-2 h-4 w-4" />
              Start First Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <Card
              key={discussion.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${discussion.is_pinned ? "border-primary/30" : ""}`}
              onClick={() => router.push(`/dashboard/courses/${courseId}/discussions/${discussion.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {discussion.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                      {discussion.title}
                    </CardTitle>
                    <CardDescription>
                      Started by {discussion.profiles?.first_name} {discussion.profiles?.last_name} •{" "}
                      {formatDateTime(discussion.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {discussion.tags &&
                      discussion.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">{discussion.content}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      <span className="text-sm">{discussion.reply_count} replies</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      <span className="text-sm">{(discussion.likes || []).length} likes</span>
                    </div>
                  </div>

                  <Avatar className="h-6 w-6">
                    <AvatarImage src={discussion.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {discussion.profiles?.first_name?.[0]}
                      {discussion.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
