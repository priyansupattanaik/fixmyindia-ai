"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GlassCard } from "@/app/components/ui/GlassCard";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FixMyIndiaAI Error:", error);
    console.error("Error Info:", errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearStorage = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.location.href = "/";
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <GlassCard intensity="strong" className="p-8 text-center space-y-6">
              <div className="inline-flex p-4 rounded-full bg-red-100 text-red-600 mb-2">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-slate-600">
                  We encountered an unexpected error. Since we don't store any
                  data, you can safely refresh without losing information (if
                  you're in the middle of a report).
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-left p-4 bg-slate-100 rounded-lg overflow-auto max-h-40 text-xs font-mono text-slate-700">
                  <p className="font-bold text-red-600">
                    {this.state.error.toString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-saffron-500 text-white font-semibold hover:bg-saffron-600 transition-colors"
                >
                  <RefreshCcw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={this.handleClearStorage}
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  <span>Clear & Start Over</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-slate-500 hover:text-saffron-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Homepage</span>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-3 my-4">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
      <div>
        <p className="font-semibold text-red-900">Failed to process request</p>
        <p className="text-sm text-red-700">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="text-sm px-4 py-2 rounded-lg bg-white text-red-700 font-medium hover:bg-red-100 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
