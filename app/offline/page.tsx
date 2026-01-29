"use client";

import { WifiOff, RefreshCcw } from "lucide-react";
import { GlassCard } from "@/app/components/ui/GlassCard";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <GlassCard intensity="strong" className="p-8 text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-slate-100 text-slate-600 mb-4">
          <WifiOff className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          You're Offline
        </h1>
        <p className="text-slate-600 mb-6">
          FixMyIndiaAI needs an internet connection to generate AI solutions.
          Your drafts are safe in this tab.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-saffron-500 text-white font-semibold hover:bg-saffron-600"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="block w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-center"
          >
            Go to Homepage
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
