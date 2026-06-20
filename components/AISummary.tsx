"use client"

import { Brain, TrendingUp, AlertTriangle, Radio, Clock } from "lucide-react"
import { getTimeAgo } from "@/lib/weather"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { SummaryResponse } from "@/lib/types"

interface AISummaryProps {
  summary: SummaryResponse | null
  loading?: boolean
}

function getSignalVariant(signal: string): "buy" | "wait" | "hold" | "default" {
  const s = signal.toUpperCase()
  if (s.startsWith("BUY"))  return "buy"
  if (s.startsWith("WAIT")) return "wait"
  if (s.startsWith("HOLD")) return "hold"
  return "default"
}

function getSignalKey(signal: string): string {
  const s = signal.toUpperCase()
  if (s.startsWith("BUY NOW"))       return "BUY NOW"
  if (s.startsWith("WAIT AND WATCH")) return "WAIT AND WATCH"
  if (s.startsWith("HOLD POSITION")) return "HOLD POSITION"
  return signal
}

const ROWS = [
  { key: "status",  label: "Status",  Icon: Radio },
  { key: "outlook", label: "Outlook", Icon: TrendingUp },
  { key: "risk",    label: "Risk",    Icon: AlertTriangle },
] as const

export default function AISummary({ summary, loading }: AISummaryProps) {
  return (
    <div className="bg-[#0F172A] text-white rounded-xl border border-slate-700 shadow-panel p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-violet-500/20 rounded-lg border border-violet-400/20">
            <Brain className="w-4 h-4 text-violet-400" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-none">Daily Intelligence</h2>
            {summary?.generatedAt && (
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Generated {getTimeAgo(summary.generatedAt)}
              </p>
            )}
          </div>
        </div>
        <span className="text-[11px] text-slate-500 whitespace-nowrap pt-1">
          Refreshes daily · 6am IST
        </span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-2/3 bg-slate-700" />
          <Skeleton className="h-8 w-36 bg-slate-700" />
        </div>
      ) : summary?.error ? (
        <p className="text-amber-400 text-sm">{summary.fallback}</p>
      ) : summary ? (
        <div className="space-y-3 text-sm">
          {ROWS.map(({ key, label, Icon }) => {
            const value = summary[key as keyof typeof summary] as string
            if (!value) return null
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:gap-3">
                <div className="flex items-center gap-1.5 shrink-0 w-24">
                  <Icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                  <span className="text-slate-400 font-medium text-[12px] uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <span className="text-slate-200 leading-snug">{value}</span>
              </div>
            )
          })}

          {/* Signal pill */}
          {summary.signal && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 pt-1 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5 shrink-0 w-24">
                <span className="text-slate-400 font-medium text-[12px] uppercase tracking-wide">Signal</span>
              </div>
              <Badge variant={getSignalVariant(summary.signal)}>
                {getSignalKey(summary.signal)}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          AI analysis unavailable — add <code className="text-slate-300 bg-slate-800 px-1 rounded text-[11px]">ANTHROPIC_API_KEY</code> to enable
        </p>
      )}
    </div>
  )
}
