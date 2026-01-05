"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { api, centsToMoney } from "@/lib/api"
import { emitExpensesChanged } from "@/lib/events"
import type { Category, DashboardResponse, Expense } from "@/types/expense"
import { AnimatedButton } from "@/components/AnimatedButton"
import { ChartCard } from "@/components/ChartCard"
import { ExpenseTable } from "@/components/ExpenseTable"
import { ExpenseUpsertDialog } from "@/components/ExpenseUpsertDialog"
import { PageTransition } from "@/components/PageTransition"
import { useMonth } from "@/hooks/useMonth"
import { useMounted } from "@/hooks/useMounted"

export default function ExpensesClient() {
  const month = useMonth()
  const mounted = useMounted()

  const [categories, setCategories] = React.useState<Category[]>([])
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [dashboard, setDashboard] = React.useState<DashboardResponse | null>(null)

  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Expense | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function refresh() {
    const [cats, exps, dash] = await Promise.all([
      api.categories.list(),
      api.expenses.list({ month, limit: 100 }),
      api.dashboard.get(month),
    ])
    setCategories(cats)
    setExpenses(exps)
    setDashboard(dash)
  }

  React.useEffect(() => {
    let cancelled = false
    setError(null)

    Promise.all([api.categories.list(), api.expenses.list({ month, limit: 100 }), api.dashboard.get(month)])
      .then(([cats, exps, dash]) => {
        if (cancelled) return
        setCategories(cats)
        setExpenses(exps)
        setDashboard(dash)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load")
      })

    return () => {
      cancelled = true
    }
  }, [month])

  const total = React.useMemo(() => expenses.reduce((acc, e) => acc + e.amount_cents, 0), [expenses])

  const byCategory = React.useMemo(() => {
    const raw = dashboard?.by_category ?? []
    return raw
      .map((x) => ({ ...x, total_cents: Number(x.total_cents) }))
      .filter((x) => x.total_cents > 0)
  }, [dashboard])

  const byCategoryTotal = React.useMemo(() => byCategory.reduce((acc, x) => acc + x.total_cents, 0), [byCategory])

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <div className="text-sm text-muted-foreground">Manage</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Expenses</div>
            <div className="mt-1 text-sm text-muted-foreground">Total in view: {centsToMoney(total)}</div>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <AnimatedButton
              className="rounded-2xl"
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
            >
              Add expense
            </AnimatedButton>
          </motion.div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">{error}</div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1 min-w-0">
            <ChartCard title="Breakdown" subtitle="Expenses by category">
              <div className="h-[320px] min-w-0">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15, 15, 15, 0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 16,
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: unknown) => {
                          const cents = Number(value)
                          const pct = byCategoryTotal > 0 ? (cents / byCategoryTotal) * 100 : 0
                          return [`${centsToMoney(cents)} • ${pct.toFixed(1)}%`, "Total"]
                        }}
                      />
                      <Pie
                        data={byCategory}
                        dataKey="total_cents"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                        isAnimationActive
                      >
                        {byCategory.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} fillOpacity={0.9} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>

              <div className="mt-3 space-y-2">
                {(dashboard?.by_category ?? []).filter((x) => x.total_cents > 0).slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="tabular-nums">{centsToMoney(c.total_cents)}</div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ExpenseTable
              rows={expenses}
              onEdit={(row) => {
                setEditing(row)
                setOpen(true)
              }}
              onDelete={async (row) => {
                await api.expenses.remove(row.id)
                emitExpensesChanged()
                await refresh()
              }}
            />
          </div>
        </div>

        <ExpenseUpsertDialog
          open={open}
          onOpenChange={setOpen}
          categories={categories}
          initial={editing}
          defaultDate={`${month}-01`}
          onSubmit={async (v) => {
            if (editing) {
              await api.expenses.update(editing.id, v)
            } else {
              await api.expenses.create(v)
            }
            emitExpensesChanged()
            setOpen(false)
            setEditing(null)
            await refresh()
          }}
        />
      </div>
    </PageTransition>
  )
}
