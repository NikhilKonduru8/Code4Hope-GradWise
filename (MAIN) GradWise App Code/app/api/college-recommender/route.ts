import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const GEMINI_API_KEY = "APIKEY" // Calling Gemini API with API Key (removed here for privacy reasons)

export async function POST(request: NextRequest) {
  try {
    const { location, incomeBracket } = await request.json()

    console.log("Received request:", { location, incomeBracket })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, // fetching response from Gemini API
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { // Giving Gemini a prompt with specific formatting so that our code can retrieve the response to format it into cards.
                  text: `Provide exactly 5 specific college recommendations near ${location} for a student in the ${incomeBracket} income bracket. Focus on financial accessibility and strong support systems.

Format your response with exactly 5 colleges, each clearly separated and numbered:

**1. [College Name]**
Location: [City, State]
Type: [Public/Private]
Tuition: [Specific amounts]
Financial Aid: [Brief aid description]
Key Highlights:
• [Highlight 1]
• [Highlight 2] 
• [Highlight 3]
• [Highlight 4]

**2. [College Name]**
Location: [City, State]
Type: [Public/Private]
Tuition: [Specific amounts]
Financial Aid: [Brief aid description]
Key Highlights:
• [Highlight 1]
• [Highlight 2] 
• [Highlight 3]
• [Highlight 4]

**3. [College Name]**
Location: [City, State]
Type: [Public/Private]
Tuition: [Specific amounts]
Financial Aid: [Brief aid description]
Key Highlights:
• [Highlight 1]
• [Highlight 2] 
• [Highlight 3]
• [Highlight 4]

**4. [College Name]**
Location: [City, State]
Type: [Public/Private]
Tuition: [Specific amounts]
Financial Aid: [Brief aid description]
Key Highlights:
• [Highlight 1]
• [Highlight 2] 
• [Highlight 3]
• [Highlight 4]

**5. [College Name]**
Location: [City, State]
Type: [Public/Private]
Tuition: [Specific amounts]
Financial Aid: [Brief aid description]
Key Highlights:
• [Highlight 1]
• [Highlight 2] 
• [Highlight 3]
• [Highlight 4]

Focus on colleges that are:
- Financially accessible for the given income bracket
- Geographically accessible from the specified location
- Known for good financial aid packages
- Have strong support systems for diverse students

Provide exactly 5 colleges with no introductory text.`,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    const recommendations =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error generating college recommendations."

    console.log("Generated recommendations successfully")

    // Save recommendations to Supabase DB
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
        return NextResponse.json({ recommendations })
      }

      if (!user) {
        console.error("No user found")
        // Don't throw here - continue without saving
        return NextResponse.json({ recommendations })
      }

      console.log("User authenticated:", user.id)

      // Save the recommendations first (main functionality)
      const insertData = {
        user_id: user.id,
        location: location,
        income_bracket: incomeBracket,
        recommendations: recommendations,
      }

      console.log("Inserting recommendation data:", insertData)

      const { data: savedRecommendation, error: saveError } = await supabase
        .from("college_recommendations")
        .insert(insertData)
        .select()

      if (saveError) {
        console.error("Error saving college recommendations:", {
          error: saveError,
          code: saveError.code,
          message: saveError.message,
          details: saveError.details,
          hint: saveError.hint,
        })
        // Don't throw here - return recommendations anyway
        return NextResponse.json({
          recommendations,
          warning: "Recommendations generated but not saved to history",
        })
      }

      console.log("College recommendations saved successfully:", savedRecommendation)

      // Track progress (optional - don't fail if this doesn't work) to show on dashboard
      try {
        // Check if user_progress table exists first
        const { data: tableCheck, error: tableError } = await supabase.from("user_progress").select("id").limit(1)

        if (tableError && tableError.message.includes("does not exist")) {
          console.log("user_progress table doesn't exist yet - skipping progress tracking")
        } else {
          const progressData = {
            user_id: user.id,
            task_type: "college_recommendations",
            task_name: "College Recommendations Generated",
            completed: true,
            completion_date: new Date().toISOString(),
            data: { location, income_bracket: incomeBracket },
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

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("College recommender API error:", error)
    return NextResponse.json(
      {
        error: "Failed to get recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
