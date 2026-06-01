import Header from "@/components/Header"
import StatusBadge from "@/components/StatusBadge"
import AISummary from "@/components/AISummary"
import RainfallHeatmap from "@/components/RainfallHeatmap"
import RegionCards from "@/components/RegionCards"
import WindyMap from "@/components/WindyMap"
import SourceStatus from "@/components/SourceStatus"
import RetryButton from "@/components/RetryButton"
import { fetchAllWeather } from "@/lib/fetch-weather"
import type { SummaryResponse, WeatherResponse } from "@/lib/types"
import Anthropic from "@anthropic-ai/sdk"

export const revalidate = 21600

async function getSummary(weatherData: WeatherResponse): Promise<SummaryResponse | null> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return null

  const uradRegions = weatherData.regions.filter((r) => r.region.uradBelt)
  const regionSummaries = uradRegions
    .map((r) => {
      const total16 = r.days.reduce((s, d) => s + d.precipMm, 0).toFixed(1)
      const next3 = r.days.slice(0, 3).map((d) => `${d.date}: ${d.precipMm.toFixed(1)}mm`).join(", ")
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

    return {
      status: lines.status ?? "",
      outlook: lines.outlook ?? "",
      risk: lines.risk ?? "",
      signal: lines.signal ?? "",
      generatedAt: new Date().toISOString(),
      nextRefreshAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch {
    return { error: true, fallback: "AI analysis unavailable — check rainfall data below" }
  }
}

export default async function Home() {
  let weather: WeatherResponse | null = null
  try {
    weather = await fetchAllWeather()
  } catch {
    weather = null
  }

  const hasWeather = weather && weather.regions.length > 0 && weather.sources.openmeteo === "ok"

  const summary = hasWeather ? await getSummary(weather!) : null

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Header fetchedAt={weather?.fetchedAt ?? null} />

      {!hasWeather && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-700">
          Weather data unavailable. You may be offline — check your connection and refresh.
        </div>
      )}

      <StatusBadge regions={hasWeather ? weather!.regions : []} loading={false} />

      <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
        <AISummary summary={summary} loading={false} />

        {hasWeather ? (
          <>
            <RainfallHeatmap
              regions={weather!.regions}
              fetchedAt={weather!.fetchedAt}
              loading={false}
            />
            <RegionCards
              regions={weather!.regions}
              fetchedAt={weather!.fetchedAt}
              loading={false}
            />
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Unable to load weather data</p>
            <p className="text-red-500 text-sm mb-4">
              Open-Meteo could not be reached. Check your connection.
            </p>
            <RetryButton />
          </div>
        )}

        <WindyMap />

        <SourceStatus
          sources={weather?.sources ?? null}
          fetchedAt={weather?.fetchedAt ?? null}
        />

        <footer className="text-center text-[11px] text-gray-400 pb-4 border-t border-gray-200 pt-4">
          Monsoon Watch · Built for urad dal procurement intelligence · Data: Open-Meteo, Tomorrow.io, WeatherAPI, Windy
        </footer>
      </div>
    </main>
  )
}
