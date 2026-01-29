"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Zap,
  MapPin,
  MessageSquare,
  Sparkles,
  Clock,
  EyeOff,
} from "lucide-react";
import { useSessionState } from "@/app/hooks/useSessionState";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { EphemeralWarning } from "@/app/components/ui/EphemeralWarning";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/app/components/animations/PageTransition";
import { CategorySelector } from "@/app/components/query/CategorySelector";
import { QueryCategory } from "@/app/types";

export default function Home() {
  const router = useRouter();
  const { createQuery, updateQuery } = useSessionState();
  const [quickText, setQuickText] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<QueryCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickStart = () => {
    if (quickText.trim().length < 10) return;

    setIsSubmitting(true);
    const id = createQuery(quickText);
    if (selectedCategory) {
      updateQuery({ category: selectedCategory });
    }

    setTimeout(() => {
      router.push("/report");
    }, 300);
  };

  const features = [
    { icon: MapPin, title: "Precise Location", desc: "Pin exact spots on map" },
    {
      icon: MessageSquare,
      title: "AI Solutions",
      desc: "Instant actionable steps",
    },
    { icon: Shield, title: "100% Private", desc: "No data stored ever" },
    { icon: Zap, title: "Instant", desc: "Results in seconds" },
  ];

  return (
    <PageTransition>
      <EphemeralWarning />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-10 w-96 h-96 bg-saffron-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 w-72 h-72 bg-chakra-200/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <FadeIn delay={0}>
            <motion.div
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4 text-saffron-500" />
              <span className="text-sm font-medium text-slate-700">
                AI-Powered Civic Solutions
              </span>
            </motion.div>
          </FadeIn>

          <StaggerContainer className="space-y-4">
            <StaggerItem>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-900 leading-tight">
                Fix Your City <br />
                <span className="text-gradient-saffron">
                  Without the Red Tape
                </span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Report potholes, Aadhaar issues, power cuts, and more. Get exact
                steps to resolve them—whom to call, what to say, and where to
                go.
              </p>
            </StaggerItem>
          </StaggerContainer>

          <FadeIn
            delay={0.4}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-500"
          >
            <div className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4" />
              <span>No login required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>30 seconds to report</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Data disappears on close</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.6} className="max-w-2xl mx-auto pt-8">
            <GlassCard intensity="strong" className="p-2 sm:p-4">
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                    placeholder="Describe your issue... (e.g., 'Huge pothole near City Hospital main gate, causing accidents daily')"
                    className="w-full p-4 text-lg bg-transparent border-0 outline-none resize-none placeholder:text-slate-400 min-h-[120px]"
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                    {quickText.length} chars
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <CategorySelector
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <motion.button
                    onClick={handleQuickStart}
                    disabled={quickText.trim().length < 10 || isSubmitting}
                    className={`
                      flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-bold text-lg transition-all
                      ${
                        quickText.trim().length >= 10 && !isSubmitting
                          ? "bg-saffron-500 text-white shadow-saffron-glow hover:bg-saffron-600"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }
                    `}
                    whileHover={
                      quickText.trim().length >= 10 ? { scale: 1.02 } : {}
                    }
                    whileTap={
                      quickText.trim().length >= 10 ? { scale: 0.98 } : {}
                    }
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="h-6 w-6 border-3 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : (
                      <>
                        <span>Get Instant Solution</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </GlassCard>

            <p className="mt-3 text-sm text-slate-500">
              Add photos and exact location on the next step for precision
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-4xl mx-auto">
            {features.map((feature, idx) => (
              <FadeIn key={feature.title} delay={0.8 + idx * 0.1}>
                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 text-center space-y-2 hover:bg-white/60 transition-colors">
                  <div className="inline-flex p-3 rounded-xl bg-white shadow-sm text-saffron-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-600">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Three simple steps to civic solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe & Locate",
                desc: "Tell us the issue and drop a pin on the map. Add photos for clarity.",
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Our AI identifies the right department, laws, and procedures applicable to your issue.",
              },
              {
                step: "03",
                title: "Take Action",
                desc: "Get exact contact numbers, email templates, office addresses, and follow-up steps.",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-saffron-200/50 absolute -top-6 -left-2">
                  {item.step}
                </div>
                <GlassCard
                  intensity="medium"
                  className="p-6 h-full relative z-10"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 border-t border-white/30 bg-white/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="font-bold text-slate-800">FixMyIndiaAI</span>
          </div>
          <p className="text-sm text-slate-500 text-center">
            Made for India • No data stored • Open Source • Free forever
          </p>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>Private</span>
            </span>
            <span className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>Fast</span>
            </span>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
