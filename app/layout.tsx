import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Monsoon Watch — Urad Dal Intelligence",
  description:
    "16-day monsoon forecast for the Gulbarga–Vidarbha urad dal growing belt. Daily AI procurement signal for traders.",
  keywords: ["monsoon", "urad dal", "weather", "procurement", "India", "Gulbarga", "Vidarbha"],
  openGraph: {
    title: "Monsoon Watch — Urad Dal Intelligence",
    description: "16-day monsoon forecast with AI procurement signal for urad dal traders.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  )
}
