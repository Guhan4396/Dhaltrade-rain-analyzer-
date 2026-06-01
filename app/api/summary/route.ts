import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import type { WeatherResponse, SummaryResponse } from "@/lib/types"

export const revalidate = 86400

const FALLBACK: SummaryResponse = {
  error: true,
  fallback: "AI analysis unavailable — check rainfall data below",
}

export async function GET() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return NextResponse.json(FALLBACK)

  let weatherData: WeatherResponse
  try {
    const weatherRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/weather`,
      { next: { tags: ["summary"], revalidate: 86400 } }
    )
    if (!weatherRes.ok) throw new Error("weather fetch failed")
    weatherData = await weatherRes.json()
  } catch {
    return NextResponse.json(FALLBACK)
  }

  const uradRegions = weatherData.regions.filter((r) => r.region.uradBelt)

  const regionSummaries = uradRegions
    .map((r) => {
      const total16 = r.days.reduce((s, d) => s + d.precipMm, 0).toFixed(1)
      const next3 = r.days
        .slice(0, 3)
        .map((d) => `${d.date}: ${d.precipMm.toFixed(1)}mm`)
        .join(", ")
      const firstRainDay = r.days.find((d) => d.precipMm >= 2)
      const rainArrival = firstRainDay ? firstRainDay.date : "none in 16 days"
      return `${r.region.name} (${r.region.state}): 16-day total=${total16}mm, rain arrives=${rainArrival}, next 3 days=[${next3}]`
    })
    .join("\n")

  const prompt = `Here is the 16-day daily rainfall forecast for the urad dal growing districts:\n\n${regionSummaries}\n\nToday's date: ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`

  try {
    const client = new Anthropic({ apiKey: anthropicKey })
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `You are a weather intelligence analyst for an urad dal trader in Chennai, India.
The trader sources urad dal from: Gulbarga and Bidar (Karnataka), Latur, Nanded, Marathwada and Vidarbha (Maharashtra).
You are given 16-day daily rainfall forecasts for all these districts.
Reply in exactly 4 lines, each starting with its label and a colon:
Status: [which districts have monsoon rain today and which are still dry]
Outlook: [name each urad belt district — how many mm total over 16 days, when rain arrives]
Risk: [biggest weather risk or opportunity for urad procurement in next 10 days]
Signal: [BUY NOW or WAIT AND WATCH or HOLD POSITION — one specific reason why]
Use district names. Use mm figures. No generic language. Sharp and direct.`,
      messages: [{ role: "user", content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    const lines: Record<string, string> = {}
    for (const line of text.split("\n")) {
      const match = line.match(/^(Status|Outlook|Risk|Signal):\s*(.+)/)
      if (match) lines[match[1].toLowerCase()] = match[2].trim()
    }

    const generatedAt = new Date().toISOString()
    const nextRefreshAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const response: SummaryResponse = {
      status: lines.status ?? "",
      outlook: lines.outlook ?? "",
      risk: lines.risk ?? "",
      signal: lines.signal ?? "",
      generatedAt,
      nextRefreshAt,
    }
    return NextResponse.json(response)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
