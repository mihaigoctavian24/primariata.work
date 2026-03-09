"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FolderOpen,
  Star,
  Download,
  Trash2,
  ChevronRight,
  Upload,
} from "lucide-react";
import type { StorageFile } from "@/components/admin/documente/types";
import { useStarredDocumentsStore } from "@/store/starred-documents-store";

// ============================================================================
// Types
// ============================================================================

interface DocumentGridProps {
  files: StorageFile[];
  folders: StorageFile[];
  view: "grid" | "list";
  currentFolder: string | null;
  primarieId: string;
  onFolderClick: (name: string) => void;
  onDelete: (file: StorageFile) => void;
  onPreview: (file: StorageFile) => void;
  // Folder file counts
  folderFileCounts?: Record<string, number>;
  // New props for wave 13
  selectedFileIds?: Set<string>;
  onToggleSelectFile?: (id: string) => void;
  renamingId?: string | null;
  renameValue?: string;
  onRenameStart?: (id: string, name: string) => void;
  onRenameChange?: (val: string) => void;
  onRenameSubmit?: (file: StorageFile) => void;
  onRenameCancel?: () => void;
}

type FileType = "pdf" | "doc" | "xls" | "img" | "folder";

interface IconConfig {
  icon: typeof File;
  colorClass: string;
  bgClass: string;
}

// ============================================================================
// Helpers
// ============================================================================

function getFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext ?? "")) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext ?? "")) return "xls";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) return "img";
  return "doc"; // default
}

