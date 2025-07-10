"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, FileText, MessageCircle, GraduationCap, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

interface DashboardStats {
  essaysAnalyzed: number
  counselorSessions: number
  schedulesCreated: number
  collegeRecommendations: number
  tasksCompleted: number
  totalTasks: number
  totalChatSessions: number
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    essaysAnalyzed: 0,
    counselorSessions: 0,
    schedulesCreated: 0,
    collegeRecommendations: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    totalChatSessions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        setUser(user)

        // Get user progress data
        const { data: progressData } = await supabase.from("user_progress").select("*").eq("user_id", user.id)

        // Get essays data
        const { data: essaysData } = await supabase.from("essays").select("*").eq("user_id", user.id)

        // Get schedules data
        const { data: schedulesData } = await supabase.from("schedules").select("*").eq("user_id", user.id)

        // Get college recommendations data
        const { data: recommendationsData } = await supabase
          .from("college_recommendations")
          .select("*")
          .eq("user_id", user.id)

        // Get chat sessions data (count unique sessions)
        const { data: chatSessionsData } = await supabase
          .from("chat_sessions")
          .select("session_id")
          .eq("user_id", user.id)

        // Get profile data
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        // Calculate stats
        const essaysAnalyzed = essaysData?.length || 0
        const schedulesCreated = schedulesData?.length || 0
        const collegeRecommendations = recommendationsData?.length || 0

        // Count unique chat sessions
        const uniqueSessions = new Set(chatSessionsData?.map((session) => session.session_id) || [])
        const totalChatSessions = uniqueSessions.size

        // Calculate counselor sessions from progress data (for backward compatibility)
        const counselorSessionsFromProgress =
          progressData?.filter((p) => p.task_type === "virtual_counselor")?.length || 0

        // Use the higher count between chat sessions and progress entries
        const counselorSessions = Math.max(totalChatSessions, counselorSessionsFromProgress)

        // Calculate profile completion
        let profileCompletion = 0
        if (profileData) {
          const fields = ["full_name", "grade_level", "location", "income_bracket"]
          const completedFields = fields.filter((field) => profileData[field])
          profileCompletion = (completedFields.length / fields.length) * 100
        }

        // Calculate task completion
        const completedTasks = progressData?.filter((p) => p.completed)?.length || 0
        const totalTasks = progressData?.length || 0

        const stats = {
          essaysAnalyzed,
          counselorSessions,
          schedulesCreated,
          collegeRecommendations,
          tasksCompleted: completedTasks,
          totalTasks,
          totalChatSessions,
        }

        setStats(stats)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to GradWise</h2>
          <p className="text-muted-foreground">Loading your personalized dashboard...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
        </h2>
        <p className="text-muted-foreground">Here's your college preparation progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essays Analyzed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.essaysAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.essaysAnalyzed > 0 ? "AI feedback provided" : "Start analyzing your essays"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Counselor Sessions</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.counselorSessions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.counselorSessions > 0 ? `${stats.totalChatSessions} chat sessions` : "Ask your first question"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedules Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.schedulesCreated}</div>
            <p className="text-xs text-muted-foreground">
              {stats.schedulesCreated > 0 ? "Study plans active" : "Create your first schedule"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">College Matches</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collegeRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.collegeRecommendations > 0 ? "Recommendations found" : "Find your perfect match"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>College Prep Progress</CardTitle>
            <CardDescription>Track your journey to college admission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Virtual Counseling</span>
                <span>{Math.min(Math.round((stats.counselorSessions / 5) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((stats.counselorSessions / 5) * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Essay Analysis</span>
                <span>{Math.min(Math.round((stats.essaysAnalyzed / 5) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((stats.essaysAnalyzed / 5) * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Schedule Planning</span>
                <span>{Math.min(Math.round((stats.schedulesCreated / 5) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((stats.schedulesCreated / 5) * 100, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>College Research</span>
                <span>{Math.min(Math.round((stats.collegeRecommendations / 5) * 100), 100)}%</span>
              </div>
              <Progress value={Math.min((stats.collegeRecommendations / 5) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these essential tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/virtual-counselor" className="block">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Ask Virtual Counselor</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.counselorSessions > 0
                      ? `${stats.counselorSessions} sessions completed`
                      : "Get personalized advice"}
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/essay-evaluator" className="block">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Analyze Your Essay</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.essaysAnalyzed > 0 ? `${stats.essaysAnalyzed} essays analyzed` : "Get AI-powered feedback"}
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/schedule-planner" className="block">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Create Study Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.schedulesCreated > 0
                      ? `${stats.schedulesCreated} schedules created`
                      : "Plan your prep timeline"}
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/college-recommender" className="block">
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <GraduationCap className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Find Colleges</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.collegeRecommendations > 0
                      ? `${stats.collegeRecommendations} matches found`
                      : "Discover perfect matches"}
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {stats.totalTasks === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 Get Started</CardTitle>
            <CardDescription>Complete these steps to unlock your full college prep potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Complete Your Profile</p>
                  <p className="text-xs text-muted-foreground">Add your grade level and location</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Explore Resources</p>
                  <p className="text-xs text-muted-foreground">Check out our guides and tools</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
