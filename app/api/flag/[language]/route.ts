import type { NextRequest } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { language: string } }) {
  const language = params.language

  try {
    // Use AI to determine the country and its ISO code based on the language
    const { text: result } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Given the language "${language}", provide the most likely country where this language is predominantly spoken and its ISO 3166-1 alpha-2 country code. Respond in the format: "Country Name|cc" where 'cc' is the lowercase two-letter country code as ISO 3166-1 format. For example for Japanese, we should get "Japan|jp", for English it's probably "United States|us".`,
    })

    // Split the result into country and country code
    const [country, countryCode] = result.split("|")

    if (!country || !countryCode) {
      throw new Error("Invalid AI response format")
    }

    // Construct the flag URL using the Flagpedia API
    const flagUrl = `https://flagcdn.com/w160/${countryCode.trim()}.png`

    // Return the flag URL and country information
    return new Response(
      JSON.stringify({
        flagUrl,
        country: country.trim(),
        countryCode: countryCode.trim(),
        language: language,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process the request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

