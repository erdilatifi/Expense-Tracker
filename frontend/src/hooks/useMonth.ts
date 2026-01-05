"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { monthNow } from "@/lib/api"

export function useMonth(): string {
  const sp = useSearchParams()
  const month = sp.get("month")

  return React.useMemo(() => month ?? monthNow(), [month])
}
