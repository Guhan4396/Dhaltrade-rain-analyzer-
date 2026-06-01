"use client"

import { getRainBgColor, getRainTextColor, formatDDMM, getTimeAgo } from "@/lib/weather"
import type { RegionForecast } from "@/lib/types"

interface RegionCardsProps {
  regions: RegionForecast[]
  fetchedAt: string | null
  loading?: boolean
}

function RainDrop({ mm }: { mm: number }) {
  const color = mm > 0 ? "#3B82F6" : "#D1D5DB"
  return (
    <svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 0C5 0 0 5.5 0 8.5C0 11.0376 2.23858 13 5 13C7.76142 13 10 11.0376 10 8.5C10 5.5 5 0 5 0Z" fill={color} />
    </svg>
  )
}

function SourceComparison({ rf }: { rf: RegionForecast }) {
  const next3om = rf.days.slice(0, 3).reduce((s, d) => s + d.precipMm, 0)
  const next3tm = rf.tomorrowDays
    ? rf.tomorrowDays.slice(0, 3).reduce((s, d) => s + d.precipMm, 0)
    : null
  const next3wa = rf.weatherapiDays
    ? rf.weatherapiDays.slice(0, 3).reduce((s, d) => s + d.precipMm, 0)
    : null

  const values = [next3om, next3tm, next3wa].filter((v): v is number => v !== null)
  const diverges = values.length > 1 && Math.max(...values) - Math.min(...values) > 5

  return (
    <div className="text-[11px] text-gray-500">
      <div className="flex items-center gap-1 flex-wrap">
        <span>OM: {next3om.toFixed(1)}mm</span>
        <span className="text-gray-300">|</span>
        <span>TM: {next3tm !== null ? next3tm.toFixed(1) + "mm" : "--"}</span>
        <span className="text-gray-300">|</span>
        <span>WA: {next3wa !== null ? next3wa.toFixed(1) + "mm" : "--"}</span>
        {diverges && (
          <span className="text-amber-500 font-medium">⚠ sources vary</span>
        )}
      </div>
    </div>
  )
}

export default function RegionCards({ regions, fetchedAt, loading }: RegionCardsProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-[#0F172A] border-l-4 border-[#0F172A] pl-3">
          District Snapshot
        </h2>
        <p className="text-[12px] text-gray-500 pl-3">Next 3 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="space-y-2">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded" />
                  ))}
                </div>
              </div>
            ))
          : regions.map((rf) => {
              const isUrad = rf.region.uradBelt
              const next3 = rf.days.slice(0, 3)

              return (
                <div
                  key={rf.region.id}
                  className={`rounded-lg border p-3 relative ${
                    isUrad
                      ? "border-amber-200 border-t-[3px] border-t-amber-400 bg-[#FFFBEB]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {isUrad && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                      URAD BELT
                    </span>
                  )}

                  <div className="pr-16">
                    <div className="font-bold text-[13px] text-gray-900 leading-tight">
                      {rf.region.name}
                    </div>
                    <div className="text-[11px] text-gray-400">{rf.region.state}</div>
                    <div className="text-[10px] text-gray-400 italic mt-0.5 leading-tight">
                      {rf.region.role}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    {next3.map((day) => {
                      const bg = getRainBgColor(day.precipMm)
                      const color = getRainTextColor(day.precipMm)
                      return (
                        <div key={day.date} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 w-9 shrink-0">
                            {formatDDMM(day.date)}
                          </span>
                          <RainDrop mm={day.precipMm} />
                          <span
                            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: bg, color }}
                          >
                            {day.precipMm > 0 ? day.precipMm.toFixed(1) + "mm" : "—"}
                          </span>
                          {day.precipProbability > 0 && (
                            <span className="text-[10px] text-gray-400">
                              {Math.round(day.precipProbability)}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <hr className="my-2 border-gray-200" />
                  <SourceComparison rf={rf} />

                  {fetchedAt && (
                    <div className="text-[9px] text-gray-300 mt-1.5">
                      {getTimeAgo(fetchedAt)}
                    </div>
                  )}
                </div>
              )
            })}
      </div>
    </section>
  )
}
