import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const GEMINI_API_KEY = "AIzaSyCA5TT9BPfwtAqoiq57sKC5dYXgEMwhWrk"

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful college counselor assistant. Please provide a concise, focused response to this student's question about college admissions, applications, or related topics. Keep your response under 200 words and be direct and actionable.

Student question: ${message}

Guidelines:
- Be concise and to the point
- Provide specific, actionable advice
- Use bullet points when helpful
- Focus on the most important information
- Avoid lengthy explanations unless absolutely necessary`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      console.error("Gemini API error:", response.status, response.statusText)
      return NextResponse.json({
        response:
          "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment.",
      })
    }

    const data = await response.json()
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error processing your request."

    // Track counselor session in user_progress for dashboard stats (with error handling)
    try {
      const supabase = await createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Error getting user in API:", userError)
      }

      if (user) {
        console.log("Tracking session for user:", user.id, "Session ID:", sessionId)

        // Check if chat_sessions table exists first
        const { data: tableCheck, error: tableError } = await supabase.from("chat_sessions").select("id").limit(1)

        if (tableError && tableError.message.includes("does not exist")) {
          console.log("chat_sessions table doesn't exist yet - skipping session tracking")
        } else {
          // Check if this is the first message in this session
          const { data: existingSession, error: sessionError } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("user_id", user.id)
            .eq("session_id", sessionId)
            .limit(1)

          if (sessionError) {
            console.error("Error checking existing session:", sessionError)
          }

          // Only create a progress entry for new sessions
          if (!existingSession || existingSession.length === 0) {
            const { data: progressData, error: progressError } = await supabase.from("user_progress").insert({
              user_id: user.id,
              task_type: "virtual_counselor",
              task_name: "Counselor Session Started",
              completed: true,
              completion_date: new Date().toISOString(),
              data: { session_id: sessionId, first_question: message },
            })

            if (progressError) {
              console.error("Error saving progress:", progressError)
            } else {
              console.log("Progress saved:", progressData)
            }
          }
        }
      }
    } catch (dbError) {
      console.error("Error saving counselor session:", dbError)
      // Continue anyway - don't fail the request because of DB issues
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Virtual counselor error:", error)
    return NextResponse.json(
      {
        response: "I apologize, but I encountered an error. Please try again.",
      },
      { status: 500 },
    )
  }
}
