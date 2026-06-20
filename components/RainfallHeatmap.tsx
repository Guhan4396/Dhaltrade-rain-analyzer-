"use client"

import {
  getRainBgColor,
  getRainTextColor,
  getRainDisplay,
  getProbabilityColor,
  formatDDMM,
  getTimeAgo,
} from "@/lib/weather"
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { RegionForecast } from "@/lib/types"

interface RainfallHeatmapProps {
  regions: RegionForecast[]
  fetchedAt: string | null
  loading?: boolean
}

const LEGEND = [
  { bg: "transparent", border: true, text: "#94A3B8", label: "0 mm" },
  { bg: "#DBEAFE",     text: "#1E40AF", label: "0.1–4.9 mm" },
  { bg: "#3B82F6",     text: "#FFFFFF", label: "5–14.9 mm" },
  { bg: "#1D4ED8",     text: "#FFFFFF", label: "15–29.9 mm" },
  { bg: "#1E3A5F",     text: "#FFFFFF", label: "30 mm+ ★" },
]

export default function RainfallHeatmap({ regions, fetchedAt, loading }: RainfallHeatmapProps) {
  const days = regions[0]?.days ?? []
  const dates = days.map((d) => d.date)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>16-Day Forecast</CardTitle>
            <CardSubtitle>mm per day · refreshes every 6 hours</CardSubtitle>
          </div>
          {fetchedAt && (
            <span className="text-[11px] text-slate-400 pt-1">
              Updated {getTimeAgo(fetchedAt)}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="min-w-full text-[11px] sm:text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="sticky left-0 z-10 bg-slate-50 text-left px-3 py-2.5 font-semibold text-slate-600 min-w-[144px] sm:min-w-[168px] border-b border-slate-200">
                      Region
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date}
                        className="text-center px-1 py-2.5 font-medium text-slate-500 min-w-[42px] border-b border-slate-200 whitespace-nowrap"
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
                        className={isUrad ? "bg-amber-50/60" : "bg-white"}
                      >
                        <td
                          className={`sticky left-0 z-10 px-3 py-2 border-b border-slate-100 min-w-[144px] sm:min-w-[168px] ${
                            isUrad
                              ? "bg-amber-50/80 border-l-[3px] border-l-amber-400"
                              : "bg-white border-l-[3px] border-l-transparent"
                          }`}
                        >
                          <div className={`font-semibold leading-tight ${isUrad ? "text-amber-900" : "text-slate-800"}`}>
                            {rf.region.name}
                          </div>
                          <div className="text-slate-400 text-[10px]">{rf.region.state}</div>
                        </td>
                        {rf.days.map((day) => {
                          const bg = getRainBgColor(day.precipMm)
                          const color = getRainTextColor(day.precipMm)
                          const display = getRainDisplay(day.precipMm)
                          const probColor = getProbabilityColor(day.precipProbability)
                          return (
                            <td
                              key={day.date}
                              className="text-center px-1 py-1.5 border-b border-slate-100"
                            >
                              <div
                                className="rounded-md mx-0.5 py-1 px-0.5 transition-transform hover:scale-105"
                                style={{ backgroundColor: bg }}
                              >
                                <div className="font-semibold leading-tight text-[11px]" style={{ color }}>
                                  {display}
                                </div>
                                {day.precipProbability > 0 && (
                                  <div className="text-[9px] leading-tight" style={{ color: probColor }}>
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
            <div className="flex flex-wrap gap-3 mt-3 items-center pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold">Intensity:</span>
              {LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-4 rounded flex items-center justify-center text-[9px] ${item.border ? "border border-slate-300" : ""}`}
                    style={{ backgroundColor: item.bg, color: item.text }}
                  >
                    ▪
                  </div>
                  <span className="text-[11px] text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
