# Design System — Canonical Standard

This is the base design system for every product we build. Do not deviate from it without explicit instruction.

---

## Stack (non-negotiable)

| Layer | Library | Stars |
|---|---|---|
| Framework | Next.js 14+ (App Router) | — |
| Styling | Tailwind CSS v3 | — |
| Component primitives | shadcn/ui pattern (Radix UI + CVA + Tailwind) | ~82k |
| Icons | `lucide-react` | ~12k |
| Charts | `recharts` | ~24k |
| Class utilities | `clsx` + `tailwind-merge` | ~8k / ~9k |
| Variant engine | `class-variance-authority` | ~5k |
| Font | Inter via `next/font/google` | — |

Install for every new project:
```bash
npm install lucide-react recharts clsx tailwind-merge class-variance-authority
```

---

## File Structure

```
lib/
  utils.ts            ← cn() utility — always present
components/
  ui/
    badge.tsx         ← CVA badge with all signal/status variants
    card.tsx          ← Card, CardHeader, CardContent, CardTitle, CardSubtitle
    skeleton.tsx      ← Loading skeleton
  [feature].tsx       ← Feature components import from ui/
app/
  globals.css         ← CSS custom properties + @layer utilities
  layout.tsx          ← Inter font, OG metadata, themeColor
tailwind.config.ts    ← Design tokens (colors, shadows, animations, fonts)
```

---

## `lib/utils.ts` — always ship this first

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Design Tokens (`tailwind.config.ts`)

```ts
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      mono: ["JetBrains Mono", "Menlo", "monospace"],
    },
    boxShadow: {
      card:        "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
      "card-hover":"0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08)",
      panel:       "0 2px 8px 0 rgb(0 0 0 / 0.10), 0 1px 3px -1px rgb(0 0 0 / 0.08)",
    },
    borderRadius: {
      xl:   "0.75rem",
      "2xl":"1rem",
    },
    animation: {
      "fade-in":  "fadeIn 0.2s ease-out",
      "slide-up": "slideUp 0.3s ease-out",
    },
    keyframes: {
      fadeIn:  { from: { opacity: "0" },                              to: { opacity: "1" } },
      slideUp: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
    },
  },
}
```

Add product-specific color scales under `colors:` in each project's config.

---

## CSS Custom Properties (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --navy:        #0F172A;
    --navy-light:  #1E293B;
    --slate-mid:   #475569;
    --slate-light: #94A3B8;
    --border:      #E2E8F0;
    --bg-page:     #F8FAFC;
    --bg-card:     #FFFFFF;
    --radius:      0.75rem;
  }

  html { scroll-behavior: smooth; }

  body {
    background-color: var(--bg-page);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  * { -webkit-tap-highlight-color: transparent; }
}

@layer components {
  .section-title {
    @apply text-lg font-bold text-[#0F172A] border-l-[3px] border-[#0F172A] pl-3 leading-tight;
  }
  .section-subtitle {
    @apply text-[12px] text-slate-400 pl-3 mt-0.5;
  }
  .card {
    @apply bg-white rounded-xl border border-slate-200 shadow-card;
  }
  .card-dark {
    @apply bg-[#0F172A] rounded-xl border border-slate-700 shadow-panel;
  }
}
```

---

## `app/layout.tsx` — base template

```tsx
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Product Name",
  description: "One-line description.",
  openGraph: { title: "Product Name", description: "One-line description.", type: "website" },
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
```

---

## Component Primitives

### `components/ui/badge.tsx`

CVA-powered. Add variants per product — never hardcode colors on a badge inline.

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2.5 py-0.5",
        // — add product-specific variants below —
        fresh:   "bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.5",
        aging:   "bg-amber-50   text-amber-700  border border-amber-200  text-[11px] px-2 py-0.5",
        stale:   "bg-slate-100  text-slate-500  border border-slate-200  text-[11px] px-2 py-0.5",
        success: "bg-emerald-600 text-white text-sm px-4 py-1.5",
        warning: "bg-amber-500  text-white text-sm px-4 py-1.5",
        danger:  "bg-red-600    text-white text-sm px-4 py-1.5",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

### `components/ui/card.tsx`

```tsx
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white rounded-xl border border-slate-200 shadow-card", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-3", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-bold text-[#0F172A] border-l-[3px] border-[#0F172A] pl-3 leading-tight", className)} {...props} />
  )
}
export function CardSubtitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[12px] text-slate-400 pl-3 mt-0.5", className)} {...props} />
}
```

### `components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} {...props} />
}
```

---

## Design Rules

### Color
- Page background: `#F8FAFC` (slate-50)
- Card background: `#FFFFFF`
- Dark panels / headers: `#0F172A` (navy)
- Primary text: `#0F172A`
- Secondary text: `slate-400` / `slate-500`
- Borders: `slate-200`
- Never hardcode a hex color in a component — use a Tailwind token or a CSS variable

