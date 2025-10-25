"use client";

import { useState } from "react";
import { SelectJudet } from "@/components/location/SelectJudet";
import { LocalitateCombobox } from "@/components/location/LocalitateCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestLocalitateComboboxPage() {
  const [selectedJudetId, setSelectedJudetId] = useState<number | null>(null);
  const [selectedLocalitateId, setSelectedLocalitateId] = useState<number | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<
    Array<{ judet: number; localitate: number }>
  >([]);

  const handleJudetSelect = (judetId: number) => {
    setSelectedJudetId(judetId);
    setSelectedLocalitateId(null); // Reset localitate when județ changes
  };

  const handleLocalitateSelect = (localitateId: number) => {
    setSelectedLocalitateId(localitateId);
    if (selectedJudetId) {
      setSelectionHistory((prev) => [
        ...prev,
        { judet: selectedJudetId, localitate: localitateId },
      ]);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Localitate Combobox Component Test</h1>
          <p className="text-muted-foreground">
            Test page pentru componenta LocalitateCombobox cu search, debouncing și virtual
            scrolling
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Usage - Județ + Localitate Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="judet-selector" className="mb-2 block text-sm font-medium">
                1. Selectează județul:
              </label>
              <SelectJudet onSelect={handleJudetSelect} />
            </div>

            <div>
              <label htmlFor="localitate-combobox" className="mb-2 block text-sm font-medium">
                2. Caută și selectează localitatea:
              </label>
              <LocalitateCombobox
                judetId={selectedJudetId}
                value={selectedLocalitateId}
                onSelect={handleLocalitateSelect}
              />
            </div>

            {selectedJudetId && selectedLocalitateId && (
              <div className="bg-primary/10 space-y-2 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium">Selected Județ ID:</p>
                  <p className="text-primary text-xl font-bold">{selectedJudetId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Selected Localitate ID:</p>
                  <p className="text-primary text-xl font-bold">{selectedLocalitateId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empty State - No Județ Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Localitate selector (without județ):
              </label>
              <LocalitateCombobox judetId={null} onSelect={handleLocalitateSelect} />
              <p className="text-muted-foreground mt-2 text-xs">
                ℹ️ Component shows &quot;Selectează județul mai întâi&quot; when no județ is
                selected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Disabled localitate selector:
              </label>
              <LocalitateCombobox
                judetId={selectedJudetId}
                onSelect={handleLocalitateSelect}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features & Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-3 text-sm">
              <div>
                <p className="text-foreground font-semibold">✅ Search & Debouncing:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>Real-time search with 300ms debounce</li>
                  <li>Case-insensitive matching</li>
                  <li>Automatic request cancellation on new search</li>
                  <li>Empty state for no results</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-semibold">✅ Virtual Scrolling:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>Handles 1000+ localități smoothly</li>
                  <li>Only renders ~50 items at a time</li>
                  <li>60 FPS scrolling performance</li>
                  <li>Powered by @tanstack/react-virtual</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-semibold">✅ Caching:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>In-memory cache by județ + search query</li>
                  <li>Instant loading for repeated searches</li>
                  <li>Reduces API calls significantly</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-semibold">✅ UI/UX:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>Badge indicators for tip (Municipiu, Oraș, Comună)</li>
                  <li>Loading state with spinner</li>
                  <li>Error state with retry button</li>
                  <li>Check icon for selected item</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accessibility Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p className="text-foreground font-semibold">✅ Keyboard Navigation:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>Tab - Navigate to combobox</li>
                <li>Enter/Space - Open dropdown</li>
                <li>Type to search immediately</li>
                <li>Arrow Up/Down - Navigate filtered results</li>
                <li>Enter - Select highlighted option</li>
                <li>Escape - Close dropdown</li>
              </ul>

              <p className="text-foreground mt-4 font-semibold">✅ Screen Reader Support:</p>
              <ul className="ml-4 list-inside list-disc space-y-1">
                <li>ARIA labels for all interactive elements</li>
                <li>role=&quot;combobox&quot; and role=&quot;listbox&quot;</li>
                <li>aria-expanded state announcement</li>
                <li>Results count announcement</li>
                <li>Loading and error states announced</li>
                <li>Empty state messages</li>
              </ul>
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
                <div className="space-y-1">
                  {selectionHistory
                    .slice(-10)
                    .reverse()
                    .map((selection, index) => (
                      <div
                        key={index}
                        className="bg-secondary text-secondary-foreground flex justify-between rounded-md px-3 py-2 text-sm"
                      >
                        <span>Județ ID: {selection.judet}</span>
                        <span>→</span>
                        <span>Localitate ID: {selection.localitate}</span>
                      </div>
                    ))}
                </div>
                {selectionHistory.length > 10 && (
                  <p className="text-muted-foreground text-xs italic">Showing last 10 selections</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Testing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p className="text-foreground font-semibold">📝 Test Scenarios:</p>
              <ol className="ml-4 list-inside list-decimal space-y-1">
                <li>
                  Select București (județ_id: 40) - Has 1000+ localități for virtual scroll testing
                </li>
                <li>Select Iași (județ_id: 22) - Also has many localități</li>
                <li>
                  Try searching for partial names like &quot;bra&quot;, &quot;buc&quot;,
                  &quot;ia&quot;
                </li>
                <li>Test rapid typing to verify debouncing works</li>
                <li>Scroll through long lists to test performance</li>
                <li>Test keyboard navigation throughout</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
