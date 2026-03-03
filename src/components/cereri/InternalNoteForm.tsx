"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addInternalNote } from "@/actions/cereri-workflow";
import { ChevronDown, ChevronUp, MessageSquarePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InternalNoteFormProps {
  cerereId: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * InternalNoteForm Component
 * Allows staff to add internal notes visible only to other staff members.
 *
 * - Collapsible by default (click to expand)
 * - Calls addInternalNote Server Action on submit
 * - Clears form and shows toast on success
 * - Max 5000 characters
 */
export function InternalNoteForm({
  cerereId,
  onSuccess,
  className,
}: InternalNoteFormProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = content.trim().length >= 1 && !isSubmitting;

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const result = await addInternalNote(cerereId, content.trim());

      if (result.success) {
        toast.success("Nota interna adaugata cu succes");
        setContent("");
        setIsExpanded(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Eroare la adaugarea notei");
      }
    } catch (error) {
      toast.error("A aparut o eroare neasteptata");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
        aria-expanded={isExpanded}
      >
        <MessageSquarePlus className="size-4" />
        Adauga nota interna
        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {/* Expanded form */}
      {isExpanded && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">Vizibila doar personalului primariei</p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Scrieti nota interna..."
            className="min-h-[80px]"
            maxLength={5000}
            aria-label="Continut nota interna"
          />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">{content.length}/5000</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setContent("");
                  setIsExpanded(false);
                }}
                disabled={isSubmitting}
              >
                Anuleaza
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Adauga nota
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
