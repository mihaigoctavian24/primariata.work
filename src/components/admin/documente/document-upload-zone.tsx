"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload, CloudUpload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { StorageFile } from "@/components/admin/documente/types";

type UploadStatus = "idle" | "uploading" | "done" | "error";

interface DocumentUploadZoneProps {
  primarieId: string;
  folderPath: string;
  onUploadComplete: (file: StorageFile) => void;
}

/**
 * DocumentUploadZone — HTML5 drag-and-drop upload component.
 *
 * Uploads files to the cereri-documente Supabase Storage bucket
 * under ${primarieId}/admin/${folderPath}${filename}.
 */
export function DocumentUploadZone({
  primarieId,
  folderPath,
  onUploadComplete,
}: DocumentUploadZoneProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File): Promise<void> => {
    setUploadStatus("uploading");
    const supabase = createClient();
    const storagePath = `${primarieId}/admin/${folderPath}${file.name}`;

    const { data, error } = await supabase.storage
      .from("cereri-documente")
      .upload(storagePath, file, { upsert: false });

    if (error) {
      setUploadStatus("error");
      toast.error(`Eroare la încărcare: ${error.message}`);
      setTimeout(() => setUploadStatus("idle"), 3000);
      return;
    }

    setUploadStatus("done");
    toast.success("Fișier încărcat cu succes");

    // Build a minimal StorageFile to notify parent
    const newFile: StorageFile = {
      name: file.name,
      id: (data as { id?: string } | null)?.id ?? null,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      metadata: {
        size: file.size,
        mimetype: file.type,
        eTag: "",
        cacheControl: "",
        lastModified: new Date().toISOString(),
        contentLength: file.size,
        httpStatusCode: 200,
      },
    };
    onUploadComplete(newFile);

    setTimeout(() => setUploadStatus("idle"), 2000);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const statusLabel: Record<UploadStatus, string> = {
    idle: "Trage fișierul aici sau click pentru a selecta",
    uploading: "Se încarcă...",
    done: "Fișier încărcat cu succes",
    error: "Eroare la încărcare — încearcă din nou",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl py-8 transition-all select-none"
      style={{
        background: isDragging
          ? "rgba(var(--accent-500-rgb, 139,92,246),0.05)"
          : "rgba(255,255,255,0.015)",
        border: isDragging
          ? "2px dashed var(--accent-500, #8b5cf6)"
          : "2px dashed rgba(255,255,255,0.08)",
      }}
    >
      <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />

      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {uploadStatus === "uploading" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <CloudUpload className="h-6 w-6 text-[var(--accent-500,#8b5cf6)]" />
          </motion.div>
        ) : (
          <Upload className="h-6 w-6 text-gray-500" />
        )}
      </div>

      <p className="px-4 text-center text-sm text-gray-500">{statusLabel[uploadStatus]}</p>
    </motion.div>
  );
}
