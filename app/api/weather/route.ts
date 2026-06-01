import { NextResponse } from "next/server"
import { fetchAllWeather } from "@/lib/fetch-weather"

export const revalidate = 21600

export async function GET() {
  const data = await fetchAllWeather()
  return NextResponse.json(data)
}
