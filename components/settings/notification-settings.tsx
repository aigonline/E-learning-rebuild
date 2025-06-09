"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@supabase/auth-helpers-nextjs"

interface NotificationSettingsProps {
  user: User
  profile: any
}

export function NotificationSettings({ user, profile }: NotificationSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    assignment_due: profile?.notifications?.assignment_due ?? true,
    grade_posted: profile?.notifications?.grade_posted ?? true,
    discussion_reply: profile?.notifications?.discussion_reply ?? true,
    course_announcement: profile?.notifications?.course_announcement ?? true,
    new_message: profile?.notifications?.new_message ?? true,
    weekly_summary: profile?.notifications?.weekly_summary ?? false,
  })
  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save notification settings logic here
      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const notificationOptions = [
    {
      key: "assignment_due",
      title: "Assignment Due Dates",
      description: "Get notified when assignments are due soon",
    },
    {
      key: "grade_posted",
      title: "Grades Posted",
      description: "Get notified when new grades are available",
    },
    {
      key: "discussion_reply",
      title: "Discussion Replies",
      description: "Get notified when someone replies to your discussions",
    },
    {
      key: "course_announcement",
      title: "Course Announcements",
      description: "Get notified about important course updates",
    },
    {
      key: "new_message",
      title: "New Messages",
      description: "Get notified when you receive new messages",
    },
    {
      key: "weekly_summary",
      title: "Weekly Summary",
      description: "Receive a weekly summary of your course activity",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{option.title}</Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <Switch
                checked={notifications[option.key as keyof typeof notifications]}
                onCheckedChange={(checked) => setNotifications({ ...notifications, [option.key]: checked })}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Notification Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
