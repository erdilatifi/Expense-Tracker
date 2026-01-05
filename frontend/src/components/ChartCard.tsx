import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ChartCard(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold tracking-tight">{props.title}</CardTitle>
        {props.subtitle ? <div className="text-xs text-muted-foreground">{props.subtitle}</div> : null}
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}
