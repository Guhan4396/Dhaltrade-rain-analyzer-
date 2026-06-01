import type { RegionForecast, MonsoonStatus, DataFreshness } from "./types"

export function getRainBgColor(mm: number): string {
  if (mm <= 0) return "transparent"
  if (mm < 5) return "#DBEAFE"
  if (mm < 15) return "#3B82F6"
  if (mm < 30) return "#1D4ED8"
  return "#1E3A5F"
}

export function getRainTextColor(mm: number): string {
  if (mm <= 0) return "#9CA3AF"
  if (mm < 5) return "#1E40AF"
  return "#FFFFFF"
}

export function getRainDisplay(mm: number): string {
  if (mm <= 0) return "—"
  const display = mm >= 10 ? Math.round(mm).toString() : mm.toFixed(1)
  if (mm >= 30) return display + "★"
  return display
}

export function getProbabilityColor(pct: number): string {
  if (pct < 30) return "#9CA3AF"
  if (pct <= 70) return "#D97706"
  return "#BFDBFE"
}

export function getMonsoonStatus(regions: RegionForecast[]): MonsoonStatus {
  const uradRegions = regions.filter((r) => r.region.uradBelt)
  if (uradRegions.length === 0) return "DRY"

  const next3DaysPerRegion = uradRegions.map((r) => {
    const days = r.days.slice(0, 3)
    const avg = days.reduce((sum, d) => sum + d.precipMm, 0) / Math.max(days.length, 1)
    return avg
  })

  const overallAvg = next3DaysPerRegion.reduce((a, b) => a + b, 0) / next3DaysPerRegion.length
  const anyAbove2 = next3DaysPerRegion.some((v) => v > 2)

  if (overallAvg > 5) return "ACTIVE"
  if (anyAbove2) return "APPROACHING"
  return "DRY"
}

export function getDataFreshness(fetchedAt: string): DataFreshness {
  const ageMs = Date.now() - new Date(fetchedAt).getTime()
  const ageHours = ageMs / (1000 * 60 * 60)
  if (ageHours < 1) return "fresh"
  if (ageHours <= 6) return "aging"
  return "stale"
}

export function formatDDMM(dateStr: string): string {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}`
}

export function formatIST(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function getTimeAgo(isoStr: string): string {
  const ageMs = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(ageMs / 60000)
  if (mins < 2) return "just now"
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours === 1) return "1 hour ago"
  return `${hours} hours ago`
}
