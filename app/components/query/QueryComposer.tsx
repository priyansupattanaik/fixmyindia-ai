"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Mic, Image as ImageIcon, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/app/components/ui/GlassCard";
import { ImageUploader } from "./ImageUploader";
import { LocationPicker } from "@/app/components/maps/LocationPicker";
import { UploadedImage, GeoLocation, QueryCategory } from "@/app/types";

// Dynamic placeholders that cycle
const DYNAMIC_PLACEHOLDERS = [
  "Streetlight not working in Sector 4...",
  "Garbage pile up near the main market...",
  "Water supply contaminated in my area...",
  "Pothole causing traffic on MG Road...",
  "Denied ration card at the local office...",
  "Electricity meter reading is incorrect...",
];

interface QueryComposerProps {
  onAnalyze: (data: {
    text: string;
    category: QueryCategory | null;
    images: UploadedImage[];
    location: GeoLocation | null;
  }) => void;
  isAnalyzing: boolean;
}

export function QueryComposer({ onAnalyze, isAnalyzing }: QueryComposerProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [showLocation, setShowLocation] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");

  // Typewriter effect logic
  useEffect(() => {
    const targetText = DYNAMIC_PLACEHOLDERS[placeholderIndex];
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex <= targetText.length) {
        setDisplayedPlaceholder(targetText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setPlaceholderIndex(
            (prev) => (prev + 1) % DYNAMIC_PLACEHOLDERS.length,
          );
        }, 2000); // Wait 2 seconds before next phrase
      }
    }, 50); // Typing speed

    return () => clearInterval(typingInterval);
  }, [placeholderIndex]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    // We pass 'null' for category so the AI infers it automatically
    onAnalyze({ text, category: null, images, location });
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <GlassCard
        intensity="strong"
        className="p-2 sm:p-4 rounded-3xl border-white/40 shadow-xl"
      >
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={displayedPlaceholder}
            className="w-full min-h-[120px] p-4 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder:text-slate-400 resize-none rounded-xl"
            disabled={isAnalyzing}
          />

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowLocation(!showLocation)}
                className={`p-2 rounded-full transition-colors ${
                  location
                    ? "bg-green-100 text-green-600"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
                title="Add Location"
              >
                <MapPin className="h-5 w-5" />
              </motion.button>

              <div className="h-6 w-[1px] bg-slate-200 mx-1" />

              <ImageUploader images={images} onImagesChange={setImages} />
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={!text.trim() || isAnalyzing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                !text.trim() || isAnalyzing
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-saffron-500/30"
              }`}
            >
              <span>{isAnalyzing ? "Analyzing..." : "Fix It"}</span>
              {!isAnalyzing && <Send className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>

        {/* Expandable Location Panel */}
        <AnimatePresence>
          {showLocation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-600">
                    Pin Location
                  </h3>
                  <button onClick={() => setShowLocation(false)}>
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                <LocationPicker
                  onLocationSelect={(loc) => setLocation(loc)}
                  initialLocation={location}
                  compact={true} // Use compact mode inside the composer
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
