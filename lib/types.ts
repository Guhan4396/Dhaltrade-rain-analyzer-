export interface Region {
  id: string
  name: string
  lat: number
  lon: number
  state: string
  role: string
  uradBelt: boolean
}

export interface DayForecast {
  date: string
  precipMm: number
  precipProbability: number
  tempMax: number
  tempMin: number
  windspeedMax: number
}

export interface RegionForecast {
  region: Region
  days: DayForecast[]
  tomorrowDays: DayForecast[] | null
  weatherapiDays: DayForecast[] | null
}

export type SourceStatus = "ok" | "error" | "missing"

export interface WeatherResponse {
  regions: RegionForecast[]
  sources: {
    openmeteo: SourceStatus
    tomorrow: SourceStatus
    weatherapi: SourceStatus
  }
  fetchedAt: string
  nextRefreshAt: string
}

export interface SummaryResponse {
  status?: string
  outlook?: string
  risk?: string
  signal?: string
  generatedAt?: string
  nextRefreshAt?: string
  error?: boolean
  fallback?: string
}

export type MonsoonStatus = "ACTIVE" | "APPROACHING" | "DRY"
export type DataFreshness = "fresh" | "aging" | "stale"
