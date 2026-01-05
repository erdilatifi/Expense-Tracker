import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard(props: {
  title: string
  value: string
  hint?: string
  right?: React.ReactNode
}) {
  return (
    <Card className="group relative overflow-hidden rounded-3xl border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.14),transparent_55%)]" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
          <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
        </div>
        {props.right ? <div className="text-muted-foreground">{props.right}</div> : null}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">{props.hint ?? "\u00A0"}</div>
      </CardContent>
    </Card>
  )
}
