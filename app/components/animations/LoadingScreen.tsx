"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { LoadingScreenProps } from "@/app/types";
import { Loader2, MapPin, FileText, Cpu } from "lucide-react";

export function LoadingScreen({
  message = "Loading...",
  subMessage = "Please wait while we prepare your experience",
  variant = "full",
  progress,
}: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-saffron-500" />
          <p className="text-sm text-slate-600">
            {message}
            {dots}
          </p>
        </div>
      </div>
    );
  }

  const content = (
    <div
      className={`flex flex-col items-center justify-center ${variant === "full" ? "min-h-screen" : "min-h-[400px]"} w-full`}
    >
      <div className="relative mb-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-saffron-400 opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron-500 to-saffron-600 shadow-saffron-glow"
          animate={{
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Cpu className="h-12 w-12 text-white" />
        </motion.div>

        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 rounded-full bg-chakra-500"
            animate={{
              x: Math.cos(i * 2.09) * 50,
              y: Math.sin(i * 2.09) * 50,
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            style={{ left: "50%", top: "50%", marginLeft: -6, marginTop: -6 }}
          />
        ))}
      </div>

      <motion.h2
        className="text-2xl font-bold text-slate-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
        {dots}
      </motion.h2>

      <motion.p
        className="mt-2 text-center text-slate-600 max-w-md px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {subMessage}
      </motion.p>

      {progress !== undefined && (
        <div className="mt-8 w-64 max-w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-saffron-500 to-chakra-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-slate-500">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      <motion.div
        className="mt-12 flex space-x-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: MapPin, label: "Locate" },
          { icon: FileText, label: "Report" },
          { icon: Cpu, label: "Resolve" },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm">
              <item.icon className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-slate-400">
          Private & Secure • No data stored on servers • Disappears when you
          close this tab
        </p>
      </motion.div>
    </div>
  );

  if (variant === "overlay") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white/80 backdrop-blur-md"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-paper"
    >
      {content}
    </motion.div>
  );
}

export function LocationLoading() {
  return (
    <LoadingScreen
      variant="overlay"
      message="Finding your location"
      subMessage="Please allow location access when prompted. This helps us route your query to the correct local authority."
      progress={undefined}
    />
  );
}

export function AnalyzingLoading() {
  return (
    <LoadingScreen
      variant="overlay"
      message="Analyzing your report"
      subMessage="Our AI is examining the details and preparing actionable steps specific to your location and issue type."
    />
  );
}
