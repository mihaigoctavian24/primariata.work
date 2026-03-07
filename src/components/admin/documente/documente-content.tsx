"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Grid2X2, List, Search, HardDrive, ChevronRight } from "lucide-react";
import type { StorageFile } from "@/components/admin/documente/types";
import { DocumentGrid } from "@/components/admin/documente/document-grid";
import { DocumentUploadZone } from "@/components/admin/documente/document-upload-zone";
import { DocumentPreviewModal } from "@/components/admin/documente/document-preview-modal";

const MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB estimate

interface DocumenteContentProps {
  files: StorageFile[];
  primarieId: string;
  totalBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * DocumenteContent — root Client Component for the Documente admin page.
 *
 * Manages: folder navigation state, view toggle, search, upload zone,
 * file grid, and preview modal.
 */
export function DocumenteContent({
  files: initialFiles,
  primarieId,
  totalBytes: initialTotalBytes,
}: DocumenteContentProps): React.JSX.Element {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [currentFolder, setCurrentFolder] = useState("");
  const [filesState, setFilesState] = useState<StorageFile[]>(initialFiles);
  const [totalBytes, setTotalBytes] = useState(initialTotalBytes);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleUploadComplete = (newFile: StorageFile): void => {
    setFilesState((prev) => [newFile, ...prev]);
    setTotalBytes((prev) => prev + (newFile.metadata?.size ?? 0));
  };

  const handleFileClick = (file: StorageFile): void => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleClosePreview = (): void => {
    setPreviewOpen(false);
    // Delay clearing file so exit animation plays
    setTimeout(() => setPreviewFile(null), 300);
  };

  // Filter by search
  const filteredFiles = search
    ? filesState.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : filesState;

  // Breadcrumb segments
  const breadcrumbSegments = currentFolder ? currentFolder.split("/").filter(Boolean) : [];

  const usagePercent = Math.min((totalBytes / MAX_BYTES) * 100, 100);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="flex items-center gap-2.5 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <FolderOpen className="h-6 w-6 text-[var(--accent-500,#8b5cf6)]" />
            Documente
          </h1>
          <p className="mt-1 text-gray-600" style={{ fontSize: "0.83rem" }}>
            {filteredFiles.length} fișiere · {formatBytes(totalBytes)} utilizat
          </p>
        </div>

        {/* View toggle + search */}
        <div className="flex items-center gap-2">
          {/* Grid/List toggle */}
          <div
            className="flex gap-1 rounded-lg p-0.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <button
              onClick={() => setView("grid")}
              className="cursor-pointer rounded-md p-2 transition-all"
              style={{
                background: view === "grid" ? "rgba(255,255,255,0.1)" : "transparent",
                color: view === "grid" ? "white" : "#6b7280",
              }}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className="cursor-pointer rounded-md p-2 transition-all"
              style={{
                background: view === "list" ? "rgba(255,255,255,0.1)" : "transparent",
                color: view === "list" ? "white" : "#6b7280",
              }}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Storage usage bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <HardDrive className="h-4 w-4 shrink-0 text-gray-500" />
        <div className="flex-1">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--accent-500, #8b5cf6)" }}
            />
          </div>
        </div>
        <span className="shrink-0 text-gray-500" style={{ fontSize: "0.75rem" }}>
          {formatBytes(totalBytes)} / 5 GB
        </span>
      </motion.div>

      {/* Search bar */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Search className="h-4 w-4 shrink-0 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută documente..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-600"
          style={{ fontSize: "0.85rem" }}
        />
      </div>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-1.5"
        style={{ fontSize: "0.82rem" }}
      >
        <button
          onClick={() => setCurrentFolder("")}
          className="transition-colors"
          style={{ color: currentFolder ? "#6b7280" : "white" }}
        >
          Toate documentele
        </button>
        {breadcrumbSegments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-gray-700" />
            <span style={{ color: i === breadcrumbSegments.length - 1 ? "white" : "#6b7280" }}>
              {seg}
            </span>
          </span>
        ))}
      </motion.div>

      {/* Upload zone */}
      <DocumentUploadZone
        primarieId={primarieId}
        folderPath={currentFolder ? `${currentFolder}/` : ""}
        onUploadComplete={handleUploadComplete}
      />

      {/* File grid/list */}
      <div>
        <p
          className="mb-3 text-gray-600"
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Fișiere
        </p>
        <DocumentGrid
          files={filteredFiles}
          view={view}
          primarieId={primarieId}
          folderPath={currentFolder}
          onFileClick={handleFileClick}
        />
      </div>

      {/* Preview modal */}
      <DocumentPreviewModal
        file={previewFile}
        primarieId={primarieId}
        open={previewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
}
