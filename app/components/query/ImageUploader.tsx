"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, AlertCircle, Check } from "lucide-react";
import { processImage, validateImage } from "@/app/lib/imageUtils";
import { UploadedImage } from "@/app/types";

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [images],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const newImages: UploadedImage[] = [];

      for (const file of files) {
        const validationError = validateImage(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        const processed = await processImage(file);
        newImages.push(processed);
      }

      onImagesChange([...images, ...newImages]);
    } catch (err) {
      setError("Failed to process image. Please try again.");
    } finally {
      setProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${
            isDragging
              ? "border-saffron-500 bg-saffron-50/50 scale-[1.02]"
              : "border-slate-300 bg-white/40 hover:border-saffron-400 hover:bg-white/60"
          }
          ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        whileHover={images.length < maxImages ? { scale: 1.01 } : {}}
        whileTap={images.length < maxImages ? { scale: 0.99 } : {}}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages || processing}
        />

        <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
          <motion.div
            className={`
              p-4 rounded-full 
              ${isDragging ? "bg-saffron-100 text-saffron-600" : "bg-slate-100 text-slate-600"}
            `}
            animate={isDragging ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {processing ? (
              <motion.div
                className="h-8 w-8 border-3 border-saffron-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Upload className="h-8 w-8" />
            )}
          </motion.div>

          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-800">
              {processing
                ? "Processing..."
                : "Drop images here or click to upload"}
            </p>
            <p className="text-sm text-slate-500">
              Support JPG, PNG, WEBP • Max {maxSizeMB}MB • Max {maxImages}{" "}
              images
            </p>
          </div>

          {images.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-growth-600 font-medium">
              <Check className="h-4 w-4" />
              <span>
                {images.length} of {maxImages} uploaded
              </span>
            </div>
          )}
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-saffron-200/20 to-chakra-200/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? 1 : 0 }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            layout
          >
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="relative aspect-square rounded-xl overflow-hidden shadow-md group"
              >
                <img
                  src={image.base64}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

                <motion.button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>

                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium">
                  {index + 1}
                </div>
              </motion.div>
            ))}

            {images.length < maxImages && (
              <motion.button
                layout
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-saffron-500 hover:border-saffron-400 hover:bg-saffron-50/30 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ImageIcon className="h-6 w-6" />
                <span className="text-xs font-medium">Add More</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
