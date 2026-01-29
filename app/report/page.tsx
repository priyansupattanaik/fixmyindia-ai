"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  MapPin,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useSessionState } from "@/app/hooks/useSessionState";
import { GlassCard } from "@/app/components/ui/GlassCard";
import {
  PageTransition,
  FadeIn,
} from "@/app/components/animations/PageTransition";
import { QueryComposer } from "@/app/components/query/QueryComposer";
import { CategorySelector } from "@/app/components/query/CategorySelector";
import { ImageUploader } from "@/app/components/query/ImageUploader";
import { LocationPicker } from "@/app/components/maps/LocationPicker";
import { LoadingScreen } from "@/app/components/animations/LoadingScreen";
import Link from "next/link";

export default function ReportPage() {
  const router = useRouter();
  const {
    currentQuery,
    isHydrated,
    updateQuery,
    addImageToQuery,
    removeImageFromQuery,
    setError,
  } = useSessionState();

  useEffect(() => {
    if (isHydrated && !currentQuery) {
      router.push("/");
    }
  }, [isHydrated, currentQuery, router]);

  const handleSubmit = async () => {
    if (!currentQuery || !currentQuery.category) {
      setError("Please select a category");
      return;
    }

    updateQuery({ status: "submitting" });
    setTimeout(() => {
      router.push("/solution");
    }, 1500);
  };

  if (!isHydrated || !currentQuery) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-paper py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <FadeIn>
            <div className="flex items-center justify-between">
              <Link href="/">
                <motion.button
                  className="flex items-center space-x-2 text-slate-600 hover:text-saffron-600 transition-colors"
                  whileHover={{ x: -4 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Home</span>
                </motion.button>
              </Link>

              <div className="text-sm text-slate-500">
                Draft saved • Session only
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex items-center justify-center space-x-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-saffron-500 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="text-sm font-medium text-saffron-700">
                  Describe
                </span>
              </div>
              <div className="w-12 h-0.5 bg-saffron-200" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Details
                </span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Solution
                </span>
              </div>
            </div>
          </FadeIn>

          <GlassCard intensity="strong" className="p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Complete Your Report
              </h1>
              <p className="text-slate-600">
                Add details to get the most accurate solution
              </p>
            </div>

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <FileText className="h-5 w-5 text-saffron-500" />
                <h2>Issue Category</h2>
              </div>
              <CategorySelector
                selected={currentQuery.category}
                onSelect={(cat) => updateQuery({ category: cat })}
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <FileText className="h-5 w-5 text-saffron-500" />
                <h2>Detailed Description</h2>
              </div>
              <QueryComposer
                value={currentQuery.text}
                onChange={(text) => updateQuery({ text })}
                onSubmit={handleSubmit}
                selectedCategory={currentQuery.category}
                placeholder="Provide specific details: landmarks, duration of issue, danger level, previous attempts to fix..."
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <ImageIcon className="h-5 w-5 text-saffron-500" />
                <h2>Photos (Optional)</h2>
                <span className="text-xs font-normal text-slate-500">
                  — Helps verify the issue
                </span>
              </div>
              <ImageUploader
                images={currentQuery.images}
                onImagesChange={(images) => {
                  const currentIds = new Set(
                    currentQuery.images.map((i) => i.id),
                  );
                  const newIds = new Set(images.map((i) => i.id));

                  const added = images.find((i) => !currentIds.has(i.id));
                  if (added) addImageToQuery(added);

                  const removed = currentQuery.images.find(
                    (i) => !newIds.has(i.id),
                  );
                  if (removed) removeImageFromQuery(removed.id);
                }}
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <MapPin className="h-5 w-5 text-saffron-500" />
                <h2>Exact Location</h2>
                <span className="text-xs font-normal text-slate-500">
                  — Required for routing to correct department
                </span>
              </div>

              {currentQuery.location ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">
                          Location Confirmed
                        </p>
                        <p className="text-sm text-green-700">
                          {currentQuery.location.latitude.toFixed(4)},{" "}
                          {currentQuery.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateQuery({ location: null })}
                      className="text-sm text-green-700 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <LocationPicker
                  onLocationSelect={(loc) => updateQuery({ location: loc })}
                />
              )}
            </section>

            {!currentQuery.category && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center space-x-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Please select a category to continue</span>
              </motion.div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <motion.button
                onClick={handleSubmit}
                disabled={
                  !currentQuery.category || currentQuery.status === "submitting"
                }
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all
                  ${
                    currentQuery.category &&
                    currentQuery.status !== "submitting"
                      ? "bg-saffron-500 text-white shadow-saffron-glow hover:bg-saffron-600"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }
                `}
                whileHover={currentQuery.category ? { scale: 1.01 } : {}}
                whileTap={currentQuery.category ? { scale: 0.99 } : {}}
              >
                {currentQuery.status === "submitting" ? (
                  <>
                    <motion.div
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Get AI Solution</span>
                    <Send className="h-5 w-5" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-xs text-slate-500 mt-3">
                By submitting, you agree this report is anonymous and temporary
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
