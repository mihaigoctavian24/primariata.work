"use client";

import { use } from "react";
import { FileText, Download, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentePageProps {
  params: Promise<{ judet: string; localitate: string }>;
}

export default function DocumentePage({ params }: DocumentePageProps): React.JSX.Element {
  use(params);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documente</h1>
          <p className="text-muted-foreground mt-1">
            Gestioneaza documentele tale si descarca formulare publice
          </p>
        </div>
      </div>

      {/* Section 1: Documentele Mele */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Documentele Mele</h2>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input placeholder="Cauta documente..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table header skeleton */}
        <div className="border-border rounded-lg border">
          <div className="border-border bg-muted/50 grid grid-cols-12 gap-4 border-b px-4 py-3 text-sm font-medium">
            <div className="col-span-5">Nume Document</div>
            <div className="col-span-2">Tip</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2">Dimensiune</div>
            <div className="col-span-1">Actiuni</div>
          </div>

          {/* Empty state */}
          <div className="p-12 text-center">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-4 font-medium">Nu ai documente inca.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Documentele atasate cererilor tale vor aparea aici.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Formulare Publice */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Formulare Publice</h2>
        </div>

        {/* Table header skeleton */}
        <div className="border-border rounded-lg border">
          <div className="border-border bg-muted/50 grid grid-cols-12 gap-4 border-b px-4 py-3 text-sm font-medium">
            <div className="col-span-5">Nume Formular</div>
            <div className="col-span-3">Categorie</div>
            <div className="col-span-2">Format</div>
            <div className="col-span-2">Descarca</div>
          </div>

          {/* Empty state */}
          <div className="p-12 text-center">
            <Download className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-4 font-medium">
              Nu sunt formulare disponibile inca.
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Formularele publice ale primariei vor fi disponibile aici.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
