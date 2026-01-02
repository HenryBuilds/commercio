"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30">
      {/* Animated gradient blob */}
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl"
        animate={{
          x: mousePosition.x * 0.5,
          y: mousePosition.y * 0.5,
          scale: [1, 1.2, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 20 },
          y: { type: "spring", stiffness: 50, damping: 20 },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-primary/15 via-primary/5 to-transparent blur-3xl"
        animate={{
          x: mousePosition.x * -0.3,
          y: mousePosition.y * -0.3,
          scale: [1, 1.15, 1],
        }}
        transition={{
          x: { type: "spring", stiffness: 40, damping: 20 },
          y: { type: "spring", stiffness: 40, damping: 20 },
          scale: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
      
    </div>
  )
}

