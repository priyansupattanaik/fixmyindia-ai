"use client";

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { useEffect } from "react";
import { ErrorBoundary } from "@/app/components/error/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>FixMyIndiaAI | Instant Civic Solutions</title>
        <meta
          name="description"
          content="Report civic issues and get AI-powered solutions. No login, no data storage, completely private."
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F97316" />
      </head>
      <body className="font-sans antialiased text-ink bg-paper overflow-x-hidden">
        <ErrorBoundary>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-saffron-200/20 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-chakra-200/20 blur-3xl" />
            <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-growth-100/20 blur-3xl" />
          </div>

          <main className="relative z-10 min-h-screen flex flex-col">
            {children}
          </main>

          <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
            <div className="mx-auto max-w-md bg-white/90 backdrop-blur-md border border-white/50 rounded-full px-4 py-2 shadow-lg flex items-center justify-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs text-slate-600">Privacy First:</span>
              <span className="text-xs font-medium text-slate-800">
                No data saved • Disappears on close
              </span>
            </div>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
