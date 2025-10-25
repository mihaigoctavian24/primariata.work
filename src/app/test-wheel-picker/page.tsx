"use client";

import { useState } from "react";
import { LocationWheelPickerForm } from "@/components/location/LocationWheelPickerForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TestWheelPickerPage() {
  const [submittedData, setSubmittedData] = useState<{
    judetId: string;
    localitateId: string;
  } | null>(null);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">Location Wheel Picker Test</h1>
          <p className="text-muted-foreground">
            iOS-style wheel picker pentru selecție județ și localitate cu infinite scroll
          </p>
        </div>

        {/* Main Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Wheel Picker Form Demo</CardTitle>
            <CardDescription>
              Selectează județul și localitatea folosind wheel picker-ul iOS-style
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <LocationWheelPickerForm
              onSubmit={(values) => {
                setSubmittedData(values);
              }}
            />

            {submittedData && (
              <div className="bg-primary/10 w-full rounded-lg p-4">
                <p className="mb-2 text-sm font-medium">✅ Formular trimis:</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Județ ID:</strong> {submittedData.judetId}
                  </p>
                  <p>
                    <strong>Localitate ID:</strong> {submittedData.localitateId}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-foreground mb-2 font-medium">✅ iOS-Style Wheel Picker:</p>
                <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                  <li>Smooth inertia scrolling animation</li>
                  <li>Infinite loop support for long lists</li>
                  <li>Touch-friendly mobile interface</li>
                  <li>Keyboard navigation support</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">✅ Cascading Selection:</p>
                <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                  <li>Județ selection loads corresponding localități</li>
                  <li>Localitate picker disabled until județ is selected</li>
                  <li>Automatic reset of localitate when județ changes</li>
                  <li>Smart caching to avoid redundant API calls</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">✅ React Hook Form Integration:</p>
                <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                  <li>Zod validation for required fields</li>
                  <li>Form state management with react-hook-form</li>
                  <li>Error handling and display</li>
                  <li>Toast notifications on submit</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">✅ Loading & Error States:</p>
                <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                  <li>Loading spinners during data fetch</li>
                  <li>Error messages with retry buttons</li>
                  <li>Empty state handling</li>
                  <li>Graceful fallbacks for all states</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">✅ Performance Optimizations:</p>
                <ul className="text-muted-foreground ml-4 list-inside list-disc space-y-1">
                  <li>In-memory caching for județe (single fetch per session)</li>
                  <li>In-memory caching for localități (per județ)</li>
                  <li>Request cancellation with AbortController</li>
                  <li>Optimized re-renders with React Hook Form</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-4 text-sm">
              <div>
                <p className="text-foreground mb-2 font-medium">🖱️ Desktop/Laptop:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>Click and drag the wheel to scroll</li>
                  <li>Click on an item to select it</li>
                  <li>Scroll with mouse wheel for smooth scrolling</li>
                  <li>Use arrow keys for keyboard navigation</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">📱 Mobile/Tablet:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li>Swipe up/down to scroll the wheel</li>
                  <li>Flick for inertia scrolling effect</li>
                  <li>Tap to select highlighted item</li>
                  <li>Natural iOS-like interaction</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-2 font-medium">🎯 Steps:</p>
                <ol className="ml-4 list-inside list-decimal space-y-1">
                  <li>Scroll the first wheel to select your județ</li>
                  <li>Wait for localități to load (automatic)</li>
                  <li>Scroll the second wheel to select your localitate</li>
                  <li>Click &quot;Confirmă locația&quot; to submit</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>
                <strong className="text-foreground">Component:</strong> @ncdai/react-wheel-picker
                v1.0.17
              </p>
              <p>
                <strong className="text-foreground">Form:</strong> React Hook Form v7.65.0 with Zod
                validation
              </p>
              <p>
                <strong className="text-foreground">API:</strong> /api/localitati/judete and
                /api/localitati?judet_id=X
              </p>
              <p>
                <strong className="text-foreground">Caching:</strong> In-memory Map for both județe
                and localități
              </p>
              <p>
                <strong className="text-foreground">Infinite Scroll:</strong> Enabled for both
                wheels (seamless loop)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
