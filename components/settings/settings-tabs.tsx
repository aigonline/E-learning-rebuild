"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "./profile-settings"
import { AccountSettings } from "./account-settings"
import { NotificationSettings } from "./notification-settings"
import { SecuritySettings } from "./security-settings"
import { AppearanceSettings } from "./appearance-settings"
import type { User } from "@supabase/auth-helpers-nextjs"

interface SettingsTabsProps {
  user: User
  profile: any
}

export function SettingsTabs({ user, profile }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="account">
        <AccountSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings user={user} profile={profile} />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettings user={user} />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  )
}
