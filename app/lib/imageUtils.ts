import { UploadedImage } from "@/app/types";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 0.8;

export async function processImage(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("Image must be smaller than 10MB"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", QUALITY);

        const base64Length = base64.length - (base64.indexOf(",") + 1);
        const size = (base64Length * 3) / 4;

        const uploadedImage: UploadedImage = {
          id: crypto.randomUUID(),
          base64,
          fileType: "image/jpeg",
          size,
          width,
          height,
          timestamp: Date.now(),
        };

        resolve(uploadedImage);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "File must be an image (JPEG, PNG, or WEBP)";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "Image must be smaller than 10MB";
  }

  return null;
}

export function revokeImageUrl(url: string | undefined) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
