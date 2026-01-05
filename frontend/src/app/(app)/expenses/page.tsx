import * as React from "react"

import ExpensesClient from "./ExpensesClient"

export default function ExpensesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-7 w-40 animate-pulse rounded-xl bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white/10" />
            <div className="lg:col-span-2 h-96 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      }
    >
      <ExpensesClient />
    </React.Suspense>
  )
}
