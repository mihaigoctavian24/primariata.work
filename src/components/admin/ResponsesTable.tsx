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
import { Badge } from "@/components/ui/badge";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Respondent {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  county: string;
  locality: string;
  respondent_type: string;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
}

interface ResponsesTableProps {
  initialResponses: Respondent[];
}

const ITEMS_PER_PAGE = 10;

export function ResponsesTable({ initialResponses }: ResponsesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCounty, setFilterCounty] = useState<string>("all");

  // Get unique counties for filter
  const counties = Array.from(new Set(initialResponses.map((r) => r.county))).sort();

  // Filter responses
  const filteredResponses = initialResponses.filter((response) => {
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
      format(new Date(r.created_at), "dd.MM.yyyy HH:mm"),
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Răspunsuri Chestionar</CardTitle>
            <CardDescription>
              {filteredResponses.length} răspunsuri{" "}
              {searchTerm || filterType !== "all" || filterCounty !== "all" ? "filtrate" : "total"}
            </CardDescription>
          </div>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Locație</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Nu există răspunsuri care să corespundă filtrelor
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResponses.map((response) => (
                  <TableRow key={response.id}>
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
                      {format(new Date(response.created_at), "dd.MM.yyyy HH:mm")}
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
    </Card>
  );
}
