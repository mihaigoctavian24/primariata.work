"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Hook for managing chart interactions (hover, click, zoom)
 */

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface UseChartInteractionsOptions {
  onPointClick?: (point: ChartPoint) => void;
  onPointHover?: (point: ChartPoint | null) => void;
  onZoom?: (range: { start: number; end: number }) => void;
  onPan?: (offset: { x: number; y: number }) => void;
  enableTooltip?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
}

export function useChartInteractions(options: UseChartInteractionsOptions = {}) {
  const {
    onPointClick,
    onPointHover,
    onZoom,
    onPan,
    enableTooltip = true,
    enableZoom = false,
    enablePan = false,
  } = options;

  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
  const [zoomRange, setZoomRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Point hover handler
  const handlePointHover = useCallback(
    (point: ChartPoint | null, position?: { x: number; y: number }) => {
      if (!enableTooltip) return;

      setHoveredPoint(point);

      if (position) {
        setTooltipPosition(position);
      } else {
        setTooltipPosition(null);
      }

      if (onPointHover) {
        onPointHover(point);
      }
    },
    [onPointHover, enableTooltip]
  );

  // Point click handler
  const handlePointClick = useCallback(
    (point: ChartPoint) => {
      setSelectedPoint(point);

      if (onPointClick) {
        onPointClick(point);
      }
    },
    [onPointClick]
  );

  // Zoom handler
  const handleZoom = useCallback(
    (range: { start: number; end: number }) => {
      if (!enableZoom) return;

      setZoomRange(range);

      if (onZoom) {
        onZoom(range);
      }
    },
    [onZoom, enableZoom]
  );

  // Pan handler
  const handlePan = useCallback(
    (offset: { x: number; y: number }) => {
      if (!enablePan) return;

      setPanOffset(offset);

      if (onPan) {
        onPan(offset);
      }
    },
    [onPan, enablePan]
  );

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomRange(null);
  }, []);

  // Reset pan
  const resetPan = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedPoint(null);
    setHoveredPoint(null);
    setTooltipPosition(null);
  }, []);

  // Start drag
  const startDrag = useCallback(
    (position: { x: number; y: number }) => {
      if (!enablePan) return;
      setIsDragging(true);
      setDragStart(position);
    },
    [enablePan]
  );

  // Update drag
  const updateDrag = useCallback(
    (position: { x: number; y: number }) => {
      if (!isDragging || !dragStart || !enablePan) return;

      const offset = {
        x: position.x - dragStart.x,
        y: position.y - dragStart.y,
      };

      handlePan(offset);
    },
    [isDragging, dragStart, enablePan, handlePan]
  );

  // End drag
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Zoom in/out with mouse wheel
  const handleWheel = useCallback(
    (event: WheelEvent, currentRange?: { start: number; end: number }) => {
      if (!enableZoom) return;

      event.preventDefault();

      const delta = event.deltaY > 0 ? 0.1 : -0.1;
      const range = currentRange || zoomRange || { start: 0, end: 100 };
      const rangeSize = range.end - range.start;
      const newSize = Math.max(5, rangeSize + rangeSize * delta);
      const center = (range.start + range.end) / 2;

      const newRange = {
        start: Math.max(0, center - newSize / 2),
        end: Math.min(100, center + newSize / 2),
      };

      handleZoom(newRange);
    },
    [enableZoom, zoomRange, handleZoom]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to clear selection
      if (event.key === "Escape") {
        clearSelection();
      }

      // R to reset zoom
      if (event.key === "r" || event.key === "R") {
        resetZoom();
        resetPan();
      }

      // Arrow keys for pan
      if (enablePan) {
        const panAmount = 20;
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            handlePan({ x: panOffset.x + panAmount, y: panOffset.y });
            break;
          case "ArrowRight":
            event.preventDefault();
            handlePan({ x: panOffset.x - panAmount, y: panOffset.y });
            break;
          case "ArrowUp":
            event.preventDefault();
            handlePan({ x: panOffset.x, y: panOffset.y + panAmount });
            break;
          case "ArrowDown":
            event.preventDefault();
            handlePan({ x: panOffset.x, y: panOffset.y - panAmount });
            break;
        }
      }

      // + / - for zoom
      if (enableZoom && zoomRange) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          const range = zoomRange;
          const rangeSize = range.end - range.start;
          const center = (range.start + range.end) / 2;
          const newSize = Math.max(5, rangeSize * 0.9);
          handleZoom({
            start: Math.max(0, center - newSize / 2),
            end: Math.min(100, center + newSize / 2),
          });
        }
        if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          const range = zoomRange;
          const rangeSize = range.end - range.start;
          const center = (range.start + range.end) / 2;
          const newSize = Math.min(100, rangeSize * 1.1);
          handleZoom({
            start: Math.max(0, center - newSize / 2),
            end: Math.min(100, center + newSize / 2),
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enablePan,
    enableZoom,
    panOffset,
    zoomRange,
    clearSelection,
    resetZoom,
    resetPan,
    handlePan,
    handleZoom,
  ]);

  return {
    // State
    hoveredPoint,
    selectedPoint,
    zoomRange,
    panOffset,
    tooltipPosition,
    isDragging,

    // Handlers
    handlePointHover,
    handlePointClick,
    handleZoom,
    handlePan,
    handleWheel,

    // Drag handlers
    startDrag,
    updateDrag,
    endDrag,

    // Actions
    resetZoom,
    resetPan,
    clearSelection,

    // Config
    enableTooltip,
    enableZoom,
    enablePan,
  };
}
