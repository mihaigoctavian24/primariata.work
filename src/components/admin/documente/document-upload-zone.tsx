"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface DocumentUploadZoneProps {
  primarieId: string;
  currentFolder: string | null;
  onUploadComplete: () => void;
  children: React.ReactNode;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * DocumentUploadZone — transparent drag-and-drop wrapper.
 *
 * Surrounds its children with drag-over detection (ring-2 ring-violet-400/50
 * when active). Also renders a hidden <input type="file" multiple> for
 * click-to-upload. Exposes fileInputRef so parent can trigger it.
 *
 * Upload target: supabase.storage "documents" bucket at
 * `${primarieId}/${currentFolder ?? ""}/${filename}`.
 */
export function DocumentUploadZone({
  primarieId,
  currentFolder,
  onUploadComplete,
  children,
  fileInputRef: externalRef,
}: DocumentUploadZoneProps): React.JSX.Element {
  const [dragOver, setDragOver] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef ?? internalRef;

  const handleUpload = async (files: FileList): Promise<void> => {
    const supabase = createClient();
    const uploads = Array.from(files).map(async (file) => {
      const path = `${primarieId}/${currentFolder ? currentFolder + "/" : ""}${file.name}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: true });

      if (error) {
        toast.error(`Eroare: ${error.message}`);
      } else {
        toast.success(`Fișier încărcat: ${file.name}`);
      }
    });

    await Promise.all(uploads);
    onUploadComplete();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (): void => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      void handleUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void handleUpload(files);
    }
    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl transition-all ${dragOver ? "ring-2 ring-violet-400/50" : ""}`}
    >
      <input ref={inputRef} type="file" multiple hidden onChange={handleFileSelect} />
      {children}
    </div>
  );
}
