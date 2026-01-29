"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  MapPin,
  Share2,
  Printer,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { useSessionState } from "@/app/hooks/useSessionState";
import { GlassCard } from "@/app/components/ui/GlassCard";
import {
  PageTransition,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/app/components/animations/PageTransition";
import { LoadingScreen } from "@/app/components/animations/LoadingScreen";
import { generateSolution, GroqError } from "@/app/lib/groqClient";
import Link from "next/link";
import { AISolution } from "@/app/types";

export default function SolutionPage() {
  const router = useRouter();
  const { currentQuery, completeQuery, isHydrated } = useSessionState();
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Critical: Use refs to prevent infinite loops
  const hasFetched = useRef(false);
  const isRetrying = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!currentQuery) {
      router.push("/");
      return;
    }

    // Prevent any fetch if already done or if we have a solution
    if (hasFetched.current || solution) return;

    hasFetched.current = true;

    const fetchSolution = async () => {
      try {
        setLoading(true);
        setError(null);

        const sol = await generateSolution({
          text: currentQuery.text,
          category: currentQuery.category,
          images: currentQuery.images,
          location: currentQuery.location,
        });

        setSolution(sol);
        completeQuery(sol);
        setLoading(false);
      } catch (err) {
        if (
          err instanceof GroqError &&
          err.code === "rate_limit" &&
          err.retryAfter &&
          !isRetrying.current
        ) {
          isRetrying.current = true;
          const waitSeconds = Math.ceil(err.retryAfter / 1000);
          setCountdown(waitSeconds);
          setError(`Rate limit reached. Retrying in ${waitSeconds}s...`);

          setTimeout(() => {
            hasFetched.current = false; // Reset to allow retry
            isRetrying.current = false;
            // Trigger re-render to retry
            setCountdown(0);
          }, err.retryAfter);
        } else {
          setError(
            err instanceof GroqError
              ? err.message
              : "Failed to generate solution",
          );
          setLoading(false);
        }
      }
    };

    fetchSolution();
  }, [isHydrated, currentQuery, router, completeQuery, solution, countdown]);

  // Handle manual retry
  const handleRetry = () => {
    hasFetched.current = false;
    isRetrying.current = false;
    setError(null);
    setLoading(true);
    // Force re-run by toggling a dummy state or just calling fetch again
    // We'll use a key change approach or just rely on the effect not running again
    // So instead, let's just call fetch directly here
    if (currentQuery) {
      const retryFetch = async () => {
        try {
          const sol = await generateSolution({
            text: currentQuery.text,
            category: currentQuery.category,
            images: currentQuery.images,
            location: currentQuery.location,
          });
          setSolution(sol);
          completeQuery(sol);
          setLoading(false);
        } catch (err) {
          setError(
            err instanceof GroqError
              ? err.message
              : "Failed to generate solution",
          );
          setLoading(false);
        }
      };
      retryFetch();
    }
  };

  if (!isHydrated || loading) {
    return (
      <LoadingScreen
        message={
          countdown > 0
            ? `Retrying in ${countdown} seconds`
            : "Generating your solution"
        }
        subMessage={
          countdown > 0
            ? "Waiting for rate limit to reset..."
            : "Analyzing location, identifying authority, and preparing actionable steps..."
        }
      />
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <GlassCard intensity="strong" className="p-8 text-center max-w-lg">
            <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Unable to Generate Solution
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>

            <div className="space-y-3">
              {error.includes("API key") && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-sm text-amber-800 mb-4">
                  <p className="font-semibold mb-1">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        console.groq.com/keys
                      </a>
                    </li>
                    <li>Create a free API key</li>
                    <li>Create .env.local file</li>
                    <li>Add: NEXT_PUBLIC_GROQ_API_KEY=your_key</li>
                    <li>Restart server</li>
                  </ol>
                </div>
              )}

              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-xl bg-saffron-500 text-white font-semibold hover:bg-saffron-600 flex items-center justify-center space-x-2"
              >
                <RefreshCcw className="h-5 w-5" />
                <span>Try Again</span>
              </button>

              <Link href="/">
                <button className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50">
                  Go Back Home
                </button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </PageTransition>
    );
  }

  if (!solution) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-paper py-8 px-4 sm:px-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <Link href="/report">
                <motion.button
                  className="flex items-center space-x-2 text-slate-600 hover:text-saffron-600 transition-colors"
                  whileHover={{ x: -4 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Edit Report</span>
                </motion.button>
              </Link>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Solution Ready</span>
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-growth-500 to-growth-600 text-white p-6 sm:p-8 shadow-lg">
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Action Plan Generated!
                </h1>
                <p className="text-green-50 text-lg">{solution.summary}</p>
                <div className="flex items-center mt-4 space-x-4 text-sm text-green-100">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Est. Resolution: {solution.estimatedTimeline}</span>
                  </span>
                  <span>•</span>
                  <span>Confidence: {solution.confidence}</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <StaggerContainer className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-saffron-500" />
                  <span>Step-by-Step Action</span>
                </h2>

                {solution.steps.map((step) => (
                  <StaggerItem key={step.stepNumber}>
                    <GlassCard
                      intensity="medium"
                      className="p-5 relative overflow-hidden"
                    >
                      {step.isCritical && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          CRITICAL
                        </div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-saffron-100 text-saffron-600 flex items-center justify-center font-bold text-lg">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-800 text-lg">
                              {step.title}
                            </h3>
                            {step.estimatedTime && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {step.estimatedTime}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <FadeIn delay={0.4}>
                <GlassCard
                  intensity="light"
                  className="p-5 border-l-4 border-l-chakra-500"
                >
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-chakra-500" />
                    <span>Documents You'll Need</span>
                  </h3>
                  <ul className="space-y-2">
                    {solution.documentsNeeded.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-2 text-slate-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-chakra-500" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </FadeIn>
            </div>

            <div className="space-y-6">
              <FadeIn delay={0.3}>
                <GlassCard intensity="strong" className="p-5 space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-saffron-500" />
                    <span>Contact Authority</span>
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Department
                      </p>
                      <p className="font-semibold text-slate-800">
                        {solution.relevantAuthority?.department}
                      </p>
                    </div>

                    {solution.relevantAuthority?.contactNumber && (
                      <a
                        href={`tel:${solution.relevantAuthority.contactNumber}`}
                        className="flex items-center space-x-2 p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="font-bold">
                          {solution.relevantAuthority.contactNumber}
                        </span>
                      </a>
                    )}

                    {solution.relevantAuthority?.email && (
                      <a
                        href={`mailto:${solution.relevantAuthority.email}`}
                        className="flex items-center space-x-2 text-sm text-slate-600 hover:text-chakra-600"
                      >
                        <Mail className="h-4 w-4" />
                        <span>{solution.relevantAuthority.email}</span>
                      </a>
                    )}

                    {solution.relevantAuthority?.officeAddress && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">
                          Office Address
                        </p>
                        <p className="text-sm text-slate-700">
                          {solution.relevantAuthority.officeAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.4}>
                <GlassCard intensity="medium" className="p-5">
                  <h3 className="font-bold text-slate-800 mb-3">
                    Direct Links
                  </h3>
                  <div className="space-y-2">
                    {solution.directLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors group"
                      >
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-saffron-500" />
                          <span className="font-medium text-slate-700 text-sm">
                            {link.title}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.5}>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      This solution is temporary. Screenshot or save important
                      details before closing this tab.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          <FadeIn delay={0.6}>
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 z-40">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="hidden sm:block text-sm text-slate-600">
                  <span className="font-semibold">Next step:</span> Contact the
                  authority using the details provided
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <motion.button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Print</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </motion.button>

                  <motion.button
                    onClick={() => router.push("/")}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-2 rounded-xl bg-saffron-500 text-white font-bold hover:bg-saffron-600 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Report Another</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </motion.button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
