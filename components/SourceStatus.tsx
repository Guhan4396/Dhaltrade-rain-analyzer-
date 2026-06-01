"use client"

import { useState } from "react"
import { getTimeAgo } from "@/lib/weather"
import type { SourceStatus as SourceStatusType } from "@/lib/types"

interface SourceStatusProps {
  sources: {
    openmeteo: SourceStatusType
    tomorrow: SourceStatusType
    weatherapi: SourceStatusType
  } | null
  fetchedAt: string | null
}

function StatusDot({ status }: { status: SourceStatusType }) {
  const colors: Record<SourceStatusType, string> = {
    ok: "bg-green-500",
    error: "bg-red-500",
    missing: "bg-gray-400",
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />
}

function SourceRow({
  name,
  status,
  detail,
  fetchNote,
}: {
  name: string
  status: SourceStatusType
  detail: string
  fetchNote: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <StatusDot status={status} />
        <span className="text-[13px] font-medium text-gray-700">{name}</span>
      </div>
      <div className="text-right">
        <div className="text-[11px] text-gray-500">{detail}</div>
        <div className="text-[10px] text-gray-400">{fetchNote}</div>
      </div>
    </div>
  )
}

export default function SourceStatus({ sources, fetchedAt }: SourceStatusProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(false)

  async function handleRefresh() {
    if (cooldown || refreshing) return
    setRefreshing(true)
    try {
      await fetch("/api/revalidate", { method: "POST" })
      setLastRefreshed(new Date().toISOString())
      setCooldown(true)
      setTimeout(() => setCooldown(false), 60000)
      window.location.reload()
    } catch {
      // silent
    } finally {
      setRefreshing(false)
    }
  }

  const fetchNote = fetchedAt ? getTimeAgo(fetchedAt) : "—"

  return (
    <section>
      <div className="flex items-start justify-between mb-3 gap-3">
        <h2 className="text-lg font-bold text-[#0F172A] border-l-4 border-[#0F172A] pl-3">
          Data Sources
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing || cooldown}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
            cooldown
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : refreshing
              ? "bg-blue-50 text-blue-400 cursor-wait"
              : "bg-[#0F172A] text-white hover:bg-slate-700"
          }`}
        >
          {refreshing ? (
            <>
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Refreshing...
            </>
          ) : cooldown ? (
            "Updated just now"
          ) : (
            "Refresh Now"
          )}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg px-4 divide-y divide-gray-100">
        <SourceRow
          name="Open-Meteo"
          status={sources?.openmeteo ?? "ok"}
          detail="Refreshes every 6 hours"
          fetchNote={fetchNote}
        />
        <SourceRow
          name="Tomorrow.io"
          status={sources?.tomorrow ?? "missing"}
          detail="Refreshes every 6 hours"
          fetchNote={sources?.tomorrow === "missing" ? "Key needed" : fetchNote}
        />
        <SourceRow
          name="WeatherAPI"
          status={sources?.weatherapi ?? "missing"}
          detail="Refreshes every 6 hours"
          fetchNote={sources?.weatherapi === "missing" ? "Key needed" : fetchNote}
        />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[13px] font-medium text-gray-700">Windy</span>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-500">Always live</div>
            <div className="text-[10px] text-gray-400">Streaming</div>
          </div>
        </div>
      </div>
    </section>
  )
}
