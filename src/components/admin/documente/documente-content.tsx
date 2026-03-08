"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Grid2X2,
  List,
  Search,
  HardDrive,
  ChevronRight,
  FolderPlus,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { StorageFile } from "@/components/admin/documente/types";
import { DocumentGrid } from "@/components/admin/documente/document-grid";
import { DocumentUploadZone } from "@/components/admin/documente/document-upload-zone";
import { DocumentPreviewModal } from "@/components/admin/documente/document-preview-modal";
import { FolderCreateModal } from "@/components/admin/documente/folder-create-modal";

// ============================================================================
// Constants
// ============================================================================

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB quota (Figma spec)

// ============================================================================
// Helpers
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * A StorageFile item from supabase.storage.list() is considered a "folder"
 * when its metadata is null (Supabase represents folders as virtual prefixes
 * with no metadata). Items that look like folders have id === null too.
 */
function isFolder(file: StorageFile): boolean {
  return file.metadata === null && !file.name.includes(".");
}

// ============================================================================
// Component
// ============================================================================

interface DocumenteContentProps {
  primarieId: string;
}

/**
 * DocumenteContent — Client Component coordinator for the Documente admin page.
 *
 * Manages: folder navigation state, view toggle, search, upload trigger,
 * file listing from Supabase Storage, file delete, and preview modal.
 *
 * All Storage operations use the client-side supabase client.
 * Storage bucket: "documents", path prefix: `${primarieId}/`.
 */
export function DocumenteContent({ primarieId }: DocumenteContentProps): React.JSX.Element {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [showFolderCreate, setShowFolderCreate] = useState(false);

  // Ref passed to DocumentUploadZone so "Încarcă" button can trigger it
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Storage fetch -------------------------------------------------------

  const fetchFiles = (): void => {
    setLoading(true);
    const supabase = createClient();
    const path = currentFolder ? `${primarieId}/${currentFolder}` : primarieId;

    supabase.storage
      .from("documents")
      .list(path, { limit: 100, sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => {
        setFiles((data ?? []) as unknown as StorageFile[]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primarieId, currentFolder]);

  // ---- Derived state -------------------------------------------------------

  const folders = files.filter(isFolder);
  const nonFolderFiles = files.filter((f) => !isFolder(f));

  const filteredFiles = search
    ? nonFolderFiles.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : nonFolderFiles;

  const filteredFolders = search
    ? folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : folders;

  const totalBytes = nonFolderFiles.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);
  const usagePercent = Math.min((totalBytes / MAX_BYTES) * 100, 100);

  // ---- Handlers ------------------------------------------------------------

  const handleDelete = (file: StorageFile): void => {
    const path = `${primarieId}/${currentFolder ? currentFolder + "/" : ""}${file.name}`;
    const supabase = createClient();

    supabase.storage
      .from("documents")
      .remove([path])
      .then(({ error }) => {
        if (error) {
          toast.error(`Eroare la ștergere: ${error.message}`);
        } else {
          setFiles((prev) => prev.filter((f) => f.name !== file.name));
          toast.success("Fișier șters");
        }
      })
      .catch(() => {
        toast.error("Eroare la ștergere");
      });
  };

  const handleFolderClick = (name: string): void => {
    setCurrentFolder(name);
    setSearch("");
  };

  const handleBreadcrumbRoot = (): void => {
    setCurrentFolder(null);
    setSearch("");
  };

  // ---- Render --------------------------------------------------------------

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
            <FolderOpen className="h-6 w-6 text-violet-400" />
            Documente
          </h1>
          <p className="mt-1 text-gray-600" style={{ fontSize: "0.83rem" }}>
            {filteredFiles.length} fișiere · {formatBytes(totalBytes)} utilizat
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowFolderCreate(true)}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-gray-300 transition-all hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: "0.82rem",
            }}
          >
            <FolderPlus className="h-4 w-4" />
            Folder Nou
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              boxShadow: "0 4px 15px rgba(139,92,246,0.25)",
              fontSize: "0.82rem",
            }}
          >
            <Upload className="h-4 w-4" />
            Încarcă
          </motion.button>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      {currentFolder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-gray-500"
          style={{ fontSize: "0.82rem" }}
        >
          <button
            onClick={handleBreadcrumbRoot}
            className="cursor-pointer transition-colors hover:text-white"
          >
            Documente
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{currentFolder}</span>
        </motion.div>
      )}

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
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
              }}
            />
          </div>
        </div>
        <span className="shrink-0 text-gray-500" style={{ fontSize: "0.75rem" }}>
          {formatBytes(totalBytes)} / 100 MB
        </span>
      </motion.div>

      {/* Toolbar: search + view toggle */}
      <div className="flex items-center gap-3">
        <div
          className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2"
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

        {/* Grid / List toggle */}
        <div
          className="flex gap-1 rounded-lg p-0.5"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <button
            onClick={() => setView("grid")}
            className={`cursor-pointer rounded-md p-2 transition-all ${
              view === "grid" ? "bg-white/10 text-white" : "text-gray-500"
            }`}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`cursor-pointer rounded-md p-2 transition-all ${
              view === "list" ? "bg-white/10 text-white" : "text-gray-500"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: "var(--accent-500, #8b5cf6)",
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}

      {/* Upload zone wrapping the file grid */}
      {!loading && (
        <DocumentUploadZone
          primarieId={primarieId}
          currentFolder={currentFolder}
          onUploadComplete={fetchFiles}
          fileInputRef={fileInputRef}
        >
          <DocumentGrid
            files={filteredFiles}
            folders={filteredFolders}
            view={view}
            currentFolder={currentFolder}
            primarieId={primarieId}
            onFolderClick={handleFolderClick}
            onDelete={handleDelete}
            onPreview={setPreviewFile}
          />
        </DocumentUploadZone>
      )}

      {/* Preview modal */}
      <DocumentPreviewModal
        file={previewFile}
        primarieId={primarieId}
        currentFolder={currentFolder}
        onClose={() => setPreviewFile(null)}
      />

      {/* Folder create modal */}
      <FolderCreateModal
        open={showFolderCreate}
        onClose={() => setShowFolderCreate(false)}
        primarieId={primarieId}
        onFolderCreated={(folderName) => {
          // Optimistically trigger a refetch to show the new folder
          fetchFiles();
          setShowFolderCreate(false);
        }}
      />
    </div>
  );
}
