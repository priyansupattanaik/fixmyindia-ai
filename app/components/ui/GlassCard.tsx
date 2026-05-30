import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  intensity = "medium",
  interactive = false,
  className = "",
  onClick,
  ...props
}: GlassCardProps) {
  // Safe class handling without external 'cn' dependency
  const intensityStyles = {
    light: "bg-white/40 border-white/30",
    medium: "bg-white/60 border-white/40",
    strong: "bg-white/80 border-white/50",
  };

  const baseStyles =
    "backdrop-blur-md rounded-2xl border shadow-sm transition-all duration-200";

  const interactiveStyles =
    interactive || onClick
      ? "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2"
      : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((interactive || onClick) && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      className={`${baseStyles} ${intensityStyles[intensity]} ${interactiveStyles} ${className}`}
      onClick={onClick}
      role={interactive || onClick ? "button" : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </motion.div>
  );
}
