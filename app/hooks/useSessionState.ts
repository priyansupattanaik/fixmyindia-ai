"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionState, UserQuery, AISolution } from "@/app/types";

const SESSION_KEY = "fixmyindia_session_v1";
const WARNING_KEY = "fixmyindia_warning_shown";

export function useSessionState() {
  const [state, setState] = useState<SessionState>({
    currentQuery: null,
    currentSolution: null,
    queryHistory: [],
    isLocationLoading: false,
    error: null,
    lastSaved: null,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      }

      if (!sessionStorage.getItem(WARNING_KEY)) {
        sessionStorage.setItem(WARNING_KEY, "true");
      }
    } catch (e) {
      console.error("Session storage error:", e);
    }

    setIsHydrated(true);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.currentQuery && state.currentQuery.status === "draft") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          currentQuery: state.currentQuery,
          currentSolution: state.currentSolution,
          queryHistory: state.queryHistory,
          lastSaved: Date.now(),
        }),
      );
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }, [
    state.currentQuery,
    state.currentSolution,
    state.queryHistory,
    isHydrated,
  ]);

  const createQuery = useCallback((text: string) => {
    const newQuery: UserQuery = {
      id: crypto.randomUUID(),
      text,
      category: null,
      location: null,
      images: [],
      timestamp: Date.now(),
      status: "draft",
    };

    setState((prev) => ({
      ...prev,
      currentQuery: newQuery,
      error: null,
    }));

    return newQuery.id;
  }, []);

  const updateQuery = useCallback((updates: Partial<UserQuery>) => {
    setState((prev) => {
      if (!prev.currentQuery) return prev;

      const updated = { ...prev.currentQuery, ...updates };
      return {
        ...prev,
        currentQuery: updated,
      };
    });
  }, []);

  const addImageToQuery = useCallback((image: UploadedImage) => {
    setState((prev) => {
      if (!prev.currentQuery) return prev;

      const updatedImages = [...prev.currentQuery.images, image].slice(0, 5);
      return {
        ...prev,
        currentQuery: { ...prev.currentQuery, images: updatedImages },
      };
    });
  }, []);

  const removeImageFromQuery = useCallback((imageId: string) => {
    setState((prev) => {
      if (!prev.currentQuery) return prev;

      return {
        ...prev,
        currentQuery: {
          ...prev.currentQuery,
          images: prev.currentQuery.images.filter((img) => img.id !== imageId),
        },
      };
    });
  }, []);

  const completeQuery = useCallback((solution: AISolution) => {
    setState((prev) => {
      if (!prev.currentQuery) return prev;

      const finalQuery = { ...prev.currentQuery, status: "completed" as const };

      return {
        ...prev,
        currentQuery: finalQuery,
        currentSolution: solution,
        queryHistory: [...prev.queryHistory, finalQuery].slice(-10),
      };
    });
  }, []);

  const clearSession = useCallback(() => {
    setState({
      currentQuery: null,
      currentSolution: null,
      queryHistory: [],
      isLocationLoading: false,
      error: null,
      lastSaved: null,
    });

    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(WARNING_KEY);
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setLocationLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLocationLoading: loading }));
  }, []);

  return {
    ...state,
    isHydrated,
    createQuery,
    updateQuery,
    addImageToQuery,
    removeImageFromQuery,
    completeQuery,
    clearSession,
    setError,
    setLocationLoading,
    hasDraft: !!state.currentQuery && state.currentQuery.status === "draft",
  };
}
