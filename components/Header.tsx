"use client"

import { CloudRain, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
    freshness === "fresh" ? "bg-emerald-400" :
    freshness === "aging" ? "bg-amber-400"   : "bg-slate-500"

  const badgeVariant =
    freshness === "fresh" ? "fresh" :
    freshness === "aging" ? "aging" : "stale"

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A] text-white shadow-panel border-b border-slate-800">
      <div className="max-w-[1280px] mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-500/20 rounded-lg border border-blue-400/20">
            <CloudRain className="w-5 h-5 text-blue-400" strokeWidth={2} />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight leading-none">Monsoon Watch</div>
            <div className="text-[12px] text-slate-400 mt-0.5">Urad Dal Intelligence</div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="text-[13px] text-slate-300 font-medium">{dateStr}</div>
          {timeAgo && (
            <Badge variant={badgeVariant as any} className="flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", dotColor, freshness === "fresh" && "animate-pulse")} />
              <Clock className="w-3 h-3" />
              {timeAgo}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
