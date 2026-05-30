import { UploadedImage } from "@/app/types";

const MAX_IMAGE_SIZE = 800; // Resize to max 800px width/height
const COMPRESSION_QUALITY = 0.6; // 60% quality

export async function processImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    // 1. Basic Validation
    if (!file.type.startsWith("image/")) {
      reject(new Error("Invalid file type. Please upload an image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 2. Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }

        // 3. Draw to Canvas for resizing
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Browser does not support image processing."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 4. Compress to JPEG
        const base64 = canvas.toDataURL("image/jpeg", COMPRESSION_QUALITY);

        resolve({
          id: crypto.randomUUID(),
          base64: base64,
          fileType: "image/jpeg",
        });
      };

      img.onerror = () => reject(new Error("Failed to load image."));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
