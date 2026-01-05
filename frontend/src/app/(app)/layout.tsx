import * as React from "react"

import { AppShell } from "@/components/AppShell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-background via-background to-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(99,102,241,0.12),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.10),transparent_50%)]" />
      <div className="relative">
        <React.Suspense fallback={<div className="mx-auto flex max-w-[1400px] px-4 py-8 md:px-6" />}> 
          <AppShell>{children}</AppShell>
        </React.Suspense>
      </div>
    </div>
  )
}
