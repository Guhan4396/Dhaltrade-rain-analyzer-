import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2.5 py-0.5",
        buy:      "bg-emerald-600 text-white text-sm px-4 py-1.5",
        wait:     "bg-amber-500  text-white text-sm px-4 py-1.5",
        hold:     "bg-red-600    text-white text-sm px-4 py-1.5",
        urad:     "bg-amber-100  text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.5",
        fresh:    "bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.5",
        aging:    "bg-amber-50   text-amber-700  border border-amber-200  text-[11px] px-2 py-0.5",
        stale:    "bg-slate-100  text-slate-500  border border-slate-200  text-[11px] px-2 py-0.5",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
