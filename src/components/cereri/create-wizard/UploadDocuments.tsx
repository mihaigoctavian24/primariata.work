"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Check, AlertCircle, FileWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { TipCerere, DocRequirement } from "@/types/api";
import { UploadedFile } from "@/types/wizard";
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface UploadDocumentsProps {
  tipCerere: TipCerere;
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
  cerereId?: string;
}

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadDocuments({
  tipCerere,
  uploadedFiles,
  onFilesChange,
  onNext,
  onBack,
  cerereId,
}: UploadDocumentsProps) {
  const [uploading, setUploading] = useState(false);

  // Parse documente_necesare as DocRequirement[] (JSONB from tipuri_cereri)
  // Runtime data may still be string[] from legacy format, so handle both
  const rawDocs = tipCerere.documente_necesare || [];
  const documenteNecesare: DocRequirement[] = rawDocs.map((doc: unknown) => {
    if (typeof doc === "string") {
      // Backward compatibility: handle legacy string[] format
      return { tip: doc.toLowerCase(), denumire: doc, obligatoriu: true };
    }
    return doc as DocRequirement;
  });

  const obligatorii = documenteNecesare.filter((d) => d.obligatoriu);
  const optionale = documenteNecesare.filter((d) => !d.obligatoriu);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check if cerereId exists before allowing upload
      if (!cerereId) {
        toast.error(
          "Salveaza mai intai cererea inainte de a incarca documente. Revino la pasul anterior si salveaza draft-ul."
        );
        return;
      }

      // Validate total size
      const currentTotalSize = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);
      const newTotalSize = currentTotalSize + acceptedFiles.reduce((acc, f) => acc + f.size, 0);

      if (newTotalSize > MAX_TOTAL_SIZE) {
        toast.error("Dimensiunea totala a fisierelor depaseste 50MB");
        return;
      }

      // Validate individual file sizes
      const oversizedFiles = acceptedFiles.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        toast.error(`${oversizedFiles.length} fisier(e) depasesc limita de 10MB per fisier`);
        return;
      }

      setUploading(true);

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0,
        uploaded: false,
      }));

      let allFiles = [...uploadedFiles, ...newFiles];
      onFilesChange(allFiles);

      // Upload each file
      for (const uploadedFile of newFiles) {
        try {
          await uploadFile(uploadedFile, cerereId);
          allFiles = allFiles.map((f) =>
            f.id === uploadedFile.id ? { ...f, uploaded: true, uploadProgress: 100 } : f
          );
          onFilesChange(allFiles);
        } catch (error) {
          allFiles = allFiles.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  error: error instanceof Error ? error.message : "Eroare la incarcare",
                }
              : f
          );
          onFilesChange(allFiles);
          toast.error(`Eroare la incarcarea fisierului ${uploadedFile.file.name}`);
        }
      }

      setUploading(false);
    },
    [uploadedFiles, onFilesChange, cerereId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
  });

  async function uploadFile(uploadedFile: UploadedFile, cerereId?: string): Promise<void> {
    if (!cerereId) {
      throw new Error("Nu exista un ID de cerere pentru incarcarea documentelor");
    }

    const formData = new FormData();
    formData.append("file", uploadedFile.file);
    formData.append("cerere_id", cerereId);

    const response = await fetch(`/api/cereri/${cerereId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Eroare la incarcarea fisierului");
    }

    const data = await response.json();

    // Update file with storage URL
    uploadedFile.storageUrl = data.data.storage_path;
  }

  function removeFile(fileId: string): void {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFilesChange(uploadedFiles.filter((f) => f.id !== fileId));
  }

  function canProceed(): boolean {
    // If no requirements, always allow proceeding
    if (documenteNecesare.length === 0) return true;
    // Allow proceeding if at least some files uploaded and all finished
    // Note: actual enforcement is on submit, not here (drafts allowed without all docs)
    return uploadedFiles.length > 0 ? uploadedFiles.every((f) => f.uploaded || f.error) : true;
  }

  const totalSize = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Incarca documentele necesare</h2>
        <p className="text-muted-foreground">
          Adauga documentele cerute pentru procesarea cererii tale
        </p>
      </div>

      {/* Required documents checklist */}
      {documenteNecesare.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            {obligatorii.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-3 flex items-center gap-2 font-medium">
                  <FileWarning className="h-4 w-4 text-red-500" />
                  Documente obligatorii:
                </h3>
                <ul className="space-y-2">
                  {obligatorii.map((doc, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                        <span className="text-xs font-bold text-red-600">*</span>
                      </div>
                      <span>{doc.denumire}</span>
                      <Badge variant="destructive" className="ml-auto text-[10px]">
                        Obligatoriu
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {optionale.length > 0 && (
              <div>
                <h3 className="text-muted-foreground mb-3 font-medium">Documente optionale:</h3>
                <ul className="space-y-2">
                  {optionale.map((doc, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="bg-muted mt-0.5 rounded-full p-1">
                        <div className="bg-muted-foreground h-1.5 w-1.5 rounded-full" />
                      </div>
                      <span className="text-muted-foreground">{doc.denumire}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        Optional
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {obligatorii.length > 0 && (
              <p className="text-muted-foreground mt-4 text-xs">
                Documentele obligatorii vor fi verificate la trimiterea cererii. Poti salva ca draft
                si incarca documentele mai tarziu.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary"
        } ${uploading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 font-medium">
          {isDragActive ? "Elibereaza pentru a incarca" : "Trage fisierele aici"}
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">sau click pentru a selecta fisiere</p>
        <div className="text-muted-foreground flex flex-wrap justify-center gap-2 text-xs">
          <Badge variant="secondary">PDF</Badge>
          <Badge variant="secondary">JPG</Badge>
          <Badge variant="secondary">PNG</Badge>
          <Badge variant="secondary">DOC</Badge>
          <Badge variant="secondary">DOCX</Badge>
        </div>
        <p className="text-muted-foreground mt-3 text-xs">Max. 10MB per fisier | Max. 50MB total</p>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Fisiere incarcate ({uploadedFiles.length})</h3>
            <p className="text-muted-foreground text-sm">{formatFileSize(totalSize)} / 50MB</p>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <File className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatFileSize(file.file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.uploaded && <Check className="h-4 w-4 text-green-600" />}
                          {file.error && <AlertCircle className="text-destructive h-4 w-4" />}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!file.uploaded && !file.error && (
                        <Progress value={file.uploadProgress} className="mt-2 h-1" />
                      )}

                      {file.error && <p className="text-destructive mt-1 text-xs">{file.error}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Validation message */}
      {obligatorii.length > 0 && uploadedFiles.length === 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  Documente obligatorii necesare
                </p>
                <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                  Acest tip de cerere necesita {obligatorii.length} document(e) obligatoriu(e). Le
                  poti incarca acum sau le poti adauga mai tarziu inainte de trimitere.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Inapoi
        </Button>

        <Button onClick={onNext} disabled={!canProceed() || uploading}>
          {uploading ? "Se incarca..." : "Continua"}
        </Button>
      </div>
    </div>
  );
}
