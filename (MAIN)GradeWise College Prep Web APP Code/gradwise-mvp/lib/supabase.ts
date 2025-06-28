import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://edbkkednmottpactcngg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkYmtrZWRubW90dHBhY3RjbmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMzQ0MDEsImV4cCI6MjA2NjcxMDQwMX0.CdNmfHw4ZYNVBM6lm-TTENmE7SiuHnt00P_CEibJ4oA",
  )
}
