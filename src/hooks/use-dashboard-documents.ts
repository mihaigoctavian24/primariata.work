"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserDocuments } from "@/actions/documents";

// Types for documents - matches RecentDocumentsWidget interface
export interface Document {
  id: string;
  nume: string;
  tip_document: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  cerere_id?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface DocumentsResponse {
  success: boolean;
  data: Document[];
  totalCount: number;
  error?: { message: string };
}

interface UseDocumentsOptions {
  days?: number;
  cerereId?: string;
  type?: string;
  status?: string;
  limit?: number;
}

/**
 * Hook for fetching recent documents via Server Action.
 * Maps the CategorizedDocuments response to the flat Document[]
 * format expected by RecentDocumentsWidget.
 */
export function useDashboardDocuments(options: UseDocumentsOptions = {}) {
  const { limit = 10 } = options;

  return useQuery<DocumentsResponse>({
    queryKey: ["dashboard", "documents", options],
    queryFn: async () => {
      const result = await fetchUserDocuments();

      if (!result.success) {
        return {
          success: false,
          data: [],
          totalCount: 0,
          error: { message: result.error },
        };
      }

      // Flatten all categories into a single list, sorted by date
      const allDocs = [...result.data.incarcate, ...result.data.chitante, ...result.data.confirmari]
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, limit);

      // Map to the Document interface expected by the widget
      const documents: Document[] = allDocs.map((d) => ({
        id: d.id,
        nume: d.nume_fisier,
        tip_document: d.tip_document,
        file_path: d.storage_path,
        file_size: d.marime_bytes,
        uploaded_at: d.created_at ?? "",
        cerere_id: d.cerere_id ?? undefined,
      }));

      return { success: true, data: documents, totalCount: result.data.totalCount };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
