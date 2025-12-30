"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Clock, Banknote } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TipCerere } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

interface SelectTipCerereProps {
  onSelect: (tipCerere: TipCerere) => void;
  selectedTipCerere?: TipCerere;
}

export function SelectTipCerere({ onSelect, selectedTipCerere }: SelectTipCerereProps) {
  const [tipuriCereri, setTipuriCereri] = useState<TipCerere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTipuriCereri() {
      try {
        const response = await fetch("/api/tipuri-cereri");
        if (!response.ok) {
          throw new Error("Failed to fetch tipuri cereri");
        }
        const data = await response.json();
        setTipuriCereri(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTipuriCereri();
  }, []);

  const filteredTipuri = tipuriCereri.filter((tip) => {
    const query = searchQuery.toLowerCase();
    return (
      tip.nume.toLowerCase().includes(query) ||
      tip.cod.toLowerCase().includes(query) ||
      tip.descriere?.toLowerCase().includes(query) ||
      tip.departament_responsabil?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2" />
          <p className="text-muted-foreground text-sm">Se încarcă tipurile de cereri...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Eroare</CardTitle>
            <CardDescription>Nu s-au putut încărca tipurile de cereri</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Reîncearcă
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Selectează tipul cererii</h2>
        <p className="text-muted-foreground">
          Alege tipul de cerere pe care dorești să o depui la primărie
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Caută după nume, cod sau departament..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-muted-foreground text-sm">
          {filteredTipuri.length} {filteredTipuri.length === 1 ? "rezultat" : "rezultate"} găsite
        </p>
      )}

      {/* Grid of cerere types */}
      {filteredTipuri.length === 0 ? (
        <Card className="p-12">
          <div className="space-y-2 text-center">
            <FileText className="text-muted-foreground mx-auto h-12 w-12 opacity-50" />
            <h3 className="font-medium">Niciun tip de cerere găsit</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Încearcă să modifici criteriile de căutare"
                : "Nu există tipuri de cereri disponibile momentan"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTipuri.map((tip) => (
            <Card
              key={tip.id}
              className={`hover:border-primary cursor-pointer transition-all hover:shadow-lg ${
                selectedTipCerere?.id === tip.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => onSelect(tip)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="line-clamp-2 text-lg">{tip.nume}</CardTitle>
                    <CardDescription className="mt-1 text-xs">Cod: {tip.cod}</CardDescription>
                  </div>
                  <FileText className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {tip.descriere && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">{tip.descriere}</p>
                )}

                {tip.departament_responsabil && (
                  <Badge variant="secondary" className="text-xs">
                    {tip.departament_responsabil}
                  </Badge>
                )}

                <div className="space-y-2 border-t pt-2">
                  {/* Taxa */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Banknote className="h-4 w-4" />
                      Taxă:
                    </span>
                    <span className="font-medium">
                      {tip.necesita_taxa && tip.valoare_taxa
                        ? formatCurrency(tip.valoare_taxa)
                        : "Gratuită"}
                    </span>
                  </div>

                  {/* Termen */}
                  {tip.termen_legal_zile && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Termen:
                      </span>
                      <span className="font-medium">
                        {tip.termen_legal_zile} {tip.termen_legal_zile === 1 ? "zi" : "zile"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
