"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Lock, Save, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface ProfileData {
  full_name: string
  grade_level: string
  location: string
  income_bracket: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    grade_level: "",
    location: "",
    income_bracket: "",
  })
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profileExists, setProfileExists] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Error getting user:", userError)
        setMessage({ type: "error", text: "Unable to load user information. Please try refreshing the page." })
        return
      }

      console.log("User loaded:", user.id)
      setUser(user)

      // Check if profiles table exists and load profile data
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.log("Profile error:", profileError)

          if (profileError.message.includes("does not exist")) {
            console.log("Profiles table doesn't exist yet")
            setMessage({
              type: "error",
              text: "Profile database not set up yet. Please run the SQL scripts to enable profile management.",
            })
          } else if (profileError.code === "PGRST116") {
            // No profile found, use user metadata
            console.log("No profile found, using user metadata")
            setProfileExists(false)
          } else {
            console.error("Unexpected profile error:", profileError)
          }

          // Use user metadata as fallback
          setProfileData({
            full_name: user.user_metadata?.full_name || "",
            grade_level: user.user_metadata?.grade_level || "",
            location: user.user_metadata?.location || "",
            income_bracket: user.user_metadata?.income_bracket || "",
          })
        } else {
          console.log("Profile loaded successfully:", profile)
          setProfileExists(true)
          setProfileData({
            full_name: profile.full_name || "",
            grade_level: profile.grade_level || "",
            location: profile.location || "",
            income_bracket: profile.income_bracket || "",
          })
        }
      } catch (tableError) {
        console.error("Error checking profiles table:", tableError)
        setMessage({
          type: "error",
          text: "Unable to access profile database. Please contact support.",
        })

        // Use user metadata as fallback
        setProfileData({
          full_name: user.user_metadata?.full_name || "",
          grade_level: user.user_metadata?.grade_level || "",
          location: user.user_metadata?.location || "",
          income_bracket: user.user_metadata?.income_bracket || "",
        })
      }
    } catch (error) {
      console.error("Error in loadProfile:", error)
      setMessage({ type: "error", text: "Failed to load profile. Please try refreshing the page." })
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: "error", text: "User not found. Please try refreshing the page." })
      setLoading(false)
      return
    }

    console.log("Starting profile update for user:", user.id)
    console.log("Profile data to update:", profileData)

    try {
      const supabase = createClient()

      // First, try to update user metadata (this should always work)
      console.log("Updating user metadata...")
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          grade_level: profileData.grade_level,
          location: profileData.location,
          income_bracket: profileData.income_bracket,
        },
      })

      if (metadataError) {
        console.error("Metadata update error:", metadataError)
        throw new Error(`Failed to update user metadata: ${metadataError.message}`)
      }

      console.log("User metadata updated successfully")

      // Then try to update/insert profile in database (this might fail if table doesn't exist)
      try {
        console.log("Updating profile in database...")
        const profileUpdateData = {
          id: user.id,
          full_name: profileData.full_name,
          grade_level: profileData.grade_level,
          location: profileData.location,
          income_bracket: profileData.income_bracket,
          updated_at: new Date().toISOString(),
        }

        console.log("Profile update data:", profileUpdateData)

        const { data: profileResult, error: profileError } = await supabase
          .from("profiles")
          .upsert(profileUpdateData, {
            onConflict: "id",
            ignoreDuplicates: false,
          })
          .select()

        if (profileError) {
          console.error("Profile database update error:", profileError)
          console.error("Error details:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          })

          if (profileError.message.includes("does not exist")) {
            console.log("Profiles table doesn't exist - metadata updated successfully though")
            setMessage({
              type: "success",
              text: "Profile updated successfully! (Database table not available, but changes are saved to your account.)",
            })
          } else {
            throw new Error(`Database update failed: ${profileError.message}`)
          }
        } else {
          console.log("Profile database updated successfully:", profileResult)
          setProfileExists(true)
          setMessage({ type: "success", text: "Profile updated successfully!" })
        }
      } catch (dbError) {
        console.error("Database operation failed:", dbError)
        // Don't throw here - metadata was updated successfully
        setMessage({
          type: "success",
          text: "Profile updated successfully! (Some database features may not be available.)",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setMessage({ type: "error", text: `Failed to update profile: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." })
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." })
      setPasswordLoading(false)
      return
    }

    try {
      const supabase = createClient()

      console.log("Updating password...")
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        console.error("Password update error:", error)
        throw new Error(error.message)
      }

      console.log("Password updated successfully")
      setPasswordMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setPasswordMessage({ type: "error", text: `Failed to update password: ${errorMessage}` })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select
                  value={profileData.grade_level}
                  onValueChange={(value) => setProfileData({ ...profileData, grade_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (State/ZIP)</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="e.g., CA or 90210"
                />
              </div>

              <div className="space-y-2">
                <Label>Income Bracket</Label>
                <Select
                  value={profileData.income_bracket}
                  onValueChange={(value) => setProfileData({ ...profileData, income_bracket: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<20k">Less than $20,000</SelectItem>
                    <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                    <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                    <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                    <SelectItem value="80k+">$80,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                  {message.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password for security</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordMessage && (
                <Alert variant={passwordMessage.type === "error" ? "destructive" : "default"}>
                  {passwordMessage.type === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{passwordMessage.text}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {passwordLoading ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and registration information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="text-sm">{user?.email}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <div className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Last Sign In</Label>
              <div className="text-sm">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Confirmed</Label>
              <div className="text-sm">{user?.email_confirmed_at ? "Yes" : "No"}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Profile Database</Label>
              <div className="text-sm">{profileExists ? "Connected" : "Using account metadata"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information (only show in development) */}
      {process.env.NODE_ENV === "development" && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Development information (not visible in production)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>User ID:</strong> {user?.id}
              </div>
              <div>
                <strong>Profile Exists:</strong> {profileExists ? "Yes" : "No"}
              </div>
              <div>
                <strong>Current Profile Data:</strong>
              </div>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
