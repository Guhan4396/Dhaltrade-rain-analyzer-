import { NextResponse } from "next/server"
import { REGIONS } from "@/lib/regions"
import type { RegionForecast, DayForecast, SourceStatus, WeatherResponse } from "@/lib/types"

export const revalidate = 21600

async function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 10000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (e) {
    clearTimeout(id)
    throw e
  }
}

async function fetchOpenMeteo(lat: number, lon: number): Promise<DayForecast[]> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_probability_max` +
    `&forecast_days=16&timezone=Asia%2FKolkata`
  const res = await fetchWithTimeout(url, { next: { revalidate: 21600, tags: ["weather"] } })
  if (!res.ok) throw new Error(`OpenMeteo ${res.status}`)
  const data = await res.json()
  return data.daily.time.map((date: string, i: number) => ({
    date,
    precipMm: data.daily.precipitation_sum[i] ?? 0,
    precipProbability: data.daily.precipitation_probability_max[i] ?? 0,
    tempMax: data.daily.temperature_2m_max[i] ?? 0,
    tempMin: data.daily.temperature_2m_min[i] ?? 0,
    windspeedMax: data.daily.windspeed_10m_max[i] ?? 0,
  }))
}

async function fetchTomorrow(lat: number, lon: number, apiKey: string): Promise<DayForecast[]> {
  const url =
    `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}` +
    `&apikey=${apiKey}&timesteps=1d&units=metric`
  const res = await fetchWithTimeout(url, { next: { revalidate: 21600, tags: ["weather"] } })
  if (!res.ok) throw new Error(`Tomorrow ${res.status}`)
  const data = await res.json()
  return (data.timelines?.daily ?? []).map((d: { time: string; values: Record<string, number> }) => ({
    date: d.time.split("T")[0],
    precipMm: d.values.precipitationSum ?? 0,
    precipProbability: d.values.precipitationProbabilityAvg ?? 0,
    tempMax: d.values.temperatureMax ?? 0,
    tempMin: d.values.temperatureMin ?? 0,
    windspeedMax: d.values.windSpeedMax ?? 0,
  }))
}

async function fetchWeatherApi(lat: number, lon: number, apiKey: string): Promise<DayForecast[]> {
  const url =
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}` +
    `&q=${lat},${lon}&days=14&aqi=no&alerts=no`
  const res = await fetchWithTimeout(url, { next: { revalidate: 21600, tags: ["weather"] } })
  if (!res.ok) throw new Error(`WeatherAPI ${res.status}`)
  const data = await res.json()
  return (data.forecast?.forecastday ?? []).map((d: { date: string; day: Record<string, number> }) => ({
    date: d.date,
    precipMm: d.day.totalprecip_mm ?? 0,
    precipProbability: d.day.daily_chance_of_rain ?? 0,
    tempMax: d.day.maxtemp_c ?? 0,
    tempMin: d.day.mintemp_c ?? 0,
    windspeedMax: d.day.maxwind_kph ?? 0,
  }))
}

export async function GET() {
  const tomorrowKey = process.env.TOMORROW_API_KEY
  const weatherapiKey = process.env.WEATHERAPI_KEY

  let omStatus: SourceStatus = "ok"
  let tmStatus: SourceStatus = tomorrowKey ? "ok" : "missing"
  let waStatus: SourceStatus = weatherapiKey ? "ok" : "missing"

  const regionForecasts = await Promise.all(
    REGIONS.map(async (region): Promise<RegionForecast> => {
      let days: DayForecast[] = []
      try {
        days = await fetchOpenMeteo(region.lat, region.lon)
      } catch {
        omStatus = "error"
      }

      let tomorrowDays: DayForecast[] | null = null
      if (tomorrowKey) {
        try {
          tomorrowDays = await fetchTomorrow(region.lat, region.lon, tomorrowKey)
        } catch {
          tmStatus = "error"
        }
      }

      let weatherapiDays: DayForecast[] | null = null
      if (weatherapiKey) {
        try {
          weatherapiDays = await fetchWeatherApi(region.lat, region.lon, weatherapiKey)
        } catch {
          waStatus = "error"
        }
      }

      return { region, days, tomorrowDays, weatherapiDays }
    })
  )

  const fetchedAt = new Date().toISOString()
  const nextRefreshAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()

  const response: WeatherResponse = {
    regions: regionForecasts,
    sources: {
      openmeteo: omStatus,
      tomorrow: tmStatus,
      weatherapi: waStatus,
    },
    fetchedAt,
    nextRefreshAt,
  }

  return NextResponse.json(response)
}
