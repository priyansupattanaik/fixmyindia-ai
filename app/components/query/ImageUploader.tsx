"use client";

import { useRef, useState } from "react";
import { Camera, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { UploadedImage } from "@/app/types";
import { processImage } from "@/app/lib/imageUtils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newImages: UploadedImage[] = [...images];

      try {
        // Process files sequentially to avoid freezing low-end devices
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          if (newImages.length >= 3) break; // Max 3 images limit

          try {
            const processed = await processImage(file);
            newImages.push(processed);
          } catch (err) {
            console.error("Skipping invalid image:", file.name);
            // Optional: Add a toast notification here for failure
          }
        }
        onImagesChange(newImages);
      } finally {
        setIsProcessing(false);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center space-x-2">
          <ImageIcon className="h-4 w-4 text-saffron-500" />
          <span>Evidence Photos</span>
        </label>
        <span className="text-xs text-slate-500">
          {images.length}/3 uploaded
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
            >
              <img
                src={img.base64}
                alt="Evidence"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {images.length < 3 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-saffron-500 hover:text-saffron-500 transition-colors bg-slate-50/50"
            aria-label="Upload photo"
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
