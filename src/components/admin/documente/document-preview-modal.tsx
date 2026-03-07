"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, File } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StorageFile } from "@/components/admin/documente/types";

interface DocumentPreviewModalProps {
  file: StorageFile | null;
  primarieId: string;
  open: boolean;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * DocumentPreviewModal — modal with signed URL preview for Storage files.
 *
 * Generates a 1-hour signed URL on open. Supports image inline preview,
 * PDF iframe, and download link for all other types.
 */
export function DocumentPreviewModal({
  file,
  primarieId,
  open,
  onClose,
}: DocumentPreviewModalProps): React.JSX.Element {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSignedUrl = useCallback(async (): Promise<void> => {
    if (!file) return;
    setLoading(true);
    setSignedUrl(null);

    const supabase = createClient();
    const path = `${primarieId}/admin/${file.name}`;
    const { data, error } = await supabase.storage
      .from("cereri-documente")
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      console.error("Failed to generate signed URL:", error);
    } else {
      setSignedUrl(data.signedUrl);
    }
    setLoading(false);
  }, [file, primarieId]);

  useEffect(() => {
    if (open && file) {
      void generateSignedUrl();
    } else {
      setSignedUrl(null);
    }
  }, [open, file, generateSignedUrl]);

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handler);
    }
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const mimetype = file?.metadata?.mimetype ?? "";
  const isImage = mimetype.startsWith("image/");
  const isPdf = mimetype === "application/pdf";

  return (
    <AnimatePresence>
      {open && file && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="relative w-full max-w-3xl rounded-2xl p-6"
            style={{ background: "var(--surface-raised, #1a1a2e)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer rounded-xl p-2 transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>

            {/* File name header */}
            <div className="mb-5 flex items-center gap-3 pr-12">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {isPdf ? (
                  <FileText className="h-5 w-5 text-[var(--accent-500,#8b5cf6)]" />
                ) : (
                  <File className="h-5 w-5 text-[var(--accent-500,#8b5cf6)]" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white" style={{ fontSize: "0.95rem" }}>
                  {file.name}
                </h2>
                <p className="mt-0.5 text-gray-500" style={{ fontSize: "0.75rem" }}>
                  {formatBytes(file.metadata?.size ?? 0)} · {mimetype || "Tip necunoscut"} ·{" "}
                  {formatDate(file.updated_at)}
                </p>
              </div>
            </div>

            {/* Preview area */}
            <div
              className="mb-5 flex items-center justify-center overflow-hidden rounded-xl"
              style={{
                minHeight: 300,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {loading && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-[var(--accent-500,#8b5cf6)] border-t-transparent"
                  />
                  <p style={{ fontSize: "0.82rem" }}>Se generează previzualizarea...</p>
                </div>
              )}

              {!loading && signedUrl && isImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signedUrl}
                  alt={file.name}
                  className="max-h-[500px] max-w-full rounded-lg object-contain"
                />
              )}

              {!loading && signedUrl && isPdf && (
                <iframe
                  src={signedUrl}
                  title={file.name}
                  className="w-full rounded-lg"
                  style={{ height: 500 }}
                />
              )}

              {!loading && signedUrl && !isImage && !isPdf && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <FileText className="h-12 w-12 text-gray-600" />
                  <p className="text-sm text-gray-500">
                    Previzualizare indisponibilă pentru acest tip de fișier.
                  </p>
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm text-white transition-all"
                    style={{ background: "var(--accent-500, #8b5cf6)" }}
                  >
                    <Download className="h-4 w-4" />
                    Descarcă fișierul
                  </a>
                </div>
              )}

              {!loading && !signedUrl && (
                <div className="flex flex-col items-center gap-2 py-12">
                  <FileText className="h-10 w-10 text-gray-700" />
                  <p className="text-sm text-gray-600">Nu s-a putut genera previzualizarea</p>
                </div>
              )}
            </div>

            {/* Download action */}
            {signedUrl && (
              <div className="flex justify-end">
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.name}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Download className="h-4 w-4" />
                  Descarcă
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
