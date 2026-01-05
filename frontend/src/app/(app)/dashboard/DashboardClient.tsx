"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { api, centsToMoney } from "@/lib/api"
import type { DashboardResponse } from "@/types/expense"
import { ChartCard } from "@/components/ChartCard"
import { PageTransition } from "@/components/PageTransition"
import { StatCard } from "@/components/StatCard"
import { useMonth } from "@/hooks/useMonth"
import { useMounted } from "@/hooks/useMounted"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function DashboardClient() {
  const month = useMonth()
  const mounted = useMounted()

  const [data, setData] = React.useState<DashboardResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const byCategory = React.useMemo(() => {
    const raw = data?.by_category ?? []
    return raw
      .map((x) => ({ ...x, total_cents: Number(x.total_cents) }))
      .filter((x) => x.total_cents > 0)
  }, [data])

  const byCategoryTotal = React.useMemo(() => {
    return byCategory.reduce((acc, x) => acc + x.total_cents, 0)
  }, [byCategory])

  const overTimeSeries = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data?.over_time ?? []) {
      map.set(String(row.day), Number(row.total_cents))
    }

    const [yStr, mStr] = month.split("-")
    const y = Number(yStr)
    const m = Number(mStr)
    if (!Number.isFinite(y) || !Number.isFinite(m)) {
      return [] as Array<{ day: string; total_cents: number }>
    }

    const end = new Date(y, m, 0) // last day of month
    const daysInMonth = end.getDate()

    const out: Array<{ day: string; total_cents: number }> = []
    for (let d = 1; d <= daysInMonth; d++) {
      const day = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      out.push({ day, total_cents: map.get(day) ?? 0 })
    }
    return out
  }, [data, month])

  const overTimeTotal = React.useMemo(() => {
    return overTimeSeries.reduce((acc, x) => acc + x.total_cents, 0)
  }, [overTimeSeries])

  React.useEffect(() => {
    let cancelled = false
    setError(null)
    setData(null)

    api.dashboard
      .get(month)
      .then((d) => {
        if (cancelled) return
        setData(d)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
      })

    return () => {
      cancelled = true
    }
  }, [month])

  const cards = React.useMemo(() => {
    if (!data) return null
    const { totals } = data
    const deltaLabel =
      totals.delta_pct === null
        ? "No data for last month"
        : `${totals.delta_pct >= 0 ? "+" : ""}${totals.delta_pct.toFixed(1)}% vs last month`

    return {
      total: centsToMoney(totals.this_month_cents),
      lastMonth: centsToMoney(totals.last_month_cents),
      delta: centsToMoney(totals.delta_cents),
      deltaLabel,
    }
  }, [data])

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-muted-foreground">Overview</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">{error}</div>
        ) : null}

        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
          <motion.div variants={item}>
            <StatCard title="Total spent" value={cards?.total ?? "—"} hint={cards?.deltaLabel} />
          </motion.div>
          <motion.div variants={item}>
            <StatCard title="Last month" value={cards?.lastMonth ?? "—"} />
          </motion.div>
          <motion.div variants={item}>
            <StatCard title="Change" value={cards?.delta ?? "—"} hint="This month minus last month" />
          </motion.div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div variants={item} initial="hidden" animate="show" className="min-w-0">
            <ChartCard title="Top categories" subtitle="Where your money went">
              <div className="h-[320px] min-w-0">
                {mounted ? (
                  byCategory.length > 0 ? (
                    <div className="flex h-full flex-col justify-between gap-3">
                      <div className="space-y-3">
                        {byCategory.slice(0, 6).map((c) => {
                          const pct = byCategoryTotal > 0 ? (c.total_cents / byCategoryTotal) * 100 : 0
                          return (
                            <div key={c.id} className="space-y-2">
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                                  <span className="truncate">{c.name}</span>
                                </div>
                                <div className="shrink-0 tabular-nums text-muted-foreground">
                                  {centsToMoney(c.total_cents)}
                                  <span className="ml-2 text-xs">{pct.toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: c.color, opacity: 0.85 }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">Tip: open Expenses to see the full breakdown pie.</div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-center">
                        <div className="text-sm font-medium">No expenses yet</div>
                        <div className="mt-1 text-xs text-muted-foreground">Add a few expenses to see category breakdown.</div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>
            </ChartCard>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show" className="min-w-0">
            <ChartCard title="Over time" subtitle="Daily totals">
              <div className="h-[320px] min-w-0">
                {mounted ? (
                  <div className="relative h-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <LineChart data={overTimeSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="day"
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                          minTickGap={18}
                          tickMargin={8}
                          tickFormatter={(v: string) => {
                            // v is YYYY-MM-DD
                            const day = v?.slice(8, 10)
                            return day?.startsWith("0") ? day.slice(1) : day
                          }}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          width={40}
                          tickFormatter={(v) => `$${Math.round(Number(v) / 100)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "rgba(15, 15, 15, 0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 16,
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value: unknown) => [centsToMoney(Number(value)), "Total"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total_cents"
                          stroke="rgba(99,102,241,0.95)"
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {overTimeTotal === 0 ? (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
                          No expenses this month yet
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>
            </ChartCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
