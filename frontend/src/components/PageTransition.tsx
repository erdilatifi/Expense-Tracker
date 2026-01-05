"use client"

import { motion } from "framer-motion"
import * as React from "react"

type MotionDivProps = { children?: React.ReactNode } & Record<string, unknown>
const MotionDiv = motion.div as unknown as React.ComponentType<MotionDivProps>

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </MotionDiv>
  )
}
