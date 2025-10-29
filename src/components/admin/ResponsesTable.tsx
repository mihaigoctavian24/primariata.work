"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Search, ChevronLeft, ChevronRight, Eye, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ResponsesDialog } from "./ResponsesDialog";
import {
  ExportDialog,
  type ExportOptions,
  type ColumnOption,
} from "@/components/dashboard/ExportDialog";
import { useExport, type ExportData, type ExportSummaryData } from "@/hooks/useExport";
import type { RespondentType } from "@/types/survey";
import { useOptimisticMutation } from "@/hooks/useRealTimeData";
import { toast } from "sonner";

interface Respondent {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  county: string;
  locality: string;
  respondent_type: string;
  is_completed: boolean | null;
  created_at: string | null;
  completed_at: string | null;
}

interface ResponsesTableProps {
  initialResponses: Respondent[];
}

const ITEMS_PER_PAGE = 10;

export function ResponsesTable({ initialResponses }: ResponsesTableProps) {
  const [responses, setResponses] = useState<Respondent[]>(initialResponses);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCounty, setFilterCounty] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRespondent, setSelectedRespondent] = useState<Respondent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [respondentToDelete, setRespondentToDelete] = useState<Respondent | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Export hook
  const { exportData, isExporting } = useExport();

  // Optimistic delete mutation
  const deleteMutation = useOptimisticMutation<void, string>({
    mutationFn: async (respondentId: string) => {
      const response = await fetch(`/api/admin/survey/responses/${respondentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete respondent");
      }
    },
    queryKey: ["responses"], // Local cache key
    onSuccess: () => {
      toast.success("Respondent șters cu succes", {
        duration: 2000,
        position: "bottom-right",
      });
    },
    onError: () => {
      toast.error("Eroare la ștergerea respondentului", {
        duration: 3000,
        position: "bottom-right",
      });
    },
    updateOptimistically: (oldData: unknown, respondentId: string) => {
      // Optimistically remove from local state
      if (Array.isArray(oldData)) {
        return oldData.filter((r: Respondent) => r.id !== respondentId);
      }
      return oldData;
    },
  });

  const handleViewResponses = (respondent: Respondent) => {
    setSelectedRespondent(respondent);
    setDialogOpen(true);
  };

  const handleDeleteClick = (respondent: Respondent) => {
    setRespondentToDelete(respondent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!respondentToDelete) return;

    // Optimistically remove from local state
    setResponses((prev) => prev.filter((r) => r.id !== respondentToDelete.id));

    // Close dialog immediately for better UX
    setDeleteDialogOpen(false);
    const respondentId = respondentToDelete.id;
    setRespondentToDelete(null);

    // Execute mutation with optimistic update
    try {
      await deleteMutation.mutateAsync(respondentId);
    } catch {
      // Error handled by mutation, but rollback local state
      setResponses(initialResponses);
    }
  };

  // Get unique counties for filter
  const counties = Array.from(new Set(responses.map((r) => r.county))).sort();

  // Filter responses
  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      searchTerm === "" ||
      response.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.locality.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || response.respondent_type === filterType;
    const matchesCounty = filterCounty === "all" || response.county === filterCounty;

    return matchesSearch && matchesType && matchesCounty;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Available columns for export
  const availableColumns: ColumnOption[] = [
    { id: "id", label: "ID", required: true },
    { id: "first_name", label: "Prenume", required: true },
    { id: "last_name", label: "Nume", required: true },
    { id: "email", label: "Email" },
    { id: "county", label: "Județ" },
    { id: "locality", label: "Localitate" },
    { id: "respondent_type", label: "Tip Respondent" },
    { id: "is_completed", label: "Status Completare" },
    { id: "created_at", label: "Data Creării" },
    { id: "completed_at", label: "Data Completării" },
  ];

  // Summary data for export
  const exportSummary: ExportSummaryData = useMemo(() => {
    const completed = filteredResponses.filter((r) => r.is_completed).length;
    const citizens = filteredResponses.filter((r) => r.respondent_type === "citizen").length;
    const publicServants = filteredResponses.filter(
      (r) => r.respondent_type === "public_servant"
    ).length;

    // Calculate top counties
    const countyCounts = filteredResponses.reduce(
      (acc, r) => {
        acc[r.county] = (acc[r.county] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCounties = Object.entries(countyCounts)
      .map(([county, count]) => ({ county, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalResponses: filteredResponses.length,
      completedResponses: completed,
      citizenResponses: citizens,
      publicServantResponses: publicServants,
      topCounties,
    };
  }, [filteredResponses]);

  // Handle export with new dialog
  const handleExport = async (format: string, options: ExportOptions) => {
    const exportDataPayload: ExportData<Record<string, unknown>> = {
      data: filteredResponses as unknown as Record<string, unknown>[],
      columns: [
        { key: "id", label: "ID" },
        { key: "first_name", label: "Prenume" },
        { key: "last_name", label: "Nume" },
        { key: "email", label: "Email" },
        { key: "county", label: "Județ" },
        { key: "locality", label: "Localitate" },
        { key: "respondent_type", label: "Tip Respondent" },
        { key: "is_completed", label: "Status" },
        { key: "created_at", label: "Data Creării" },
        { key: "completed_at", label: "Data Completării" },
      ],
      summary: exportSummary,
    };

    await exportData(exportDataPayload, options);
  };

  return (
    <Card className="border-border bg-card border shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Răspunsuri Chestionar</CardTitle>
            <CardDescription className="mt-1">
              {filteredResponses.length} răspunsuri{" "}
              {searchTerm || filterType !== "all" || filterCounty !== "all" ? "filtrate" : "total"}
            </CardDescription>
          </div>
          <Button onClick={() => setExportDialogOpen(true)} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Caută după nume, email, localitate..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Tip respondent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tipurile</SelectItem>
              <SelectItem value="citizen">Cetățeni</SelectItem>
              <SelectItem value="public_servant">Funcționari</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterCounty}
            onValueChange={(value) => {
              setFilterCounty(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Județ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate județele</SelectItem>
              {counties.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nume</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Locație</TableHead>
                <TableHead className="font-semibold">Tip</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="text-right font-semibold">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 opacity-20" />
                      <p>Nu există răspunsuri care să corespundă filtrelor</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResponses.map((response) => (
                  <TableRow key={response.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      {response.first_name} {response.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{response.email || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {response.locality}, {response.county}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={response.respondent_type === "citizen" ? "default" : "secondary"}
                        className={
                          response.respondent_type === "citizen"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : ""
                        }
                      >
                        {response.respondent_type === "citizen" ? "Cetățean" : "Funcționar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={response.is_completed ? "default" : "outline"}
                        className={response.is_completed ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {response.is_completed ? "Completat" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {response.created_at
                        ? format(new Date(response.created_at), "dd.MM.yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewResponses(response)}
                          disabled={!response.is_completed}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Vezi
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(response)}
                          className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Șterge
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Pagina {currentPage} din {totalPages} ({filteredResponses.length} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Următorul
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Responses Dialog */}
      {selectedRespondent && (
        <ResponsesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          respondent={{
            id: selectedRespondent.id,
            first_name: selectedRespondent.first_name,
            last_name: selectedRespondent.last_name,
            respondent_type: selectedRespondent.respondent_type as RespondentType,
            county: selectedRespondent.county,
            locality: selectedRespondent.locality,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă ștergerea</AlertDialogTitle>
            <AlertDialogDescription>
              Sigur vrei să ștergi răspunsurile lui{" "}
              <span className="font-semibold">
                {respondentToDelete?.first_name} {respondentToDelete?.last_name}
              </span>
              ? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        formats={["csv", "xlsx", "pdf"]}
        title="Export Survey Responses"
        description="Configure your export settings and download your data"
        isExporting={isExporting}
        availableColumns={availableColumns}
      />
    </Card>
  );
}
