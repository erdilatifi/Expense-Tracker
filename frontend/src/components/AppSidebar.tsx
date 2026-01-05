"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, LayoutDashboard, Receipt } from "lucide-react"

import { api, centsToMoney, monthNow } from "@/lib/api"
import { onExpensesChanged } from "@/lib/events"
import { cn } from "@/lib/utils"
import { MonthPicker } from "@/components/MonthPicker"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
]

export function AppSidebar(props: { expanded: boolean; onExpandedChange: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const sp = useSearchParams()

  const month = sp.get("month") ?? monthNow()
  const [total, setTotal] = React.useState<string>("—")

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setTotal("—")
      try {
        const d = await api.dashboard.get(month)
        if (cancelled) return
        setTotal(centsToMoney(d.totals.this_month_cents))
      } catch {
        if (cancelled) return
        setTotal("—")
      }
    }

    load()
    const off = onExpensesChanged(load)
    return () => {
      cancelled = true
      off()
    }
  }, [month])

  function setMonth(m: string) {
    const next = new URLSearchParams(Array.from(sp.entries()))
    next.set("month", m)
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <aside className="h-auto">
      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-white/5 md:h-auto">
        <div className={cn("p-4", props.expanded ? "" : "px-3")}> 
          <div className={cn("flex items-start justify-between", props.expanded ? "gap-3" : "justify-center")}> 
            <div className={cn("min-w-0", props.expanded ? "" : "hidden")}> 
              <div className="text-sm font-medium tracking-tight text-muted-foreground">Personal</div>
              <div className="mt-1 text-lg font-semibold tracking-tight">Expense Tracker</div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10",
                props.expanded ? "" : "h-10 w-10"
              )}
              aria-label={props.expanded ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => props.onExpandedChange(!props.expanded)}
            >
              <motion.div
                animate={{ rotate: props.expanded ? 0 : 180 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.div>
            </Button>
          </div>

          <AnimatePresence initial={false}>
            {props.expanded ? (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4"
              >
                <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground/90">THIS MONTH</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">{total}</div>
                <div className="mt-3">
                  <MonthPicker value={month} onChange={setMonth} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <Separator className="bg-white/10" />
        <nav className={cn("p-3", props.expanded ? "" : "px-2")}> 
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative mb-1 flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2 text-sm transition",
                  props.expanded ? "justify-between" : "justify-center",
                  active
                    ? "text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.30)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active ? (
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.35),rgba(236,72,153,0.20),rgba(255,255,255,0.06))]" />
                ) : (
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white/5" />
                )}
                <span className="relative flex items-center gap-3">
                  <span className="relative grid place-items-center">
                    <Icon className="relative h-4 w-4" />
                  </span>
                  {props.expanded ? <span>{item.label}</span> : null}
                </span>

                {props.expanded ? (active ? <span className="relative h-1.5 w-1.5 rounded-full bg-primary" /> : <span className="relative h-1.5 w-1.5" />) : null}
              </Link>
            )
          })}
        </nav>
        <AnimatePresence initial={false}>
          {props.expanded ? (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="px-5 pb-5 pt-3"
            >
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
                <div className="text-xs text-muted-foreground">Tip</div>
                <div className="mt-1 text-sm">Use the month picker to replay your spending trends.</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </aside>
  )
}
