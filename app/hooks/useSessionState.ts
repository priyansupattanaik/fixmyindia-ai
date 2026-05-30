"use client";

import { useState, useEffect } from "react";
import {
  AISolution,
  QueryCategory,
  UploadedImage,
  GeoLocation,
} from "@/app/types";

interface QueryData {
  text: string;
  category: QueryCategory | null;
  images: UploadedImage[];
  location: GeoLocation | null;
}

interface SessionState {
  currentQuery: QueryData | null;
  solution: AISolution | null;
  isHydrated: boolean;
  startQuery: (data: QueryData) => void;
  completeQuery: (solution: AISolution) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "fixmyindia_session";

export function useSessionState(): SessionState {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<QueryData | null>(null);
  const [solution, setSolution] = useState<AISolution | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentQuery) setCurrentQuery(parsed.currentQuery);
        if (parsed.solution) setSolution(parsed.solution);
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to session storage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentQuery, solution }),
      );
    } catch (e) {
      console.error("Failed to save session", e);
    }
  }, [currentQuery, solution, isHydrated]);

  const startQuery = (data: QueryData) => {
    setCurrentQuery(data);
    setSolution(null); // Clear previous solution if any
  };

  const completeQuery = (sol: AISolution) => {
    setSolution(sol);
  };

  const clearSession = () => {
    setCurrentQuery(null);
    setSolution(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return {
    currentQuery,
    solution,
    isHydrated,
    startQuery,
    completeQuery,
    clearSession,
  };
}
