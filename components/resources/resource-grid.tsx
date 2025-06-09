import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Video, ImageIcon, File } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

interface Resource {
  id: string
  title: string
  description: string
  file_type: string
  file_size: number
  course_title: string
  uploaded_by: string
  uploaded_at: string
  download_count: number
  file_url: string
}

interface ResourceGridProps {
  resources: Resource[]
  userRole?: string
}

export function ResourceGrid({ resources, userRole }: ResourceGridProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("video")) return Video
    if (fileType.includes("image")) return ImageIcon
    if (fileType.includes("pdf") || fileType.includes("document")) return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!resources?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No resources found</h3>
        <p className="text-muted-foreground">
          {userRole === "instructor"
            ? "Upload your first resource to get started"
            : "No resources available at the moment"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => {
        const FileIcon = getFileIcon(resource.file_type)

        return (
          <Card key={resource.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="line-clamp-2 text-base">{resource.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{resource.course_title}</span>
                <Badge variant="outline">{resource.file_type}</Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(resource.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploaded:</span>
                  <span>{formatDateTime(resource.uploaded_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads:</span>
                  <span>{resource.download_count}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <a href={resource.file_url} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
