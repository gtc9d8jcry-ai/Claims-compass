import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@/lib/supabase'
import { z } from 'zod'
import { profileSchema } from '@/lib/schemas/profile'
import { Button } from '@/components/ui/button' // Adjust based on your UI library (Shadcn or similar)
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner' // Or your preferred toast library
import { Loader2, User, Bell, Shield, Trash2, LogOut } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const user = useUser()
  const supabase = useSupabaseClient()
  
  const [profile, setProfile] = useState<z.infer<typeof profileSchema>>({
    fullName: '',
    nationality: '',
    dateOfBirth: '',
    // Add other fields from your schema as needed
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Notification preferences (local state for demo; persist to Supabase if needed)
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    claimAlerts: true,
    appealReminders: true,
    marketing: false,
  })

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      } else if (error && error.code !== 'PGRST116') {
        toast.error('Failed to load profile')
      }
      setLoading(false)
    }
    loadProfile()
  }, [user, supabase])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    const validated = profileSchema.safeParse(profile)
    
    if (!validated.success) {
      toast.error('Please check your information')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...validated.data, updated_at: new Date().toISOString() })

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Router will handle redirect via protected layout
  }

  const handleDeleteAccount = async () => {
    if (!confirm('This action is permanent. Delete account?')) return
    // Implement account deletion (soft delete recommended + Supabase policy)
    toast.info('Account deletion flow started (implement full logic)')
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 pb-20 max-w-2xl mx-auto"> {/* pb-20 for bottom nav */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                {/* Reuse your existing NationalitySelect component */}
                {/* <NationalitySelect value={profile.nationality} onChange={...} /> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                {/* Reuse DateWheelPicker or native date input */}
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                />
              </div>
              {/* Add more fields from your profile schema */}
            </div>
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="cursor-pointer">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <Switch
                id={key}
                checked={enabled}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, [key]: checked })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Password change coming soon')}>
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Export My Data
          </Button>
          <Button 
            variant="destructive" 
            className="w-full justify-start" 
            onClick={handleDeleteAccount}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="outline" 
            className="w-full text-red-600 hover:bg-red-50" 
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Claims Compass • Version 0.1 • Data secured with Supabase
      </p>
    </div>
  )
}