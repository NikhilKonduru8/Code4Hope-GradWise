"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Home,
  FileText,
  DollarSign,
  GraduationCap,
  MessageCircle,
  Calendar,
  BookOpen,
  MapPin,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react"
import { createClient } from "@/lib/supabase"

const menuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Virtual Counselor",
    url: "/dashboard/virtual-counselor",
    icon: MessageCircle,
  },
  {
    title: "Schedule Planner",
    url: "/dashboard/schedule-planner",
    icon: Calendar,
  },
  {
    title: "Essay Evaluator",
    url: "/dashboard/essay-evaluator",
    icon: FileText,
  },
  {
    title: "College Recommender",
    url: "/dashboard/college-recommender",
    icon: MapPin,
  },
]

const resourceItems = [
  {
    title: "Common App Guide",
    url: "/dashboard/common-app",
    icon: BookOpen,
  },
  {
    title: "Financial Aid (FAFSA)",
    url: "/dashboard/financial-aid",
    icon: DollarSign,
  },
  {
    title: "Admissions Process",
    url: "/dashboard/admissions-process",
    icon: GraduationCap,
  },
]

export function AppSidebar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold">GradWise</h2>
            <p className="text-xs text-muted-foreground">College Prep Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User />
                  <span>{user?.user_metadata?.full_name || "User"}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <a href="/dashboard/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