### Typography
- All products use **Inter** loaded via `next/font/google`
- Section headings always use `.section-title` (left accent bar pattern)
- Sub-labels always use `.section-subtitle`
- Monospace values (numbers, dates, codes): `font-mono`

### Spacing & Radius
- Cards: `rounded-xl` (0.75rem)
- Modals / large surfaces: `rounded-2xl` (1rem)
- Buttons: `rounded-lg`
- Badges/pills: `rounded-full`
- Page max-width: `max-w-[1280px] mx-auto px-4`

### Shadows
- Cards: `shadow-card`
- Card on hover: `shadow-card-hover` + `transition-shadow`
- Dark panels: `shadow-panel`

### Icons
- Always use **Lucide React** — never inline SVGs unless custom
- Size: `w-4 h-4` default, `w-5 h-5` for header/hero icons
- Stroke: `strokeWidth={2}` default, `strokeWidth={2.5}` for emphasis icons

### Animation
- Entry: `animate-fade-in` on panels/cards
- Loading: `animate-pulse` via `<Skeleton>`
- Spinning loaders: `animate-spin` on a Lucide icon
- Interactive: `transition-shadow hover:shadow-card-hover`, `active:scale-95` on buttons

### Charts
- Always use **Recharts** for data visualization
- Sparklines: `<ResponsiveContainer height={28}>` + `<BarChart barSize={6}>`
- Color bars by data value — never a flat single color for quantitative data
- Tooltips: `fontSize: 11`, `borderRadius: 6`, `border: "1px solid #e2e8f0"`

### Buttons
```tsx
// Primary
"bg-[#0F172A] text-white hover:bg-slate-700 active:scale-95 rounded-lg px-4 py-2 text-sm font-medium transition-all"
// Disabled
"bg-slate-100 text-slate-400 cursor-not-allowed"
// Loading
"bg-blue-50 text-blue-500 cursor-wait"
```

### Loading States
- Use `<Skeleton>` for every content block that loads async
- Match skeleton dimensions to the real content height
- Dark-surface skeletons: override with `bg-slate-700`

### Status / Freshness Pattern
- Green pulse dot = fresh data (< 2h)
- Amber dot = aging (2–8h)
- Grey dot = stale (> 8h)
- Always show a `<Badge>` with a `<Clock>` icon and "X ago" text next to data timestamps

### Accessibility
- All interactive elements: `min-h-[44px]` touch target
- Color is never the only signal — pair with icon or text
- `aria-label` on icon-only buttons
- `lang="en"` on `<html>`

---

## Design Metrics (targets for every product)

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 95 |
| Lighthouse SEO | ≥ 90 |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID / INP | < 100ms |
| WCAG | 2.1 AA |
| Mobile breakpoint | 640px (sm) |
| Touch target minimum | 44 × 44px |
| Font rendering | antialiased, subpixel smoothing |

---

## What NOT to do

- Do not inline SVG icons — use Lucide
- Do not use arbitrary hex colors in className — use tokens
- Do not create a new shadow/radius value outside tailwind.config
- Do not use a different chart library
- Do not use a different font
- Do not skip `<Skeleton>` on async content
- Do not hardcode `gray-` Tailwind colors — use `slate-` for consistency
- Do not add a component to `components/ui/` that duplicates an existing one — extend it with a new CVA variant instead
