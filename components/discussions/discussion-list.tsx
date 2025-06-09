import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Clock } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"

interface Discussion {
  id: string
  title: string
  content: string
  course_title: string
  author_name: string
  author_avatar: string
  created_at: string
  reply_count: number
  like_count: number
  is_pinned: boolean
  last_activity: string
}

interface DiscussionListProps {
  discussions: Discussion[]
}

export function DiscussionList({ discussions }: DiscussionListProps) {
  if (!discussions?.length) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No discussions found</h3>
        <p className="text-muted-foreground">Start a new discussion to engage with your peers</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <Card key={discussion.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="flex items-center gap-2">
                  {discussion.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                  {discussion.title}
                </CardTitle>
                <CardDescription>{discussion.course_title}</CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={discussion.author_avatar || "/placeholder.svg"} />
                <AvatarFallback>{discussion.author_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{discussion.author_name}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{formatDateTime(discussion.created_at)}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">{discussion.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {discussion.reply_count} replies
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  {discussion.like_count} likes
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Last activity {formatDateTime(discussion.last_activity)}
                </div>
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/discussions/${discussion.id}`}>View Discussion</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
