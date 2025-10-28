"use client";

import { useState } from "react";
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
import type { RespondentType } from "@/types/survey";

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
  const [isDeleting, setIsDeleting] = useState(false);

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

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/survey/responses/${respondentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete respondent");
      }

      // Remove from local state
      setResponses((prev) => prev.filter((r) => r.id !== respondentToDelete.id));
      setDeleteDialogOpen(false);
      setRespondentToDelete(null);
    } catch (error) {
      console.error("Error deleting respondent:", error);
      alert("Eroare la ștergerea respondentului. Încercați din nou.");
    } finally {
      setIsDeleting(false);
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

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nume",
      "Prenume",
      "Email",
      "Județ",
      "Localitate",
      "Tip",
      "Completat",
      "Data",
    ];
    const rows = filteredResponses.map((r) => [
      r.id,
      r.last_name,
      r.first_name,
      r.email || "",
      r.county,
      r.locality,
      r.respondent_type === "citizen" ? "Cetățean" : "Funcționar",
      r.is_completed ? "Da" : "Nu",
      r.created_at ? format(new Date(r.created_at), "dd.MM.yyyy HH:mm") : "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `raspunsuri_chestionar_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="from-card via-card to-muted/20 border-none bg-gradient-to-br shadow-2xl">
      <CardHeader className="from-primary/5 border-b bg-gradient-to-r to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
              Răspunsuri Chestionar
            </CardTitle>
            <CardDescription className="mt-1">
              {filteredResponses.length} răspunsuri{" "}
              {searchTerm || filterType !== "all" || filterCounty !== "all" ? "filtrate" : "total"}
            </CardDescription>
          </div>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
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
        <div className="border-border/50 bg-card/50 overflow-hidden rounded-lg border backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/50 border-b-2">
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
                  <TableRow
                    key={response.id}
                    className="hover:bg-muted/50 border-border/30 border-b transition-colors"
                  >
                    <TableCell className="font-medium">
                      {response.first_name} {response.last_name}
                    </TableCell>
                    <TableCell>{response.email || "-"}</TableCell>
                    <TableCell>
                      {response.locality}, {response.county}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={response.respondent_type === "citizen" ? "default" : "secondary"}
                      >
                        {response.respondent_type === "citizen" ? "Cetățean" : "Funcționar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={response.is_completed ? "default" : "outline"}>
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
                          className="hover:bg-primary/10 hover:text-primary gap-2 transition-all hover:scale-105"
                        >
                          <Eye className="h-4 w-4" />
                          Vezi
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(response)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 transition-all hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <AlertDialogCancel disabled={isDeleting}>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Se șterge..." : "Șterge"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
