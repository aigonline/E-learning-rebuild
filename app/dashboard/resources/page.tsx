import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ResourceGrid } from "@/components/resources/resource-grid"
import { ResourceFilters } from "@/components/resources/resource-filters"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

export default async function ResourcesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get resources
  const { data: resources } = await supabase.rpc("get_user_resources", {
    user_id: session.user.id,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Access course materials, documents, and learning resources</p>
        </div>
        {profile?.role === "instructor" && (
          <Link href="/dashboard/resources/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          </Link>
        )}
      </div>

      <ResourceFilters />
      <ResourceGrid resources={resources || []} userRole={profile?.role} />
    </div>
  )
}
