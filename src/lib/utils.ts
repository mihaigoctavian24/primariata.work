import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Romanian currency (RON)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
  }).format(amount);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  // Handle invalid inputs
  if (!bytes || isNaN(bytes) || bytes < 0) return "0 Bytes";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Prevent index out of bounds
  const sizeIndex = Math.min(i, sizes.length - 1);

  return Math.round((bytes / Math.pow(k, sizeIndex)) * 100) / 100 + " " + sizes[sizeIndex];
}
