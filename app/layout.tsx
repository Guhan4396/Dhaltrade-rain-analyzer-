import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Monsoon Watch — Urad Dal Intelligence",
  description: "16-day monsoon forecast for the Gulbarga–Vidarbha urad dal growing belt. Daily AI procurement signal for traders.",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
