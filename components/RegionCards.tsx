"use client"

import { Droplets, AlertCircle } from "lucide-react"
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { getRainBgColor, getRainTextColor, formatDDMM, getTimeAgo } from "@/lib/weather"
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { RegionForecast } from "@/lib/types"

interface RegionCardsProps {
  regions: RegionForecast[]
  fetchedAt: string | null
  loading?: boolean
}

function rainBarColor(mm: number): string {
  if (mm <= 0)    return "#E2E8F0"
  if (mm < 5)     return "#BFDBFE"
  if (mm < 15)    return "#3B82F6"
  if (mm < 30)    return "#1D4ED8"
  return "#1E3A5F"
}

function SparkBar({ days }: { days: { date: string; precipMm: number }[] }) {
  const data = days.slice(0, 7).map((d) => ({ date: formatDDMM(d.date), mm: d.precipMm }))
  return (
    <ResponsiveContainer width="100%" height={28}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={6}>
        <Bar dataKey="mm" radius={[2, 2, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={rainBarColor(entry.mm)} />
          ))}
        </Bar>
        <Tooltip
          cursor={false}
          contentStyle={{ fontSize: 11, padding: "2px 6px", border: "1px solid #e2e8f0", borderRadius: 6 }}
          formatter={(v) => [`${Number(v ?? 0).toFixed(1)} mm`, ""]}
          labelFormatter={(l) => l}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SourceComparison({ rf }: { rf: RegionForecast }) {
  const next3om = rf.days.slice(0, 3).reduce((s, d) => s + d.precipMm, 0)
  const next3tm = rf.tomorrowDays?.slice(0, 3).reduce((s, d) => s + d.precipMm, 0) ?? null
  const next3wa = rf.weatherapiDays?.slice(0, 3).reduce((s, d) => s + d.precipMm, 0) ?? null

  const values = [next3om, next3tm, next3wa].filter((v): v is number => v !== null)
  const diverges = values.length > 1 && Math.max(...values) - Math.min(...values) > 5

  return (
    <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
      <span>OM {next3om.toFixed(1)}mm</span>
      <span className="text-slate-300">·</span>
      <span>TM {next3tm !== null ? next3tm.toFixed(1) + "mm" : "—"}</span>
      <span className="text-slate-300">·</span>
      <span>WA {next3wa !== null ? next3wa.toFixed(1) + "mm" : "—"}</span>
      {diverges && (
        <span className="flex items-center gap-0.5 text-amber-500 font-medium">
          <AlertCircle className="w-3 h-3" /> sources vary
        </span>
      )}
    </div>
  )
}

export default function RegionCards({ regions, fetchedAt, loading }: RegionCardsProps) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="section-title">District Snapshot</h2>
        <p className="section-subtitle">Next 3 days · sparkline = 7 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          : regions.map((rf) => {
              const isUrad = rf.region.uradBelt
              const next3 = rf.days.slice(0, 3)
              const total16 = rf.days.reduce((s, d) => s + d.precipMm, 0)

              return (
                <div
                  key={rf.region.id}
                  className={cn(
                    "rounded-xl border p-3 relative transition-shadow hover:shadow-card-hover",
                    isUrad
                      ? "border-amber-200 bg-amber-50/40 border-t-[3px] border-t-amber-400"
                      : "border-slate-200 bg-white"
                  )}
                >
                  {isUrad && (
                    <Badge variant="urad" className="absolute top-2 right-2">
                      URAD
                    </Badge>
                  )}

                  {/* Region name */}
                  <div className="pr-14">
                    <div className={cn("font-bold text-[13px] leading-tight", isUrad ? "text-amber-900" : "text-slate-900")}>
                      {rf.region.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{rf.region.state}</div>
                  </div>

                  {/* 7-day sparkline */}
                  <div className="mt-2 -mx-1">
                    <SparkBar days={rf.days} />
                  </div>

                  {/* Next 3 day rows */}
                  <div className="mt-1 space-y-1">
                    {next3.map((day) => {
                      const bg = getRainBgColor(day.precipMm)
                      const color = getRainTextColor(day.precipMm)
                      return (
                        <div key={day.date} className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 w-9 shrink-0 font-mono">
                            {formatDDMM(day.date)}
                          </span>
                          <Droplets
                            className="w-3 h-3 shrink-0"
                            style={{ color: day.precipMm > 0 ? "#3B82F6" : "#CBD5E1" }}
                            strokeWidth={2}
                          />
                          <span
                            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: bg, color }}
                          >
                            {day.precipMm > 0 ? day.precipMm.toFixed(1) + "mm" : "—"}
                          </span>
                          {day.precipProbability > 0 && (
                            <span className="text-[10px] text-slate-400">
                              {Math.round(day.precipProbability)}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <hr className="my-2 border-slate-100" />
                  <SourceComparison rf={rf} />

                  {/* 16-day total */}
                  <div className="mt-1.5 text-[10px] text-slate-400">
                    16-day total:{" "}
                    <span className="font-semibold text-slate-600">{total16.toFixed(0)} mm</span>
                  </div>
                </div>
              )
            })}
      </div>
    </section>
  )
}
