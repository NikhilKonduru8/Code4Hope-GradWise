import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyC0avtaS2ETt963MJpR5G96fzwIVYLwPn4"

export async function POST(request: NextRequest) {
  try {
    const { location, incomeBracket } = await request.json()

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
                  text: `Suggest suitable colleges near ${location} for a student in the ${incomeBracket} income bracket. Consider financial aid availability, cost, and accessibility.

Please provide:
1. 5-8 specific college recommendations
2. For each college, include:
   - Name and location
   - Why it's a good fit for this income bracket
   - Available financial aid programs
   - Approximate costs and net price
   - Academic programs and strengths
   - Application requirements and deadlines

Focus on colleges that are:
- Financially accessible for the given income bracket
- Geographically accessible from the specified location
- Known for good financial aid packages
- Have strong support systems for first-generation college students

Format the response clearly with headers and bullet points for easy reading.`,
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

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 })
  }
}
