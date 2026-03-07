"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  File,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  Star,
  FolderOpen,
  Eye,
} from "lucide-react";
import type { StorageFile } from "@/components/admin/documente/types";
import { useStarredDocumentsStore } from "@/store/starred-documents-store";

interface DocumentGridProps {
  files: StorageFile[];
  view: "grid" | "list";
  primarieId: string;
  folderPath: string;
  onFileClick: (file: StorageFile) => void;
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

function getFileIcon(mimetype: string | undefined): {
  Icon: typeof File;
  colorClass: string;
} {
  if (!mimetype) return { Icon: File, colorClass: "text-gray-500" };
  if (mimetype.startsWith("image/")) return { Icon: ImageIcon, colorClass: "text-amber-400" };
  if (mimetype === "application/pdf") return { Icon: FileText, colorClass: "text-red-400" };
  if (mimetype === "application/zip" || mimetype === "application/x-zip-compressed")
    return { Icon: Archive, colorClass: "text-orange-400" };
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel"))
    return { Icon: FileSpreadsheet, colorClass: "text-emerald-400" };
  if (mimetype.includes("word") || mimetype.includes("document"))
    return { Icon: FileText, colorClass: "text-blue-400" };
  return { Icon: File, colorClass: "text-gray-400" };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
};

/**
 * DocumentGrid — renders StorageFile items in grid or list view.
 *
 * Integrates with useStarredDocumentsStore for star/unstar persistence.
 */
export function DocumentGrid({
  files,
  view,
  primarieId,
  onFileClick,
}: DocumentGridProps): React.JSX.Element {
  const { toggleStar, isStarred } = useStarredDocumentsStore();

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <FolderOpen className="h-12 w-12 text-gray-700" />
        <p className="text-sm text-gray-600">Nicio document în acest folder</p>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      >
        <AnimatePresence mode="popLayout">
          {files.map((file) => {
            const path = `${primarieId}/admin/${file.name}`;
            const starred = isStarred(path);
            const { Icon, colorClass } = getFileIcon(file.metadata?.mimetype ?? undefined);

            return (
              <motion.div
                key={file.id ?? file.name}
                variants={itemVariants}
                layout
                exit="exit"
                whileHover={{ y: -3 }}
                onClick={() => onFileClick(file)}
                className="group relative flex cursor-pointer flex-col rounded-2xl p-4 transition-all"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Top row: icon + star */}
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(path);
                    }}
                    className="cursor-pointer rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${starred ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                    />
                  </button>
                  {starred && (
                    <Star className="absolute top-2.5 right-2.5 h-3 w-3 fill-amber-400 text-amber-400 group-hover:hidden" />
                  )}
                </div>

                {/* Filename */}
                <p className="mb-1 truncate text-white" style={{ fontSize: "0.8rem" }}>
                  {file.name}
                </p>

                {/* Meta */}
                <div
                  className="flex items-center justify-between text-gray-600"
                  style={{ fontSize: "0.7rem" }}
                >
                  <span>{formatBytes(file.metadata?.size ?? 0)}</span>
                  <span>{formatDate(file.updated_at)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <AnimatePresence mode="popLayout">
        {files.map((file) => {
          const path = `${primarieId}/admin/${file.name}`;
          const starred = isStarred(path);
          const { Icon, colorClass } = getFileIcon(file.metadata?.mimetype ?? undefined);

          return (
            <motion.div
              key={file.id ?? file.name}
              variants={itemVariants}
              layout
              exit="exit"
              onClick={() => onFileClick(file)}
              className="group flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/[0.02]"
            >
              {/* Icon */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>

              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-white" style={{ fontSize: "0.85rem" }}>
                  {file.name}
                </p>
              </div>

              {/* Size */}
              <span className="shrink-0 text-gray-600" style={{ fontSize: "0.75rem" }}>
                {formatBytes(file.metadata?.size ?? 0)}
              </span>

              {/* Date */}
              <span
                className="w-24 shrink-0 text-right text-gray-600"
                style={{ fontSize: "0.75rem" }}
              >
                {formatDate(file.updated_at)}
              </span>

              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(path);
                }}
                className="shrink-0 cursor-pointer rounded-lg p-1.5 transition-all"
              >
                <Star
                  className={`h-3.5 w-3.5 ${starred ? "fill-amber-400 text-amber-400" : "text-gray-600 group-hover:text-gray-400"}`}
                />
              </button>

              {/* Preview button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClick(file);
                }}
                className="shrink-0 cursor-pointer rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Eye className="h-3.5 w-3.5 text-gray-400 hover:text-white" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
