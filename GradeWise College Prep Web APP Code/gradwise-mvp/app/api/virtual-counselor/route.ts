import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyC0avtaS2ETt963MJpR5G96fzwIVYLwPn4"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

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
                  text: `Please help this user go through their question regarding the college admission process and other general things around their problem unless the question is off-topic and not relevant. User question: ${message}`,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I encountered an error processing your request."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 })
  }
}
