"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Search,
  X,
  LocateFixed,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { GeoLocation } from "@/app/types";
import { GlassCard } from "@/app/components/ui/GlassCard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Dynamic imports to prevent SSR crashes with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

// Fix for missing Leaflet marker icons in Next.js
const fixLeafletIcon = () => {
  try {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  } catch (e) {
    // Leaflet might not be loaded yet, ignore
  }
};

interface LocationPickerProps {
  onLocationSelect: (location: GeoLocation) => void;
  initialLocation?: GeoLocation | null;
  compact?: boolean;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  compact = false,
}: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(
    initialLocation || null,
  );

  // We store the map instance to control it programmatically (flyTo, etc.)
  const [map, setMap] = useState<L.Map | null>(null);

  // Initialize icon fix once
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Handle Map Clicks manually to avoid Hook complications
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newLoc = {
        latitude: lat,
        longitude: lng,
        accuracy: 10, // Approximate for manual pin
      };
      setSelectedLocation(newLoc);
      onLocationSelect(newLoc);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onLocationSelect]);

  const handleGetCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setSelectedLocation(loc);
        onLocationSelect(loc);

        // Fly to location
        if (map) {
          map.flyTo([loc.latitude, loc.longitude], 16);
        }

        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Please allow location access to continue"
            : "Unable to retrieve your location",
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Use OpenStreetMap Nominatim API (Free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&countrycodes=in&limit=1`,
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        const newLoc = {
          latitude: lat,
          longitude: lng,
          accuracy: 100,
          address: result.display_name,
        };

        setSelectedLocation(newLoc);
        onLocationSelect(newLoc);

        if (map) {
          map.flyTo([lat, lng], 14);
        }
      } else {
        setError("Location not found. Try a different search term.");
      }
    } catch (err) {
      setError("Failed to search location. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  if (compact && selectedLocation) {
    return (
      <GlassCard intensity="light" className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-saffron-100 text-saffron-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800">Location Selected</p>
            <p className="text-sm text-slate-600 truncate">
              {selectedLocation.address ||
                `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
            </p>
            {selectedLocation.accuracy > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Accuracy: ±{Math.round(selectedLocation.accuracy)}m
              </p>
            )}
          </div>
          <button
            onClick={() => setSelectedLocation(null)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search city, area, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-transparent transition-all"
          />
        </form>

        <motion.button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="btn-primary flex items-center justify-center space-x-2 min-w-[140px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LocateFixed className="h-5 w-5" />
          )}
          <span>{loading ? "Locating..." : "Use Current"}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-2"
          >
            <Navigation className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-glass border border-white/50">
        <MapContainer
          center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={5}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
          // @ts-ignore - ref types in react-leaflet can be tricky
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedLocation && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
            />
          )}
        </MapContainer>

        <div className="absolute bottom-4 left-4 right-4 z-[400] pointer-events-none">
          <GlassCard
            intensity="strong"
            className="p-3 flex items-center justify-center space-x-2 pointer-events-auto"
          >
            <MapPin className="h-4 w-4 text-saffron-600" />
            <span className="text-sm text-slate-700">
              Tap anywhere on map to pin exact location
            </span>
          </GlassCard>
        </div>
      </div>

      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-growth-50 border border-growth-200 text-growth-800"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-growth-100">
              <MapPin className="h-5 w-5 text-growth-600" />
            </div>
            <div>
              <p className="font-semibold">Location Confirmed</p>
              <p className="text-sm opacity-90">
                {selectedLocation.address
                  ? selectedLocation.address.split(",")[0]
                  : `Lat: ${selectedLocation.latitude.toFixed(4)}, Lng: ${selectedLocation.longitude.toFixed(4)}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedLocation(null)}
            className="p-2 hover:bg-growth-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
