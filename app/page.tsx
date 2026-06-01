import Header from "@/components/Header"
import StatusBadge from "@/components/StatusBadge"
import AISummary from "@/components/AISummary"
import RainfallHeatmap from "@/components/RainfallHeatmap"
import RegionCards from "@/components/RegionCards"
import WindyMap from "@/components/WindyMap"
import SourceStatus from "@/components/SourceStatus"
import type { WeatherResponse, SummaryResponse } from "@/lib/types"

async function getWeather(): Promise<WeatherResponse | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${base}/api/weather`, {
      next: { revalidate: 21600, tags: ["weather"] },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getSummary(): Promise<SummaryResponse | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(`${base}/api/summary`, {
      next: { revalidate: 86400, tags: ["summary"] },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function Home() {
  const [weather, summary] = await Promise.all([getWeather(), getSummary()])

  const hasWeather = weather && weather.regions.length > 0
  const isOffline = !hasWeather

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Header fetchedAt={weather?.fetchedAt ?? null} />

      {isOffline && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm text-red-700">
          Weather data unavailable. You may be offline — check your connection and refresh.
        </div>
      )}

      <StatusBadge
        regions={hasWeather ? weather.regions : []}
        loading={false}
      />

      <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
        <AISummary summary={summary} loading={false} />

        {hasWeather ? (
          <>
            <RainfallHeatmap
              regions={weather.regions}
              fetchedAt={weather.fetchedAt}
              loading={false}
            />

            <RegionCards
              regions={weather.regions}
              fetchedAt={weather.fetchedAt}
              loading={false}
            />
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium mb-2">Unable to load weather data</p>
            <p className="text-red-500 text-sm mb-4">
              Open-Meteo could not be reached. Check your connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Retry
            </button>
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
