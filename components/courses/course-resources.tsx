"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText, Video, ImageIcon, File, Download, Search, Loader2, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateTime, formatFileSize } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CourseResourcesProps {
  courseId: string
  isInstructor: boolean
  userRole: string
}

export function CourseResources({ courseId, isInstructor, userRole }: CourseResourcesProps) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("resources")
          .select(`
            *,
            profiles:added_by(first_name, last_name)
          `)
          .eq("course_id", courseId)
          .order("created_at", { ascending: false })

        if (error) {
          console.log("Error fetching resources:", error)
          setResources([])
        } else {
          setResources(data || [])
        }
      } catch (error) {
        console.error("Error fetching resources:", error)
        setResources([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [courseId, supabase])

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-10 w-10 text-red-500" />
    if (type.includes("video")) return <Video className="h-10 w-10 text-blue-500" />
    if (type.includes("image")) return <ImageIcon className="h-10 w-10 text-green-500" />
    return <File className="h-10 w-10 text-gray-500" />
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || resource.type === typeFilter
    return matchesSearch && matchesType
  })

  const groupedResources = filteredResources.reduce(
    (acc, resource) => {
      const category = resource.category || "other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(resource)
      return acc
    },
    {} as Record<string, any[]>,
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
        {isInstructor && (
          <Button onClick={() => (window.location.href = `/dashboard/courses/${courseId}/resources/upload`)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF Documents</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No resources yet</p>
            <p className="text-muted-foreground mb-6">
              {isInstructor
                ? "Upload resources to share with your students."
                : "No resources have been added to this course yet."}
            </p>
            {isInstructor && (
              <Button onClick={() => (window.location.href = `/dashboard/courses/${courseId}/resources/upload`)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload First Resource
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            {Object.keys(groupedResources).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden">
                  <div className="p-4 flex items-center space-x-4">
                    {getFileIcon(resource.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-2">
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Added by {resource.profiles.first_name} {resource.profiles.last_name}
                      </p>
                      <p>{formatDateTime(resource.created_at)}</p>
                      <p>{formatFileSize(resource.file_data?.fileSize || 0)}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 flex justify-between items-center">
                    <span className="text-xs">{resource.view_count || 0} views</span>
                    <Button size="sm" variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {Object.entries(groupedResources).map(([category, categoryResources]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden">
                    <div className="p-4 flex items-center space-x-4">
                      {getFileIcon(resource.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
                      </div>
                    </div>
                    <div className="px-4 pb-2">
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Added by {resource.profiles.first_name} {resource.profiles.last_name}
                        </p>
                        <p>{formatDateTime(resource.created_at)}</p>
                        <p>{formatFileSize(resource.file_data?.fileSize || 0)}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 flex justify-between items-center">
                      <span className="text-xs">{resource.view_count || 0} views</span>
                      <Button size="sm" variant="secondary">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
