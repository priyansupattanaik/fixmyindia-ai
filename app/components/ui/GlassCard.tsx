"use client";

import { motion } from "framer-motion";
import { GlassCardProps } from "@/app/types";

export function GlassCard({
  children,
  className = "",
  intensity = "medium",
  interactive = false,
  onClick,
}: GlassCardProps) {
  const intensityClasses = {
    light: "bg-white/40 border-white/30",
    medium: "bg-white/60 border-white/40 shadow-glass",
    strong: "bg-white/85 border-white/60 shadow-glass-lg backdrop-blur-xl",
  };

  const Component = interactive ? motion.button : motion.div;
  const interactiveProps = interactive
    ? {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
        onClick,
      }
    : {};

  return (
    <Component
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-md border
        ${intensityClasses[intensity]}
        ${interactive ? "cursor-pointer transition-shadow hover:shadow-glass-lg" : ""}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      {...interactiveProps}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
