"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useState } from "react";

interface CorrelationData {
  variables: [string, string];
  coefficient: number; // -1 to 1
  pValue: number;
  significant: boolean;
  strength: "very_weak" | "weak" | "moderate" | "strong" | "very_strong";
  direction: "positive" | "negative" | "none";
  interpretation: string;
  sampleSize: number;
}

interface CorrelationMatrixProps {
  correlations: CorrelationData[];
  keyFindings?: string[];
  recommendations?: string[];
}

/**
 * Correlation Matrix Visualization Component
 *
 * Displays statistical correlations between survey variables:
 * - Heatmap visualization with color-coded coefficients
 * - Significance indicators (p-values)
 * - Strength and direction badges
 * - Key findings and recommendations
 */
export function CorrelationMatrix({
  correlations = [],
  keyFindings = [],
  recommendations = [],
}: CorrelationMatrixProps) {
  const [selectedCorrelation, setSelectedCorrelation] = useState<CorrelationData | null>(null);

  // Sort correlations by absolute coefficient (strongest first)
  const sortedCorrelations = [...correlations].sort(
    (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
  );

  // Get color based on coefficient value
  const getCorrelationColor = (coefficient: number): string => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8)
      return coefficient > 0 ? "bg-green-600 dark:bg-green-500" : "bg-red-600 dark:bg-red-500";
    if (abs >= 0.6)
      return coefficient > 0 ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600";
    if (abs >= 0.4)
      return coefficient > 0 ? "bg-green-400 dark:bg-green-700" : "bg-red-400 dark:bg-red-700";
    if (abs >= 0.2)
      return coefficient > 0 ? "bg-green-300 dark:bg-green-800" : "bg-red-300 dark:bg-red-800";
    return "bg-gray-300 dark:bg-gray-700";
  };

  // Get strength badge variant
  const getStrengthBadge = (strength: string) => {
    const config = {
      very_strong: { label: "Foarte puternică", variant: "default" as const },
      strong: { label: "Puternică", variant: "default" as const },
      moderate: { label: "Moderată", variant: "secondary" as const },
      weak: { label: "Slabă", variant: "secondary" as const },
      very_weak: { label: "Foarte slabă", variant: "outline" as const },
    };
    return config[strength as keyof typeof config] || config.weak;
  };

  // Get direction icon
  const getDirectionIcon = (direction: string) => {
    if (direction === "positive")
      return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (direction === "negative")
      return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Constatări Cheie
            </CardTitle>
            <CardDescription>Cele mai importante corelații identificate</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyFindings.map((finding, index) => (
                <li key={index} className="text-muted-foreground flex items-start gap-2 text-sm">
                  <div className="bg-primary/10 mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                  {finding}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Correlation List */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Matrice de Corelații</CardTitle>
          <CardDescription>
            Corelații statistice între variabilele sondajului (ordonate după forță)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCorrelations.length > 0 ? (
            <div className="space-y-3">
              {sortedCorrelations.map((correlation, index) => {
                const strengthBadge = getStrengthBadge(correlation.strength);
                const isSignificant = correlation.significant;

                return (
                  <div
                    key={index}
                    className={`border-border hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors ${
                      selectedCorrelation === correlation ? "bg-accent" : ""
                    }`}
                    onClick={() => setSelectedCorrelation(correlation)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {getDirectionIcon(correlation.direction)}
                          <h4 className="font-semibold">
                            {correlation.variables[0]} × {correlation.variables[1]}
                          </h4>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {correlation.interpretation}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={strengthBadge.variant}>{strengthBadge.label}</Badge>
                        {isSignificant && (
                          <Badge variant="default" className="bg-blue-500 dark:bg-blue-600">
                            Semnificativ
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Visual correlation bar */}
                    <div className="mb-2">
                      <div className="bg-muted h-4 overflow-hidden rounded-full">
                        <div
                          className={`h-full transition-all ${getCorrelationColor(correlation.coefficient)}`}
                          style={{
                            width: `${Math.abs(correlation.coefficient) * 100}%`,
                            marginLeft:
                              correlation.coefficient < 0
                                ? `${(1 - Math.abs(correlation.coefficient)) * 100}%`
                                : "0",
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>
                        <strong>r =</strong> {correlation.coefficient.toFixed(3)}
                      </span>
                      <span>
                        <strong>p =</strong> {correlation.pValue.toFixed(3)}
                      </span>
                      <span>
                        <strong>n =</strong> {correlation.sampleSize}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <div className="mb-2 text-lg">📊</div>
              Nu există date de corelație disponibile. Executați analiza pentru a genera corelații.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Recomandări</CardTitle>
            <CardDescription>Acțiuni sugerate pe baza corelațiilor identificate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="border-border flex items-start gap-3 rounded-lg border p-4"
                >
                  <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-muted-foreground text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed View (if correlation selected) */}
      {selectedCorrelation && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Detalii Corelație Selectată</CardTitle>
            <CardDescription>
              Informații statistice detaliate pentru corelația selectată
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Variables */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Variabile</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedCorrelation.variables[0]}</Badge>
                  <span className="text-muted-foreground">×</span>
                  <Badge variant="outline">{selectedCorrelation.variables[1]}</Badge>
                </div>
              </div>

              {/* Interpretation */}
              <div>
                <h4 className="mb-2 text-sm font-medium">Interpretare</h4>
                <p className="text-muted-foreground text-sm">
                  {selectedCorrelation.interpretation}
                </p>
              </div>

              {/* Statistical Details */}
              <div className="border-border grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Coeficient Pearson</p>
                  <p className="text-lg font-semibold">
                    {selectedCorrelation.coefficient.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Valoare p</p>
                  <p className="text-lg font-semibold">{selectedCorrelation.pValue.toFixed(3)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Mărime eșantion</p>
                  <p className="text-lg font-semibold">{selectedCorrelation.sampleSize}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Semnificație</p>
                  <p className="text-lg font-semibold">
                    {selectedCorrelation.significant ? "✅ p < 0.05" : "❌ p ≥ 0.05"}
                  </p>
                </div>
              </div>

              {/* Strength & Direction */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Forță</p>
                  <Badge variant={getStrengthBadge(selectedCorrelation.strength).variant}>
                    {getStrengthBadge(selectedCorrelation.strength).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Direcție</p>
                  <div className="flex items-center gap-1">
                    {getDirectionIcon(selectedCorrelation.direction)}
                    <span className="text-sm">
                      {selectedCorrelation.direction === "positive"
                        ? "Pozitivă"
                        : selectedCorrelation.direction === "negative"
                          ? "Negativă"
                          : "Neutră"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-muted dark:bg-muted/50 rounded-lg p-4">
                <h4 className="mb-2 text-sm font-medium">💬 Explicație</h4>
                <p className="text-muted-foreground text-xs">
                  <strong>Coeficientul de corelație Pearson (r)</strong> măsoară forța și direcția
                  relației liniare între două variabile. Valori apropiate de 1 sau -1 indică o
                  relație puternică, în timp ce valori apropiate de 0 indică o relație slabă sau
                  inexistentă.
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                  <strong>Valoarea p</strong> indică probabilitatea ca corelația observată să fie
                  întâmplătoare. Valori p &lt; 0.05 sunt considerate semnificative statistic.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistical Note */}
      <Card className="bg-muted/50 dark:bg-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
              <span className="text-xs font-bold">ℹ️</span>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">
                <strong>Notă metodologică:</strong> Corelațiile prezentate utilizează coeficientul
                Pearson pentru variabile continue și ordinale. Corelațiile semnificative (p &lt;
                0.05) indică relații care nu sunt probabil întâmplătoare, dar nu implică
                cauzalitate. Interpretarea necesită analiză contextual ă.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
