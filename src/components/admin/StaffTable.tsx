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
import { Search, ChevronLeft, ChevronRight, Users, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface StaffUser {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol: string;
  departament?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface StaffTableProps {
  initialStaff: StaffUser[];
  currentUserRole: string;
}

const ITEMS_PER_PAGE = 10;

export function StaffTable({ initialStaff, currentUserRole }: StaffTableProps) {
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Filter staff
  const filteredStaff = staff.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.prenume.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departament?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.rol === filterRole;

    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Load more data if needed (future: implement API pagination)
  const loadMoreData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users?page=${Math.floor(staff.length / ITEMS_PER_PAGE) + 1}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();
      if (data.users && data.users.length > 0) {
        setStaff((prev) => [...prev, ...data.users]);
      }
    } catch (error) {
      console.error("Error loading more staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get role badge variant and label
  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case "super_admin":
        return {
          variant: "default" as const,
          label: "Super Admin",
          className: "bg-purple-600 hover:bg-purple-700",
        };
      case "admin":
        return {
          variant: "default" as const,
          label: "Administrator",
          className: "bg-blue-600 hover:bg-blue-700",
        };
      case "functionar":
        return { variant: "secondary" as const, label: "Funcționar", className: "" };
      default:
        return { variant: "outline" as const, label: rol, className: "" };
    }
  };

  return (
    <Card className="border-border bg-card border shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Membri Echipă</CardTitle>
            <CardDescription className="mt-1">
              {filteredStaff.length} {filteredStaff.length === 1 ? "membru" : "membri"}
              {searchTerm || filterRole !== "all" ? " filtrat(e)" : " total"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Caută după nume, email, departament..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={filterRole}
            onValueChange={(value) => {
              setFilterRole(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate rolurile</SelectItem>
              <SelectItem value="functionar">Funcționari</SelectItem>
              <SelectItem value="admin">Administratori</SelectItem>
              {currentUserRole === "super_admin" && (
                <SelectItem value="super_admin">Super Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border-border overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Nume Complet</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Rol</TableHead>
                <TableHead className="font-semibold">Departament</TableHead>
                <TableHead className="font-semibold">Data Înregistrării</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 opacity-20" />
                      <p>Nu există membri care să corespundă filtrelor</p>
                      {(searchTerm || filterRole !== "all") && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setFilterRole("all");
                          }}
                        >
                          Resetează filtrele
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStaff.map((user) => {
                  const roleBadge = getRoleBadge(user.rol);
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                            {user.prenume.charAt(0)}
                            {user.nume.charAt(0)}
                          </div>
                          <span>
                            {user.prenume} {user.nume}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground text-sm">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadge.variant} className={roleBadge.className}>
                          {roleBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.departament || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground text-sm">
                            {format(new Date(user.created_at), "dd MMM yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="border-green-600 text-green-700">
                          Activ
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Pagina {currentPage} din {totalPages} ({filteredStaff.length} total)
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

        {/* Load More Button (if more data available on server) */}
        {!isLoading && staff.length % ITEMS_PER_PAGE === 0 && staff.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={loadMoreData}>
              Încarcă mai multe
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Se încarcă...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
