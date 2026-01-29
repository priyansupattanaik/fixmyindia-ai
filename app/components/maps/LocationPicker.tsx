"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, LocateFixed } from "lucide-react";
import dynamic from "next/dynamic";
import { GeoLocation } from "@/app/types";
import { GlassCard } from "@/app/components/ui/GlassCard";

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
const useMapEvents = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMapEvents),
  { ssr: false },
);

import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  onLocationSelect: (location: GeoLocation) => void;
  initialLocation?: GeoLocation | null;
  compact?: boolean;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function LocationMarker({
  onSelect,
}: {
  onSelect: (loc: GeoLocation) => void;
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
        accuracy: 0,
      });
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onSelect({
            latitude: pos.lat,
            longitude: pos.lng,
            accuracy: 0,
          });
        },
      }}
    />
  );
}

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
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

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
        setMapCenter({ lat: loc.latitude, lng: loc.longitude });
        onLocationSelect(loc);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.toLowerCase().includes("delhi")) {
      const loc = { lat: 28.6139, lng: 77.209 };
      setMapCenter(loc);
      const geoLoc = {
        latitude: loc.lat,
        longitude: loc.lng,
        accuracy: 100,
        address: "New Delhi, Delhi, India",
      };
      setSelectedLocation(geoLoc);
      onLocationSelect(geoLoc);
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
            placeholder="Search location (e.g., 'Mumbai', 'Near Connaught Place')..."
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
            <motion.div
              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
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
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onSelect={(loc) => {
              setSelectedLocation(loc);
              onLocationSelect(loc);
            }}
          />
          {selectedLocation && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  const newLoc = {
                    latitude: pos.lat,
                    longitude: pos.lng,
                    accuracy: selectedLocation.accuracy,
                  };
                  setSelectedLocation(newLoc);
                  onLocationSelect(newLoc);
                },
              }}
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
              Click anywhere on the map to pin the exact location
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
                Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{" "}
                {selectedLocation.longitude.toFixed(6)}
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
