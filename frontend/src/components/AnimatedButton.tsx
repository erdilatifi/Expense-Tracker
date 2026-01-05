"use client"

import { motion } from "framer-motion"
import * as React from "react"

import { Button } from "@/components/ui/button"

type Props = React.ComponentProps<typeof Button>

export function AnimatedButton({ children, ...props }: Props) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
      <Button {...props}>{children}</Button>
    </motion.div>
  )
}
