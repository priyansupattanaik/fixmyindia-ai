"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Mic, X } from "lucide-react";
import { QueryCategory } from "@/app/types";

interface QueryComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  selectedCategory: QueryCategory | null;
  isLoading?: boolean;
  placeholder?: string;
}

export function QueryComposer({
  value,
  onChange,
  onSubmit,
  selectedCategory,
  isLoading = false,
  placeholder = "Describe your issue in detail... (e.g., 'Large pothole near HDFC bank on MG Road causing accidents')",
}: QueryComposerProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      onSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isFocused && value.length > 10 && !selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-0 right-0 flex items-center space-x-2 px-3 py-2 rounded-lg bg-chakra-50 border border-chakra-200 text-chakra-700 text-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Tip: Select a category above for faster processing</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`
        relative rounded-2xl transition-all duration-300
        ${isFocused ? "ring-2 ring-saffron-400 shadow-lg" : "ring-1 ring-slate-200"}
      `}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustTextareaHeight();
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full p-4 pr-24 pb-12 rounded-2xl bg-white/80 backdrop-blur-sm border-0 outline-none resize-none text-slate-800 placeholder:text-slate-400"
          disabled={isLoading}
        />

        <div className="absolute bottom-3 left-4 text-xs text-slate-400">
          {value.length} chars
          {value.length < 20 && value.length > 0 && (
            <span className="text-saffron-500 ml-2">Minimum 20 characters</span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-slate-400 hover:text-saffron-600 hover:bg-saffron-50 transition-colors"
            title="Voice input (coming soon)"
          >
            <Mic className="h-5 w-5" />
          </motion.button>

          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange("")}
              className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            disabled={!value.trim() || value.length < 20 || isLoading}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-sm transition-all
              ${
                value.trim() && value.length >= 20 && !isLoading
                  ? "bg-saffron-500 text-white shadow-saffron-glow hover:bg-saffron-600"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <motion.div
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <span>Submit</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500 px-1">
        <span>Be specific: mention landmarks, duration of issue, severity</span>
        <span className="hidden sm:inline">Cmd + Enter to submit</span>
      </div>
    </div>
  );
}