const iconMap: Record<FileType, IconConfig> = {
  pdf: { icon: FileText, colorClass: "text-red-400", bgClass: "bg-red-500/[0.12]" },
  doc: { icon: File, colorClass: "text-blue-400", bgClass: "bg-blue-500/[0.12]" },
  xls: { icon: FileSpreadsheet, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/[0.12]" },
  img: { icon: FileImage, colorClass: "text-amber-400", bgClass: "bg-amber-500/[0.12]" },
  folder: { icon: FolderOpen, colorClass: "text-violet-400", bgClass: "bg-violet-500/[0.12]" },
};

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

// ============================================================================
// Subcomponents
// ============================================================================

function SectionLabel({ label }: { label: string }): React.JSX.Element {
  return (
    <p
      className="mb-2 text-gray-600"
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </p>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * DocumentGrid — renders folder cards and file cards in grid or list view.
 *
 * - Folder section only shown when at root level (no currentFolder)
 * - File type icons use Tailwind CSS token classes (not inline hex)
 * - Star/download/delete actions appear on card hover
 * - AnimatePresence with mode="popLayout" for smooth card transitions
 */
export function DocumentGrid({
  files,
  folders,
  view,
  currentFolder,
  primarieId,
  onFolderClick,
  onDelete,
  onPreview,
  folderFileCounts = {},
  selectedFileIds = new Set(),
  onToggleSelectFile,
  renamingId,
  renameValue,
  onRenameStart,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
}: DocumentGridProps): React.JSX.Element {
  const { toggleStar, isStarred } = useStarredDocumentsStore();

  const hasFolders = !currentFolder && folders.length > 0;
  const hasFiles = files.length > 0;

  if (!hasFolders && !hasFiles) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.06] py-20 text-gray-700">
        <Upload className="mb-3 h-10 w-10 opacity-30" />
        <p style={{ fontSize: "0.9rem" }}>Trage fișiere aici sau caută</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Folders section */}
      {hasFolders && (
        <div>
          <SectionLabel label="Foldere" />
          <div
            className={`grid gap-2 ${
              view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            <AnimatePresence mode="popLayout">
              {folders.map((folder) => {
                const cfg = iconMap.folder;
                const Icon = cfg.icon;

                return (
                  <motion.div
                    key={folder.id ?? folder.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onFolderClick(folder.name)}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: "rgba(139,92,246,0.04)",
                      border: "1px solid rgba(139,92,246,0.1)",
                    }}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bgClass}`}
                    >
                      <Icon className={`h-5 w-5 ${cfg.colorClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-white" style={{ fontSize: "0.88rem" }}>
                        {folder.name}
                      </p>
                      <p className="text-gray-600" style={{ fontSize: "0.72rem" }}>
                        {folderFileCounts[folder.name] !== undefined
                          ? `${folderFileCounts[folder.name]} fișiere`
                          : "Folder"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-700 transition-colors group-hover:text-gray-400" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Files section */}
      {hasFiles && (
        <div>
          <SectionLabel label="Fișiere" />

          {view === "grid" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {files.map((file) => {
                  const fileType = getFileType(file.name);
                  const cfg = iconMap[fileType];
                  const Icon = cfg.icon;
                  const storagePath = `${primarieId}/${currentFolder ? currentFolder + "/" : ""}${file.name}`;
                  const starred = isStarred(storagePath);

                  return (
                    <motion.div
                      key={file.id ?? file.name}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      whileHover={{ y: -3 }}
                      onClick={() => onPreview(file)}
                      className="group relative flex cursor-pointer flex-col rounded-2xl p-4 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* Top row: icon + action buttons */}
                      <div className="mb-3 flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bgClass}`}
                        >
                          <Icon className={`h-5 w-5 ${cfg.colorClass}`} />
                        </div>

                        {/* Multi-select checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedFileIds.has(file.id ?? file.name)}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelectFile?.(file.id ?? file.name);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 left-2 cursor-pointer accent-[var(--color-info)] opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ zIndex: 10 }}
                        />

                        {/* Action buttons — visible on hover */}
                        <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(storagePath);
                            }}
                            className="cursor-pointer rounded p-1 transition-all hover:bg-white/10"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${starred ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview(file);
                            }}
                            className="cursor-pointer rounded p-1 text-gray-600 transition-all hover:bg-white/10 hover:text-white"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(file);
                            }}
                            className="cursor-pointer rounded p-1 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Persistent star indicator */}
                      {starred && (
                        <Star className="absolute top-2.5 right-2.5 h-3 w-3 fill-amber-400 text-amber-400 group-hover:hidden" />
                      )}

                      {/* Filename / Rename input */}
                      {renamingId === (file.id ?? file.name) ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => onRenameChange?.(e.target.value)}
                          onBlur={() => onRenameSubmit?.(file)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") onRenameCancel?.();
                            if (e.key === "Enter") onRenameSubmit?.(file);
                          }}
                          className="text-foreground mb-1 w-full border-b border-[var(--color-info)] bg-transparent text-[0.8rem] outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            onRenameStart?.(file.id ?? file.name, file.name);
                          }}
                          className="mb-1 cursor-text truncate text-white"
                          style={{ fontSize: "0.8rem" }}
                          title="Dublu-click pentru a edita"
                        >
                          {file.name}
                        </p>
                      )}

                      {/* Meta: size + date */}
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
          ) : (
            /* List view */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {files.map((file) => {
                  const fileType = getFileType(file.name);
                  const cfg = iconMap[fileType];
                  const Icon = cfg.icon;
                  const storagePath = `${primarieId}/${currentFolder ? currentFolder + "/" : ""}${file.name}`;
                  const starred = isStarred(storagePath);

                  return (
                    <motion.div
                      key={file.id ?? file.name}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      onClick={() => onPreview(file)}
                      className="group flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/[0.02]"
                    >
                      {/* Icon & Multi-select */}
                      <div className="relative">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgClass}`}
                        >
                          <Icon className={`h-4 w-4 ${cfg.colorClass}`} />
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedFileIds.has(file.id ?? file.name)}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelectFile?.(file.id ?? file.name);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute -top-1 -left-1 cursor-pointer accent-[var(--color-info)] opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </div>

                      {/* Name / Rename input */}
                      <div className="relative min-w-0 flex-1">
                        {renamingId === (file.id ?? file.name) ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => onRenameChange?.(e.target.value)}
                            onBlur={() => onRenameSubmit?.(file)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") onRenameCancel?.();
                              if (e.key === "Enter") onRenameSubmit?.(file);
                            }}
                            className="text-foreground w-full border-b border-[var(--color-info)] bg-transparent text-[0.85rem] outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              onRenameStart?.(file.id ?? file.name, file.name);
                            }}
                            className="cursor-text truncate text-white"
                            style={{ fontSize: "0.85rem" }}
                            title="Dublu-click pentru a edita"
                          >
                            {file.name}
                          </p>
                        )}
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
                          toggleStar(storagePath);
                        }}
                        className="shrink-0 cursor-pointer rounded-lg p-1.5 transition-all"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            starred
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-600 group-hover:text-gray-400"
                          }`}
                        />
                      </button>

                      {/* Download + Delete — appear on hover */}
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreview(file);
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-white/[0.06] hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(file);
                          }}
                          className="cursor-pointer rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
