"use client";

import { motion } from "framer-motion";
import {
  Construction, // Changed from Road
  CreditCard,
  Zap,
  Droplets,
  Trash2,
  Shield,
  Building2,
  Bus,
  HeartPulse,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { QueryCategory } from "@/app/types";

interface CategorySelectorProps {
  selected: QueryCategory | null;
  onSelect: (category: QueryCategory) => void;
}

interface CategoryOption {
  id: QueryCategory;
  label: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

const categories: CategoryOption[] = [
  {
    id: "roads",
    label: "Roads",
    icon: Construction, // Changed from Road to Construction
    description: "Potholes, street lights, road damage",
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
  {
    id: "aadhaar",
    label: "Aadhaar",
    icon: CreditCard,
    description: "Update, enrollment, correction",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    id: "electricity",
    label: "Electricity",
    icon: Zap,
    description: "Power cuts, meter issues, new connection",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    id: "water",
    label: "Water",
    icon: Droplets,
    description: "Supply, quality, pipeline issues",
    color: "bg-cyan-100 text-cyan-600 border-cyan-200",
  },
  {
    id: "sanitation",
    label: "Sanitation",
    icon: Trash2,
    description: "Garbage collection, drainage, toilets",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    id: "police",
    label: "Police",
    icon: Shield,
    description: "Complaints, FIR, verification",
    color: "bg-red-100 text-red-600 border-red-200",
  },
  {
    id: "municipal",
    label: "Municipal",
    icon: Building2,
    description: "Property tax, permits, licenses",
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  {
    id: "transport",
    label: "Transport",
    icon: Bus,
    description: "RTO, licenses, vehicle issues",
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: HeartPulse,
    description: "Hospitals, clinics, health schemes",
    color: "bg-rose-100 text-rose-600 border-rose-200",
  },
  {
    id: "general",
    label: "Other",
    icon: HelpCircle,
    description: "Any other civic issue or query",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

export function CategorySelector({
  selected,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Select Category
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map((category) => {
          const isSelected = selected === category.id;
          const Icon = category.icon;

          return (
            <motion.button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${
                  isSelected
                    ? "border-saffron-500 bg-saffron-50/50 shadow-md"
                    : "border-transparent bg-white/60 hover:bg-white/80 hover:border-slate-200"
                }
              `}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              layout
            >
              <div
                className={`
                inline-flex p-2 rounded-lg mb-2
                ${isSelected ? "bg-saffron-100 text-saffron-600" : category.color}
              `}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p
                  className={`font-semibold text-sm ${isSelected ? "text-saffron-900" : "text-slate-800"}`}
                >
                  {category.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {category.description}
                </p>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="selectedCategory"
                  className="absolute inset-0 border-2 border-saffron-500 rounded-xl pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
