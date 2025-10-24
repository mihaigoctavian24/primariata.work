"use client";

import { useState } from "react";
import { SelectJudet } from "@/components/location/SelectJudet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestJudetSelectorPage() {
  const [selectedJudetId, setSelectedJudetId] = useState<number | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<number[]>([]);

  const handleJudetSelect = (judetId: number) => {
    setSelectedJudetId(judetId);
    setSelectionHistory((prev) => [...prev, judetId]);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Județ Selector Component Test</h1>
          <p className="text-muted-foreground">
            Test page pentru componenta SelectJudet cu toate funcționalitățile
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="judet-selector" className="mb-2 block text-sm font-medium">
                Selectează județul:
              </label>
              <SelectJudet onSelect={handleJudetSelect} />
            </div>

            {selectedJudetId && (
              <div className="bg-primary/10 rounded-lg p-4">
                <p className="text-sm font-medium">Selected Județ ID:</p>
                <p className="text-primary text-2xl font-bold">{selectedJudetId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Default Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Pre-selected: București (ID: 40)
              </label>
              <SelectJudet onSelect={handleJudetSelect} defaultValue="40" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="mb-2 block text-sm font-medium">Disabled selector:</label>
              <SelectJudet onSelect={handleJudetSelect} disabled />
            </div>
          </CardContent>
        </Card>

        {selectionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Total selections: {selectionHistory.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectionHistory.map((id, index) => (
                    <span
                      key={index}
                      className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Accessibility Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>✅ Keyboard Navigation:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Tab - Navigate to selector</li>
                <li>Space/Enter - Open dropdown</li>
                <li>Arrow Up/Down - Navigate options</li>
                <li>Enter - Select option</li>
                <li>Escape - Close dropdown</li>
              </ul>
              <p className="mt-4">✅ Screen Reader:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>ARIA labels for all states</li>
                <li>Loading state announced</li>
                <li>Error state announced</li>
                <li>Selection count announced</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
