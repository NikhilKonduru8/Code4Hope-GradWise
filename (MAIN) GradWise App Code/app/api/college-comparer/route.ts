import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "APIKEY"

export async function POST(request: NextRequest) {
  try {
    const { colleges, userProfile } = await request.json()

    if (!colleges || colleges.length < 2) {
      return NextResponse.json({ error: "At least 2 colleges are required for comparison" }, { status: 400 })
    }

    console.log("Comparing colleges:", colleges)
    console.log("User profile:", userProfile)

    const userContext = userProfile
      ? `User is located in ${userProfile.location} with income bracket ${userProfile.income_bracket}.`
      : "No user profile information available."

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
                  text: `Compare these colleges and provide detailed information for each: ${colleges.join(", ")}

${userContext}

For each college, provide the following information in this EXACT JSON format:

{
  "comparison": [
    {
      "name": "[Exact College Name]",
      "rank": "[National ranking, e.g., '#15' or 'Top 50']",
      "acceptanceRate": "[Percentage, e.g., '12%']",
      "tuition": "[Annual tuition, e.g., '$52,000']",
      "totalCost": "[Total annual cost including room/board, e.g., '$75,000']",
      "medianIncome": "[10-year post-graduation median income, e.g., '$85,000']",
      "location": "[City, State]",
      "type": "[Public/Private]",
      "enrollment": "[Total enrollment, e.g., '15,000']",
      "satRange": "[SAT range, e.g., '1450-1570']",
      "gpaAverage": "[Average GPA, e.g., '3.9']",
      "graduationRate": "[4-year graduation rate, e.g., '95%']",
      "personalizedPros": [
        "[Specific advantage based on user's location/income]",
        "[Another specific advantage]",
        "[Third advantage]"
      ],
      "personalizedCons": [
        "[Specific concern based on user's location/income]",
        "[Another specific concern]",
        "[Third concern]"
      ],
      "overallScore": "[Score out of 10 based on academics, value, outcomes, e.g., '8.5']"
    }
  ]
}

Important guidelines:
- Use real, accurate data for well-known colleges
- For personalized pros/cons, consider the user's location (distance, in-state vs out-of-state tuition) and income bracket (financial aid opportunities, affordability)
- Overall score should consider academic quality, value for money, career outcomes, and fit for the user's profile
- Provide exactly 3 personalized pros and 3 personalized cons for each college
- Be specific and actionable in the pros/cons
- Return ONLY the JSON object, no additional text

Colleges to compare: ${colleges.join(", ")}`,
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
        error: "Failed to get college comparison data",
      })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      return NextResponse.json({
        error: "No response from AI service",
      })
    }

    console.log("Raw AI response:", aiResponse)

    try {
      // Clean the response to extract JSON
      let cleanedResponse = aiResponse.trim()

      // Remove any markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "")

      // Find the JSON object
      const jsonStart = cleanedResponse.indexOf("{")
      const jsonEnd = cleanedResponse.lastIndexOf("}") + 1

      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("No JSON found in response")
      }

      const jsonString = cleanedResponse.substring(jsonStart, jsonEnd)
      const parsedData = JSON.parse(jsonString)

      console.log("Parsed comparison data:", parsedData)

      if (!parsedData.comparison || !Array.isArray(parsedData.comparison)) {
        throw new Error("Invalid comparison data structure")
      }

      return NextResponse.json(parsedData)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.error("Raw response:", aiResponse)

      return NextResponse.json({
        error: "Failed to parse college comparison data",
        details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
      })
    }
  } catch (error) {
    console.error("College comparer API error:", error)
    return NextResponse.json(
      {
        error: "Failed to compare colleges",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
