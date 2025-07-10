import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://edbkkednmottpactcngg.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYmtrZWRubW90dHBhY3RjbmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzQ0MDEsImV4cCI6MjA2NjcxMDQwMX0.CdNmfHw4ZYNVBM6lm-TTENmE7SiuHnt00P_CEibJ4oA",
  )
}
