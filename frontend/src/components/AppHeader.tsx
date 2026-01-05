"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { api, centsToMoney, monthNow } from "@/lib/api"
import { onExpensesChanged } from "@/lib/events"
import { MonthPicker } from "@/components/MonthPicker"

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-transparent backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 py-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-white/5 md:px-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.20),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.16),transparent_45%)]" />

          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground/90">THIS MONTH</div>
              <div className="mt-1 truncate text-3xl font-semibold tracking-tight">{total}</div>
              <div className="mt-1 text-xs text-muted-foreground">Auto-updates when you add, edit, or delete expenses</div>
            </div>

            <div className="flex items-center gap-2 md:justify-end">
              <MonthPicker value={month} onChange={setMonth} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
