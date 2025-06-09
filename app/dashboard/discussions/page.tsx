import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DiscussionList } from "@/components/discussions/discussion-list"
import { DiscussionFilters } from "@/components/discussions/discussion-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DiscussionsPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get discussions
  const { data: discussions } = await supabase.rpc("get_user_discussions", {
    user_id: session.user.id,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground">Participate in course discussions and collaborate with peers</p>
        </div>
        <Link href="/dashboard/discussions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Start Discussion
          </Button>
        </Link>
      </div>

      <DiscussionFilters />
      <DiscussionList discussions={discussions || []} />
    </div>
  )
}
