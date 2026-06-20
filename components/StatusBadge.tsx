"use client"

import { CheckCircle2, Clock, CloudOff } from "lucide-react"
import { getMonsoonStatus } from "@/lib/weather"
import type { RegionForecast } from "@/lib/types"

interface StatusBadgeProps {
  regions: RegionForecast[]
  loading?: boolean
}

const STATUS_CONFIG = {
  ACTIVE: {
    text: "Monsoon Active in Urad Belt",
    bg: "bg-emerald-600",
    Icon: CheckCircle2,
  },
  APPROACHING: {
    text: "Monsoon Approaching",
    bg: "bg-amber-500",
    Icon: Clock,
  },
  DRY: {
    text: "Dry — Monsoon Not Yet in Urad Belt",
    bg: "bg-red-600",
    Icon: CloudOff,
  },
}

export default function StatusBadge({ regions, loading }: StatusBadgeProps) {
  if (loading) {
    return <div className="w-full h-12 bg-slate-200 animate-pulse" />
  }

  const status = getMonsoonStatus(regions)
  const { text, bg, Icon } = STATUS_CONFIG[status]

  return (
    <div className={`w-full ${bg} text-white py-2.5 px-4`}>
      <p className="text-center font-bold text-[18px] sm:text-[20px] tracking-wide flex items-center justify-center gap-2">
        <Icon className="w-5 h-5 shrink-0" strokeWidth={2.5} />
        {text}
      </p>
    </div>
  )
}
