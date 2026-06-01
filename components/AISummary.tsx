"use client"

import { getTimeAgo } from "@/lib/weather"
import type { SummaryResponse } from "@/lib/types"

interface AISummaryProps {
  summary: SummaryResponse | null
  loading?: boolean
}

const SIGNAL_CONFIG: Record<string, { bg: string; text: string }> = {
  "BUY NOW": { bg: "bg-green-600", text: "text-white" },
  "WAIT AND WATCH": { bg: "bg-amber-500", text: "text-white" },
  "HOLD POSITION": { bg: "bg-red-600", text: "text-white" },
}

function getSignalConfig(signal: string) {
  for (const key of Object.keys(SIGNAL_CONFIG)) {
    if (signal.toUpperCase().startsWith(key)) return { key, ...SIGNAL_CONFIG[key] }
  }
  return { key: signal, bg: "bg-slate-600", text: "text-white" }
}

function SignalPill({ signal }: { signal: string }) {
  const { key, bg, text } = getSignalConfig(signal)
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${bg} ${text} mt-1 sm:mt-0`}>
      {key}
    </span>
  )
}

function SkeletonLine({ wide }: { wide?: boolean }) {
  return (
    <div
      className={`h-4 bg-slate-700 rounded animate-pulse ${wide ? "w-full" : "w-3/4"}`}
    />
  )
}

export default function AISummary({ summary, loading }: AISummaryProps) {
  return (
    <div className="bg-[#0F172A] text-white rounded-lg p-5 border border-slate-700">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <h2 className="text-lg font-bold">Daily Intelligence</h2>
          {summary?.generatedAt && (
            <p className="text-[12px] text-slate-400 mt-0.5">
              Generated: {getTimeAgo(summary.generatedAt)}
            </p>
          )}
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap pt-1">
          Updated daily at 6am IST
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine wide />
          <SkeletonLine />
          <SkeletonLine wide />
        </div>
      ) : summary?.error ? (
        <p className="text-amber-400 text-sm">{summary.fallback}</p>
      ) : summary ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="text-slate-400 font-medium w-20 shrink-0">Status:</span>
            <span className="text-white">{summary.status}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="text-slate-400 font-medium w-20 shrink-0">Outlook:</span>
            <span className="text-white">{summary.outlook}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <span className="text-slate-400 font-medium w-20 shrink-0">Risk:</span>
            <span className="text-white">{summary.risk}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-slate-400 font-medium w-20 shrink-0">Signal:</span>
            {summary.signal && (
              <SignalPill signal={summary.signal} />
            )}
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          AI analysis unavailable — check rainfall data below
        </p>
      )}
    </div>
  )
}
