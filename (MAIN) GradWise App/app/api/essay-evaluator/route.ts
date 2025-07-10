import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const GEMINI_API_KEY = "AIzaSyCA5TT9BPfwtAqoiq57sKC5dYXgEMwhWrk"

export async function POST(request: NextRequest) {
  try {
    const { essayText } = await request.json()

    if (!essayText || !essayText.trim()) {
      return NextResponse.json({ error: "No essay text provided" }, { status: 400 })
    }

    console.log("Received essay evaluation request, word count:", essayText.trim().split(/\s+/).length)

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
                  text: `Evaluate this college essay and provide concise, actionable feedback in under 300 words.

Essay: "${essayText}"

Provide feedback in this exact format:

**Overall Score: X/10**

**Strengths:**
• [2-3 specific strengths]

**Areas for Improvement:**
• [2-3 specific issues to fix]

**Key Suggestions:**
• [2-3 actionable recommendations]

**College Fit:** [1-2 sentences on how well this works as a college essay]

Keep it concise, specific, and actionable. Focus on the most important points only.`,
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
        feedback:
          "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment.",
      })
    }

    const data = await response.json()
    const feedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error evaluating your essay."

    console.log("Generated essay feedback successfully")

    // Save to database with improved error handling
    try {
      const supabase = await createClient()
      console.log("Created Supabase client")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Error getting user:", userError)
        // Don't throw here - continue without saving
        return NextResponse.json({ feedback })
      }

      if (!user) {
        console.error("No user found")
        // Don't throw here - continue without saving
        return NextResponse.json({ feedback })
      }

      console.log("User authenticated:", user.id)

      // Check if essays table exists first
      const { data: tableCheck, error: tableError } = await supabase.from("essays").select("id").limit(1)

      if (tableError && tableError.message.includes("does not exist")) {
        console.log("essays table doesn't exist yet - skipping essay save")
        return NextResponse.json({
          feedback,
          warning: "Essay feedback generated but not saved to history. Please run the SQL scripts to enable saving.",
        })
      }

      // Save the essay analysis (main functionality)
      const insertData = {
        user_id: user.id,
        title: "Essay Analysis",
        ai_feedback: feedback,
        status: "completed",
      }

      console.log("Inserting essay data:", insertData)

      const { data: savedEssay, error: saveError } = await supabase.from("essays").insert(insertData).select()

      if (saveError) {
        console.error("Error saving essay:", {
          error: saveError,
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
        })
        // Don't throw here - return feedback anyway
        return NextResponse.json({
          feedback,
          warning: "Essay feedback generated but not saved to history",
        })
      }

      console.log("Essay saved successfully:", savedEssay)

      // Track progress (optional - don't fail if this doesn't work)
      try {
        // Check if user_progress table exists first
        const { data: progressTableCheck, error: progressTableError } = await supabase
          .from("user_progress")
          .select("id")
          .limit(1)

        if (progressTableError && progressTableError.message.includes("does not exist")) {
          console.log("user_progress table doesn't exist yet - skipping progress tracking")
        } else {
          const progressData = {
            user_id: user.id,
            task_type: "essay_analysis",
            task_name: "Essay Evaluated",
            completed: true,
            completion_date: new Date().toISOString(),
            data: { word_count: essayText.trim().split(/\s+/).length },
          }

          console.log("Inserting progress data:", progressData)

          const { data: savedProgress, error: progressError } = await supabase
            .from("user_progress")
            .insert(progressData)
            .select()

          if (progressError) {
            console.error("Error saving progress (non-critical):", {
              error: progressError,
              code: progressError.code,
              message: progressError.message,
              details: progressError.details,
              hint: progressError.hint,
            })
            // Don't throw - this is optional
          } else {
            console.log("Progress saved successfully:", savedProgress)
          }
        }
      } catch (progressError) {
        console.error("Progress tracking failed (non-critical):", progressError)
        // Continue anyway
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      // Continue anyway - don't fail the request because of DB issues
      if (dbError instanceof Error) {
        console.error("DB Error details:", dbError.message)
      }
    }

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Essay evaluator API error:", error)
    return NextResponse.json(
      {
        feedback: "I apologize, but I encountered an error evaluating your essay. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
