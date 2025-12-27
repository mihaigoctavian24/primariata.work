"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { avatarUploadSchema } from "@/lib/validations/profile";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userFullName?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  userFullName,
  onUploadSuccess,
  onUploadError,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentAvatarUrl prop when it changes (e.g., after page refresh)
  useEffect(() => {
    console.log("🔄 AvatarUpload: currentAvatarUrl prop changed to:", currentAvatarUrl);
    setPreview(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📁 File selected:", file.name, file.size, file.type);

    // Validate file
    const validation = avatarUploadSchema.safeParse({ file });
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || "Fișier invalid";
      console.error("❌ Validation failed:", errorMessage);
      setError(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    console.log("✅ Validation passed");

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      console.log("📸 Preview set");
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    console.log("⬆️ Starting upload...");
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const supabase = createClient();
      console.log("🔐 Getting user...");

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilizator neautentificat");
      }

      console.log("👤 User authenticated:", user.id);

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log("📤 Uploading to:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful!");

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(filePath);

      console.log("🔗 Public URL:", publicUrl);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });

      if (updateError) {
        console.error("❌ Update user error:", updateError);
        throw updateError;
      }

      console.log("✅ User metadata updated!");

      // Success
      onUploadSuccess?.(publicUrl);
      setPreview(publicUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la încărcarea imaginii";
      console.error("💥 Upload failed:", err);
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      setError(null);

      const supabase = createClient();

      // Update user metadata to remove avatar
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Clear preview
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Eroare la ștergerea imaginii";
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!userFullName) return "U";
    const names = userFullName.split(" ").filter(Boolean);
    if (names.length >= 2 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    if (names[0] && names[0][0]) {
      return names[0][0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar className="h-32 w-32">
          {preview ? (
            <AvatarImage src={preview} alt="Avatar" />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-medium">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Remove Button */}
        {preview && !uploading && (
          <button
            onClick={handleRemoveAvatar}
            className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1.5 shadow-md transition-opacity hover:opacity-80"
            aria-label="Șterge avatar"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {preview ? "Schimbă imaginea" : "Încarcă imaginea"}
        </Button>

        <p className="text-muted-foreground text-center text-xs">JPEG, PNG sau WebP. Max 2MB.</p>

        {/* Error Message */}
        {error && <p className="text-destructive text-center text-sm">{error}</p>}
      </div>
    </div>
  );
}
