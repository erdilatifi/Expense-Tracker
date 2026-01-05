"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeft } from "lucide-react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)")
    const sync = () => {
      setIsDesktop(mql.matches)
      setExpanded(mql.matches)
    }
    sync()
    mql.addEventListener("change", sync)
    return () => mql.removeEventListener("change", sync)
  }, [])

  const mobileOverlay = expanded && !isDesktop
  const showSidebar = isDesktop || expanded

  const sidebarWidth = expanded ? 288 : 88

  React.useEffect(() => {
    if (!isDesktop) {
      setExpanded(false)
    }
  }, [pathname, isDesktop])

  return (
    <div className="mx-auto flex max-w-[1400px] items-start">
      <AnimatePresence initial={false}>
        {showSidebar ? (
          <motion.div
            key="sidebar"
            className={
              mobileOverlay
                ? "fixed left-0 top-0 z-50 h-dvh p-4"
                : "relative shrink-0 p-4"
            }
            style={{ width: mobileOverlay ? 288 : undefined }}
            initial={mobileOverlay ? { x: -24, opacity: 0 } : false}
            animate={
              mobileOverlay
                ? { x: 0, opacity: 1 }
                : { width: sidebarWidth, x: 0, opacity: 1 }
            }
            exit={mobileOverlay ? { x: -24, opacity: 0 } : undefined}
            transition={
              mobileOverlay
                ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                : { type: "spring", stiffness: 420, damping: 40 }
            }
          >
            <AppSidebar expanded={expanded} onExpandedChange={setExpanded} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="min-w-0 flex-1 px-4 pb-8 pt-20 md:px-6 md:pt-8">{children}</div>

      {!isDesktop && !expanded ? (
        <div className="fixed left-4 top-4 z-40 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15"
            aria-label="Open sidebar"
            onClick={() => setExpanded(true)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
      ) : null}

      <AnimatePresence>
        {mobileOverlay ? (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
