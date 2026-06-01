"use client"

import { formatIST, getDataFreshness, getTimeAgo } from "@/lib/weather"

interface HeaderProps {
  fetchedAt: string | null
}

export default function Header({ fetchedAt }: HeaderProps) {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const freshness = fetchedAt ? getDataFreshness(fetchedAt) : "stale"
  const timeAgo = fetchedAt ? getTimeAgo(fetchedAt) : null

  const dotColor =
    freshness === "fresh"
      ? "bg-green-400"
      : freshness === "aging"
      ? "bg-amber-400"
      : "bg-gray-400"

  const dotPulse = freshness === "fresh" ? "animate-pulse" : ""

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-white shadow-md">
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
        <div>
          <div className="text-xl font-bold tracking-tight">Monsoon Watch</div>
          <div className="text-[13px] text-slate-400">Urad Dal Intelligence</div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-0.5">
          <div className="text-[13px] text-slate-300">{dateStr}</div>
          {timeAgo && (
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
              <span
                className={`inline-block w-2 h-2 rounded-full ${dotColor} ${dotPulse}`}
              />
              Updated: {timeAgo}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
