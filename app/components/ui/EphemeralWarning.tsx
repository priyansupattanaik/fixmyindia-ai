"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, X, AlertTriangle } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function EphemeralWarning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("fixmyindia_warning_dismissed");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("fixmyindia_warning_dismissed", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="w-full max-w-md"
          >
            <GlassCard
              intensity="strong"
              className="p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-saffron-200/30 to-transparent rounded-bl-full" />

              <div className="relative flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-saffron-100 text-saffron-600">
                    <EyeOff className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Privacy First
                    </h3>
                    <p className="text-sm text-slate-500">
                      How FixMyIndiaAI works
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                      1
                    </div>
                    <p className="text-sm text-slate-700 pt-1">
                      <span className="font-semibold">No account needed.</span>{" "}
                      Start reporting immediately without signup.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                      2
                    </div>
                    <p className="text-sm text-slate-700 pt-1">
                      <span className="font-semibold">Zero storage.</span> Your
                      reports exist only in this browser tab.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-bold">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-slate-700 pt-1">
                      <span className="font-semibold">
                        Disappears on close.
                      </span>{" "}
                      When you close this tab, everything is gone forever.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDismiss}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                  >
                    I understand, let's continue
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-2">
                    This notice won't appear again this session
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
