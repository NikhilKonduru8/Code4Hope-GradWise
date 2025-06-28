import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyC0avtaS2ETt963MJpR5G96fzwIVYLwPn4"

export async function POST(request: NextRequest) {
  try {
    const { essayText } = await request.json()

    if (!essayText || !essayText.trim()) {
      return NextResponse.json({ error: "No essay text provided" }, { status: 400 })
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
                  text: `Evaluate this college essay and provide detailed feedback. Also mention what they did well. 

Essay: "${essayText}"

Please provide:
1. **Overall Assessment** - General impression and effectiveness
2. **Strengths** - What works well in the essay
3. **Areas for Improvement** - Specific issues to address
4. **Content & Structure** - Organization, flow, and argument development
5. **Writing Style** - Voice, tone, and clarity
6. **Grammar & Mechanics** - Technical writing issues
7. **College Application Fit** - How well it serves as a college essay
8. **Specific Suggestions** - Actionable recommendations for revision

Be constructive, encouraging, and provide specific examples from the text when possible. Format your response with clear headings and bullet points for easy reading.`,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    const feedback =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error evaluating your essay."

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to evaluate essay" }, { status: 500 })
  }
}
