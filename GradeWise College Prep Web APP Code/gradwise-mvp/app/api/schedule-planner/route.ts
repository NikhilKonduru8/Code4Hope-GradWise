import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyC0avtaS2ETt963MJpR5G96fzwIVYLwPn4"

export async function POST(request: NextRequest) {
  try {
    const { timeframe, goal } = await request.json()

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

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
