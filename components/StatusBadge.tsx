"use client"

import { getMonsoonStatus } from "@/lib/weather"
import type { RegionForecast } from "@/lib/types"

interface StatusBadgeProps {
  regions: RegionForecast[]
  loading?: boolean
}

export default function StatusBadge({ regions, loading }: StatusBadgeProps) {
  if (loading) {
    return (
      <div className="w-full py-4 flex justify-center">
        <div className="h-8 w-80 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  const status = getMonsoonStatus(regions)

  const config = {
    ACTIVE: {
      text: "MONSOON ACTIVE IN URAD BELT",
      bg: "bg-green-600",
    },
    APPROACHING: {
      text: "MONSOON APPROACHING",
      bg: "bg-amber-500",
    },
    DRY: {
      text: "DRY — MONSOON NOT YET IN URAD BELT",
      bg: "bg-red-600",
    },
  }[status]

  return (
    <div className={`w-full ${config.bg} text-white py-3 px-4`}>
      <p className="text-center font-bold text-[20px] sm:text-[22px] tracking-wide">
        {config.text}
      </p>
    </div>
  )
}
