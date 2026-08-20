import { getStoredUser } from "./auth-session";
import { fetchJson } from "./api";

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Client-side utility using HTML5 Canvas to resize an image and compress it to WebP format.
 * 
 * @param file The input File object from a file input element.
 * @param options Compression configuration parameters.
 * @returns A Promise resolving to a compressed Blob in WebP format.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    // Check if the browser supports Canvas and FileReader
    if (!window.CanvasRenderingContext2D) {
      reject(new Error("Canvas API not supported in this browser."));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio and resize if dimensions exceed limits
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not acquire 2D canvas context."));
          return;
        }

        // Draw the image onto the resized canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas drawing to a WebP blob with designated quality
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas WebP blob conversion failed."));
            }
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image resource for compression."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };
  });
}

interface UploadResponse {
  url: string;
  path: string;
}

/**
 * Detects whether a file is an Apple HEIC/HEIF image. Browsers (and the HTML5
 * Canvas used for compression) cannot decode HEIC natively, so it must be
 * converted to a standard format before upload.
 */
function isHeicFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

/**
 * Converts an HEIC/HEIF image to JPEG in the browser using `heic2any`, keeping
 * the CPU/bandwidth cost off the server (frontend conversion approach).
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  const mod = await import("heic2any");
  const heic2any = ((mod as { default?: unknown }).default ?? mod) as (
    opts: Record<string, unknown>
  ) => Promise<Blob | Blob[]>;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob: Blob = Array.isArray(converted) ? converted[0] : converted;
  const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], newName || "image.jpg", { type: "image/jpeg" });
}

/**
 * Compresses an image file to WebP and uploads it directly to a Supabase Storage bucket.
 *
 * @param file The raw input file from the user's browser.
 * @param bucketName The Supabase Storage bucket to upload to (defaults to "media").
 * @param timeoutMs Optional upload timeout limit (defaults to 15 seconds).
 * @returns Object containing the public URL and path of the uploaded file.
 */
export async function compressAndUploadImage(
  file: File,
  bucketName = "media",
  timeoutMs = 15000
): Promise<UploadResponse> {
  // 0. Normalise unsupported formats (HEIC/HEIF) to JPEG before canvas compression
  let workingFile = file;
  if (isHeicFile(file)) {
    try {
      workingFile = await convertHeicToJpeg(file);
    } catch (error) {
      throw new Error(
        `HEIC conversion failed: ${
          error instanceof Error ? error.message : "Unsupported image format"
        }`
      );
    }
  }

  // 1. Client-side compression
  let compressedBlob: Blob;
  try {
    compressedBlob = await compressImageToWebp(workingFile, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
    });
  } catch (error) {
    throw new Error(`Compression failed: ${error instanceof Error ? error.message : "Unknown compression error"}`);
  }

  // 2. Generate a unique, clean path for the image
  const fileExtension = "webp";
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const cleanFileName = workingFile.name
    .replace(/\.[^/.]+$/, "") // Remove original extension
    .replace(/[^a-zA-Z0-9]/g, "_") // Replace special chars with underscores
    .toLowerCase();
  const filePath = `uploads/${cleanFileName}-${uniqueId}.${fileExtension}`;

  // 3. Upload through the backend so storage writes use server-side credentials
  const currentUser = getStoredUser();
  const uploadFile = new File([compressedBlob], `${cleanFileName}-${uniqueId}.webp`, {
    type: "image/webp",
  });

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("bucketName", bucketName);

  const headers: Record<string, string> = {};

  if (currentUser?.id) {
    headers["x-user-id"] = currentUser.id;
  }

  const uploadPromise = fetchJson("/media/upload", {
    method: "POST",
    headers,
    body: formData,
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out. please try again.")), timeoutMs)
  );

  try {
    const data = await Promise.race([uploadPromise, timeoutPromise]);
    
    if (data && data.url) {
      return data;
    }
    
    throw new Error("Invalid upload response format");
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.message || "Upload failed");
  }
}
