"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle2, XCircle, MinusCircle, Radio } from "lucide-react"
import { getTimeAgo } from "@/lib/weather"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SourceStatus as SourceStatusType } from "@/lib/types"

interface SourceStatusProps {
  sources: {
    openmeteo: SourceStatusType
    tomorrow: SourceStatusType
    weatherapi: SourceStatusType
  } | null
  fetchedAt: string | null
}

function StatusIcon({ status }: { status: SourceStatusType }) {
  if (status === "ok")      return <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2} />
  if (status === "error")   return <XCircle      className="w-4 h-4 text-red-500"     strokeWidth={2} />
  return                           <MinusCircle  className="w-4 h-4 text-slate-400"   strokeWidth={2} />
}

function SourceRow({
  name, status, detail, fetchNote,
}: {
  name: string; status: SourceStatusType; detail: string; fetchNote: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <span className="text-[13px] font-medium text-slate-700">{name}</span>
      </div>
      <div className="text-right">
        <div className="text-[11px] text-slate-500">{detail}</div>
        <div className="text-[10px] text-slate-400">{fetchNote}</div>
      </div>
    </div>
  )
}

export default function SourceStatus({ sources, fetchedAt }: SourceStatusProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  async function handleRefresh() {
    if (cooldown || refreshing) return
    setRefreshing(true)
    try {
      await fetch("/api/revalidate", { method: "POST" })
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
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <h2 className="section-title">Data Sources</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || cooldown}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px]",
            cooldown
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : refreshing
              ? "bg-blue-50 text-blue-500 cursor-wait"
              : "bg-[#0F172A] text-white hover:bg-slate-700 active:scale-95"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} strokeWidth={2} />
          {refreshing ? "Refreshing…" : cooldown ? "Just updated" : "Refresh Now"}
        </button>
      </div>

      <Card>
        <CardContent className="py-0 px-4 divide-y divide-slate-100">
          <SourceRow
            name="Open-Meteo"
            status={sources?.openmeteo ?? "ok"}
            detail="Free · no key required"
            fetchNote={fetchNote}
          />
          <SourceRow
            name="Tomorrow.io"
            status={sources?.tomorrow ?? "missing"}
            detail="Refreshes every 6 hours"
            fetchNote={sources?.tomorrow === "missing" ? "Add TOMORROW_API_KEY" : fetchNote}
          />
          <SourceRow
            name="WeatherAPI"
            status={sources?.weatherapi ?? "missing"}
            detail="Refreshes every 6 hours"
            fetchNote={sources?.weatherapi === "missing" ? "Add WEATHERAPI_KEY" : fetchNote}
          />
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" strokeWidth={2} />
              <span className="text-[13px] font-medium text-slate-700">Windy</span>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Always live</div>
              <div className="text-[10px] text-slate-400">Streaming embed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
