"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, File, FileImage, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StorageFile } from "@/components/admin/documente/types";

interface DocumentPreviewModalProps {
  file: StorageFile | null;
  primarieId: string;
  currentFolder: string | null;
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

function getPreviewIcon(mimetype: string | undefined): React.JSX.Element {
  if (!mimetype) return <File className="h-5 w-5 text-violet-400" />;
  if (mimetype.startsWith("image/")) return <FileImage className="h-5 w-5 text-amber-400" />;
  if (mimetype === "application/pdf") return <FileText className="h-5 w-5 text-red-400" />;
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel"))
    return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
  if (mimetype.includes("word") || mimetype.includes("document"))
    return <File className="h-5 w-5 text-blue-400" />;
  return <File className="h-5 w-5 text-violet-400" />;
}

/**
 * DocumentPreviewModal — modal with signed URL preview for Supabase Storage files.
 *
 * Generates a 1-hour signed URL on mount (when file is set).
 * Supports image inline preview, PDF iframe, and download for other types.
 *
 * Uses AnimatePresence for smooth enter/exit animations.
 */
export function DocumentPreviewModal({
  file,
  primarieId,
  currentFolder,
  onClose,
}: DocumentPreviewModalProps): React.JSX.Element {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setSignedUrl(null);
      return;
    }

    setLoading(true);
    setSignedUrl(null);

    const supabase = createClient();
    const path = `${primarieId}/${currentFolder ? currentFolder + "/" : ""}${file.name}`;

    supabase.storage
      .from("documents")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        setSignedUrl(data?.signedUrl ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [file, primarieId, currentFolder]);

  // ESC key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    if (file) {
      document.addEventListener("keydown", handler);
    }
    return () => document.removeEventListener("keydown", handler);
  }, [file, onClose]);

  const mimetype = file?.metadata?.mimetype ?? "";
  const isImage = mimetype.startsWith("image/");
  const isPdf = mimetype === "application/pdf";

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="border-border bg-card relative w-full max-w-2xl rounded-2xl border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer rounded-xl p-2 transition-all hover:bg-white/[0.08]"
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
                {getPreviewIcon(mimetype)}
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
              className="mb-5 flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {loading && (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-8 w-8 rounded-full border-2 border-t-transparent"
                    style={{
                      borderColor: "var(--accent-500, #8b5cf6)",
                      borderTopColor: "transparent",
                    }}
                  />
                  <p style={{ fontSize: "0.82rem" }}>Se generează previzualizarea...</p>
                </div>
              )}

              {!loading && signedUrl && isImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signedUrl}
                  alt={file.name}
                  className="max-h-96 max-w-full rounded-lg object-contain"
                />
              )}

              {!loading && signedUrl && isPdf && (
                <iframe src={signedUrl} title={file.name} className="h-[500px] w-full rounded-lg" />
              )}

              {!loading && signedUrl && !isImage && !isPdf && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <FileText className="h-12 w-12 text-gray-600" />
                  <p className="text-sm text-gray-500">
                    Previzualizare nedisponibilă pentru acest format.
                  </p>
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm text-white transition-all"
                    style={{ background: "var(--accent-500, #8b5cf6)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4" />
                    Deschide în tab nou
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

            {/* Footer: metadata + download */}
            <div className="flex items-center justify-between">
              <div className="text-gray-600" style={{ fontSize: "0.75rem" }}>
                <span>Modificat: {formatDate(file.updated_at)}</span>
                {file.metadata?.size && (
                  <span className="ml-3">Mărime: {formatBytes(file.metadata.size)}</span>
                )}
              </div>
              {signedUrl && (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.name}
                  onClick={(e) => e.stopPropagation()}
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
