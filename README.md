# Monsoon Watch — Urad Dal Intelligence

A daily weather intelligence app for an urad dal commodity trader in Chennai, India. Tracks 16-day monsoon forecasts across the Gulbarga–Vidarbha urad growing belt, with cross-source validation and an AI procurement signal (BUY NOW / WAIT AND WATCH / HOLD POSITION).

## What this app does

- **16-day heatmap** — daily rainfall (mm) across 8 key districts, color-coded by intensity
- **AI Daily Signal** — Claude analyses all forecast data and gives a sharp procurement recommendation
- **Multi-source validation** — Open-Meteo, Tomorrow.io, and WeatherAPI cross-checked side-by-side
- **Live Windy map** — real-time rainfall overlay centered on the urad belt
- **Auto-refresh** — weather data refreshes every 6 hours; AI summary refreshes daily
- **Manual refresh** — "Refresh Now" button to bust cache on demand

## Monitored Districts

| District | State | Role |
|---|---|---|
| Gulbarga (Kalaburagi) | Karnataka | Primary urad district |
| Bidar | Karnataka | Primary urad district |
| Latur | Maharashtra | Major urad trading hub |
| Nanded | Maharashtra | Marathwada urad belt |
| Marathwada (Aurangabad) | Maharashtra | Marathwada urad region |
| Vidarbha (Nagpur) | Maharashtra | Vidarbha urad region |
| Hyderabad | Telangana | Regional commodity hub |
| Chennai | Tamil Nadu | Trader base |

## Local Setup

```bash
git clone https://github.com/Guhan4396/Dhaltrade-rain-analyzer-.git
cd Dhaltrade-rain-analyzer-
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
# Open http://localhost:3000
```

## API Keys

The app works immediately with **no keys at all** — Open-Meteo and Windy are always free with no key required.

Add these for full features:

| Key | Where to get | What it unlocks |
|---|---|---|
| `TOMORROW_API_KEY` | [app.tomorrow.io/signup](https://app.tomorrow.io/signup) (free) | Second weather source for cross-validation |
| `WEATHERAPI_KEY` | [weatherapi.com/signup.aspx](https://www.weatherapi.com/signup.aspx) (free) | Third weather source for cross-validation |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Daily AI summary + BUY/WAIT/HOLD signal |

Add them to `.env.local`:

```
TOMORROW_API_KEY=your_key_here
WEATHERAPI_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## Deploy to Vercel (GitHub)

1. Push this repo to GitHub (already done if you're reading this there)
2. Go to [vercel.com](https://vercel.com) → **New Project** → **Import from GitHub** → select `Dhaltrade-rain-analyzer-`
3. In the Vercel dashboard, go to **Settings → Environment Variables** and add:
   - `TOMORROW_API_KEY`
   - `WEATHERAPI_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_BASE_URL` → your Vercel deployment URL (e.g. `https://monsoon-watch.vercel.app`)
4. Click **Deploy** — done

> **Important:** Set `NEXT_PUBLIC_BASE_URL` to your Vercel URL so the server-side API calls work correctly in production.

## Data Refresh Schedule

| Source | Refresh interval | Reason |
|---|---|---|
| Open-Meteo | Every 6 hours | Aligns with model update cycle (00:00, 06:00, 12:00, 18:00 UTC) |
| Tomorrow.io | Every 6 hours | — |
| WeatherAPI | Every 6 hours | — |
| AI Summary | Every 24 hours | Strategic signal — once-daily is sufficient |
| Windy map | Always live | Streaming embed, no caching |
| Manual | On demand | "Refresh Now" button busts all caches immediately |

## Environment Variables Reference

```env
# Required for AI summary (optional — app works without it)
ANTHROPIC_API_KEY=

# Optional — second weather source
TOMORROW_API_KEY=

# Optional — third weather source
WEATHERAPI_KEY=

# Required for production Vercel deploy
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```
