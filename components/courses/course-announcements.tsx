"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Megaphone, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CourseAnnouncementsProps {
  courseId: string
  isInstructor: boolean
  userRole: string
}

export function CourseAnnouncements({ courseId, isInstructor, userRole }: CourseAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" })
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select(`
            *,
            profiles:author_id(first_name, last_name, avatar_url)
          `)
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })

        if (error) {
          console.log("Error fetching announcements:", error)
          setAnnouncements([])
        } else {
          setAnnouncements(data || [])
        }
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [courseId, supabase])

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a title and content for the announcement",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create an announcement")
      }

      const { data, error } = await supabase
        .from("announcements")
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          course_id: courseId,
          author_id: user.id,
        })
        .select(`
          *,
          profiles:author_id(first_name, last_name, avatar_url)
        `)

      if (error) throw error

      setAnnouncements([data[0], ...announcements])
      setNewAnnouncement({ title: "", content: "" })
      setIsCreating(false)

      toast({
        title: "Announcement created",
        description: "Your announcement has been posted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id)

      if (error) throw error

      setAnnouncements(announcements.filter((announcement) => announcement.id !== id))

      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isInstructor && !isCreating && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      )}

      {isInstructor && isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
            <CardDescription>Share important information with your students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                className="w-full p-2 border rounded-md"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Announcement title"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Write your announcement here..."
                rows={5}
                disabled={submitting}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 && !isCreating ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No announcements yet</p>
            <p className="text-muted-foreground mb-6">
              {isInstructor
                ? "Create announcements to keep your students informed."
                : "There are no announcements for this course yet."}
            </p>
            {isInstructor && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Announcement
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={announcement.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {announcement.profiles?.first_name?.[0]}
                        {announcement.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription>
                        {announcement.profiles?.first_name} {announcement.profiles?.last_name} •{" "}
                        {formatDateTime(announcement.created_at)}
                      </CardDescription>
                    </div>
                  </div>

                  {(isInstructor || userRole === "admin") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteAnnouncement(announcement.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{announcement.content}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
