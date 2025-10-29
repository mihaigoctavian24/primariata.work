"use client";

import html2canvas from "html2canvas";

/**
 * Chart utility functions for export and formatting
 */

export interface ExportOptions {
  filename?: string;
  format?: "png" | "svg";
  quality?: number;
  backgroundColor?: string;
}

/**
 * Export chart as PNG using html2canvas
 */
export async function exportChartAsPNG(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = "chart", quality = 1, backgroundColor = "#ffffff" } = options;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false,
      // Ignore oklch color parsing errors
      onclone: (clonedDoc) => {
        // Convert oklch colors to hex for compatibility
        const allElements = clonedDoc.querySelectorAll("*");
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            const computedStyle = window.getComputedStyle(el);
            // Fix background color
            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes("oklch")) {
              el.style.backgroundColor = "transparent";
            }
            // Fix color
            if (computedStyle.color && computedStyle.color.includes("oklch")) {
              el.style.color = "inherit";
            }
          }
        });
      },
    });

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${filename}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      },
      "image/png",
      quality
    );
  } catch (error) {
    console.error("Failed to export chart as PNG:", error);
    throw error;
  }
}

/**
 * Export chart as SVG
 */
export function exportChartAsSVG(element: HTMLElement, options: ExportOptions = {}): void {
  const { filename = "chart" } = options;

  try {
    // Find the SVG element within the chart
    const svgElement = element.querySelector("svg");
    if (!svgElement) {
      throw new Error("No SVG element found in chart");
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    // Add XML namespace if not present
    if (!clonedSvg.getAttribute("xmlns")) {
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    // Serialize the SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);

    // Create blob and download
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export chart as SVG:", error);
    throw error;
  }
}

/**
 * Format number with thousands separator
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("ro-RO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Clean, modern chart colors - no gradients
 */
export const CHART_COLORS = {
  primary: [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
  ],
};

/**
 * Sort data by key
 */
export function sortData<T extends Record<string, string | number>>(
  data: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  startDate?: Date,
  endDate?: Date
): T[] {
  if (!startDate && !endDate) return data;

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  });
}

/**
 * Calculate comparison percentage
 */
export function calculateComparison(
  current: number,
  previous: number
): { value: number; trend: "up" | "down" | "neutral" } {
  if (previous === 0) {
    return { value: 0, trend: "neutral" };
  }

  const change = ((current - previous) / previous) * 100;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return { value: Math.abs(change), trend };
}
