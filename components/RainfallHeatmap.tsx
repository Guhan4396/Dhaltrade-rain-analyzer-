"use client"

import {
  getRainBgColor,
  getRainTextColor,
  getRainDisplay,
  getProbabilityColor,
  formatDDMM,
  getTimeAgo,
} from "@/lib/weather"
import type { RegionForecast } from "@/lib/types"

interface RainfallHeatmapProps {
  regions: RegionForecast[]
  fetchedAt: string | null
  loading?: boolean
}

export default function RainfallHeatmap({ regions, fetchedAt, loading }: RainfallHeatmapProps) {
  const days = regions[0]?.days ?? []
  const dates = days.map((d) => d.date)

  return (
    <section>
      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] border-l-4 border-[#0F172A] pl-3">
            16-Day Forecast
          </h2>
          <p className="text-[12px] text-gray-500 pl-3">mm per day — refreshes every 6 hours</p>
        </div>
        {fetchedAt && (
          <span className="text-[11px] text-gray-400 pt-1">
            Last updated: {getTimeAgo(fetchedAt)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-[11px] sm:text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 text-left px-3 py-2 font-semibold text-gray-700 min-w-[140px] sm:min-w-[160px] border-b border-gray-200">
                    Region
                  </th>
                  {dates.map((date) => (
                    <th
                      key={date}
                      className="text-center px-1 py-2 font-medium text-gray-600 min-w-[42px] border-b border-gray-200 whitespace-nowrap"
                    >
                      {formatDDMM(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regions.map((rf) => {
                  const isUrad = rf.region.uradBelt
                  return (
                    <tr
                      key={rf.region.id}
                      className={isUrad ? "bg-amber-50" : "bg-white"}
                    >
                      <td
                        className={`sticky left-0 z-10 px-3 py-2 border-b border-gray-100 min-w-[140px] sm:min-w-[160px] ${
                          isUrad
                            ? "bg-amber-50 border-l-4 border-l-amber-400"
                            : "bg-white border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className={`font-semibold leading-tight ${isUrad ? "text-amber-900" : "text-gray-800"}`}>
                          {rf.region.name}
                        </div>
                        <div className="text-gray-400 text-[10px]">{rf.region.state}</div>
                      </td>
                      {rf.days.map((day) => {
                        const bg = getRainBgColor(day.precipMm)
                        const color = getRainTextColor(day.precipMm)
                        const display = getRainDisplay(day.precipMm)
                        const probColor = getProbabilityColor(day.precipProbability)
                        return (
                          <td
                            key={day.date}
                            className="text-center px-1 py-1.5 border-b border-gray-100"
                          >
                            <div
                              className="rounded mx-0.5 py-1 px-0.5"
                              style={{ backgroundColor: bg }}
                            >
                              <div
                                className="font-semibold leading-tight text-[11px]"
                                style={{ color }}
                              >
                                {display}
                              </div>
                              {day.precipProbability > 0 && (
                                <div
                                  className="text-[9px] leading-tight"
                                  style={{ color: probColor }}
                                >
                                  {Math.round(day.precipProbability)}%
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 items-center">
            <span className="text-[11px] text-gray-500 font-medium">Legend:</span>
            {[
              { bg: "transparent", border: "border border-gray-200", text: "#9CA3AF", label: "0mm" },
              { bg: "#DBEAFE", text: "#1E40AF", label: "0.1–4.9mm" },
              { bg: "#3B82F6", text: "#FFFFFF", label: "5–14.9mm" },
              { bg: "#1D4ED8", text: "#FFFFFF", label: "15–29.9mm" },
              { bg: "#1E3A5F", text: "#FFFFFF", label: "30mm+ ★" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className={`w-6 h-4 rounded text-center text-[9px] flex items-center justify-center ${item.border ?? ""}`}
                  style={{ backgroundColor: item.bg, color: item.text }}
                >
                  ▪
                </div>
                <span className="text-[11px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
