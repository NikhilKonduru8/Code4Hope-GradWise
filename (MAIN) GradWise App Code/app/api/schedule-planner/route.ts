import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const GEMINI_API_KEY = "APIKEY"

export async function POST(request: NextRequest) {
  try {
    const { timeframe, goal } = await request.json()

    console.log("Received schedule request:", { timeframe, goal })

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
                  text: `Create a detailed schedule over ${timeframe} months to help a student accomplish the goal: ${goal}. 

Please format the response with:
1. Weekly targets for each week
2. Daily action items that are specific and achievable
3. Milestones to track progress
4. Tips for staying on track

Make it practical and actionable for a high school student preparing for college.`,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    const schedule =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error creating your schedule."

    console.log("Generated schedule successfully")

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
        return NextResponse.json({ schedule })
      }

      if (!user) {
        console.error("No user found")
        // Don't throw here - continue without saving
        return NextResponse.json({ schedule })
      }

      console.log("User authenticated:", user.id)

      // Check if schedules table exists first
      const { data: tableCheck, error: tableError } = await supabase.from("schedules").select("id").limit(1)

      if (tableError && tableError.message.includes("does not exist")) {
        console.log("schedules table doesn't exist yet - skipping schedule save")
        return NextResponse.json({
          schedule,
          warning: "Schedule generated but not saved to history",
        })
      }

      // Save the schedule (main functionality)
      const insertData = {
        user_id: user.id,
        goal: goal,
        timeframe: Number.parseInt(timeframe),
        schedule_content: schedule,
      }

      console.log("Inserting schedule data:", insertData)

      const { data: savedSchedule, error: saveError } = await supabase.from("schedules").insert(insertData).select()

      if (saveError) {
        console.error("Error saving schedule:", {
          error: saveError,
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
        })
        // Don't throw here - return schedule anyway
        return NextResponse.json({
          schedule,
          warning: "Schedule generated but not saved to history",
        })
      }

      console.log("Schedule saved successfully:", savedSchedule)

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
            task_type: "schedule_planning",
            task_name: "Study Schedule Created",
            completed: true,
            completion_date: new Date().toISOString(),
            data: { goal, timeframe: Number.parseInt(timeframe) },
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

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Schedule planner API error:", error)
    return NextResponse.json(
      {
        error: "Failed to create schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
