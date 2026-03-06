"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { avatarUploadSchema } from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ClickableAvatarProps {
  currentUrl: string | null;
  initials: string;
  size?: "sm" | "md" | "lg";
  bucketPath?: string;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeMap = {
  sm: { container: "h-8 w-8", text: "text-xs", iconSize: "h-3 w-3", spinnerSize: "h-4 w-4" },
  md: { container: "h-12 w-12", text: "text-sm", iconSize: "h-4 w-4", spinnerSize: "h-5 w-5" },
  lg: { container: "h-20 w-20", text: "text-lg", iconSize: "h-5 w-5", spinnerSize: "h-6 w-6" },
} as const;

// ============================================================================
// Component
// ============================================================================

export function ClickableAvatar({
  currentUrl,
  initials,
  size = "lg",
  bucketPath = "avatars",
  onUploadSuccess,
  className,
}: ClickableAvatarProps): React.JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeConfig = sizeMap[size];

  // Sync preview when prop changes
  const displayUrl = uploading ? previewUrl : (currentUrl ?? previewUrl);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate using existing schema
    const validation = avatarUploadSchema.safeParse({ file });
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message ?? "Fisier invalid";
      toast.error(errorMessage);
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    try {
      setUploading(true);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Utilizator neautentificat");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${bucketPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
      toast.success("Imaginea a fost actualizata");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la incarcarea imaginii";
      toast.error(errorMessage);
      setPreviewUrl(currentUrl);
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "group focus-visible:ring-accent-500 relative overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          sizeConfig.container
        )}
        aria-label="Schimba imaginea"
      >
        {/* Image or fallback */}
        {displayUrl ? (
          <img src={displayUrl} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-2xl font-bold text-white",
              sizeConfig.text
            )}
            style={{
              background: "linear-gradient(135deg, var(--accent-400), var(--accent-600))",
            }}
          >
            {initials}
          </div>
        )}

        {/* Hover overlay with Camera icon */}
        {!uploading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100"
            initial={false}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Camera className={cn("text-white", sizeConfig.iconSize)} />
          </motion.div>
        )}

        {/* Loading spinner overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
            <Loader2 className={cn("animate-spin text-white", sizeConfig.spinnerSize)} />
          </div>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
