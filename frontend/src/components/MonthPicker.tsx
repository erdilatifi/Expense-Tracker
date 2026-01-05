"use client"

import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function fmtLabel(month: string) {
  const [y, m] = month.split("-")
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleString(undefined, { month: "long", year: "numeric" })
}

export function lastNMonths(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  d.setDate(1)
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    out.push(`${y}-${m}`)
    d.setMonth(d.getMonth() - 1)
  }
  return out
}

export function MonthPicker(props: { value: string; onChange: (v: string) => void }) {
  const options = React.useMemo(() => lastNMonths(18), [])

  return (
    <Select value={props.value} onValueChange={props.onChange}>
      <SelectTrigger className="h-10 w-full rounded-2xl border-white/10 bg-white/5 text-sm font-medium tracking-tight shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/10">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)] rounded-2xl border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        {options.map((m) => (
          <SelectItem key={m} value={m}>
            {fmtLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
