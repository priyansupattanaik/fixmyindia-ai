"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { QueryComposer } from "@/app/components/query/QueryComposer";
import { useSessionState } from "@/app/hooks/useSessionState";
import {
  PageTransition,
  FadeIn,
} from "@/app/components/animations/PageTransition";
import { UploadedImage, GeoLocation, QueryCategory } from "@/app/types";
import { getDailyCivicTip } from "@/app/actions/getDailyTip"; // You need to create this file

export default function Home() {
  const router = useRouter();
  const { startQuery } = useSessionState();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dailyTip, setDailyTip] = useState("Loading today's civic insight...");

  // Fetch the AI tip on mount
  useEffect(() => {
    getDailyCivicTip().then(setDailyTip);
  }, []);

  const handleAnalyze = async (data: {
    text: string;
    category: QueryCategory | null;
    images: UploadedImage[];
    location: GeoLocation | null;
  }) => {
    setIsAnalyzing(true);

    // Start the session state
    startQuery({
      text: data.text,
      category: data.category, // Can be null, backend will handle it
      images: data.images,
      location: data.location,
    });

    // Simulate a brief "thinking" delay for UX before routing
    setTimeout(() => {
      router.push("/solution");
    }, 800);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Dynamic AI Header */}
        <FadeIn
          delay={0.1}
          className="w-full max-w-2xl text-center mb-8 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-saffron-50 border border-saffron-100 text-saffron-700 text-xs font-semibold mb-4 uppercase tracking-wider"
          >
            AI-Powered Citizen Support
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Fix My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 via-white to-green-600 bg-[length:100%_auto]">
              India
            </span>
          </h1>

          {/* The AI Tip appears here */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
            {dailyTip}
          </p>
        </FadeIn>

        {/* The New "Smart" Composer */}
        <FadeIn delay={0.2} className="w-full relative z-20">
          <QueryComposer onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </FadeIn>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-saffron-200/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-200/20 rounded-full blur-[120px]" />
        </div>
      </div>
    </PageTransition>
  );
}
