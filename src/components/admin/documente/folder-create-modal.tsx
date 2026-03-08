"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminModal } from "@/components/admin/shared/admin-modal";
import { createClient } from "@/lib/supabase/client";

export interface FolderCreateModalProps {
  open: boolean;
  onClose: () => void;
  primarieId: string;
  onFolderCreated: (folderName: string) => void;
}

export function FolderCreateModal({
  open,
  onClose,
  primarieId,
  onFolderCreated,
}: FolderCreateModalProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (): Promise<void> => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Numele folderului trebuie să aibă minim 2 caractere");
      return;
    }
    if (trimmed.includes("/")) {
      setError("Numele nu poate conține caracterul /");
      return;
    }

    setLoading(true);
    setError("");

    // Create folder by uploading a .keep placeholder file at the folder prefix
    const supabase = createClient();
    const placeholderPath = `${primarieId}/${trimmed}/.keep`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(placeholderPath, new Blob([""], { type: "text/plain" }), { upsert: true });

    setLoading(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    toast.success(`Folder "${trimmed}" creat cu succes!`);
    onFolderCreated(trimmed);
    setName("");
    onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={() => {
        setName("");
        setError("");
        onClose();
      }}
      title="Folder Nou"
      size="sm"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm text-white cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center min-w-[120px]"
            style={{
              background: "linear-gradient(135deg, var(--color-violet-500), var(--color-indigo-500))",
            }}
          >
            {loading ? "Se creează..." : "Creează Folder"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 py-2">
        <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Nume Folder
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="ex. Certificate Fiscale"
          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-1 focus:ring-[var(--color-info)]/50"
        />
        {error && <p className="text-[var(--color-error)] text-xs">{error}</p>}
        <p className="text-muted-foreground text-xs mt-1">
          Un folder nou va apărea în lista de foldere din pagina Documente.
        </p>
      </div>
    </AdminModal>
  );
}
