"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Building2, BarChart3 } from "lucide-react";

interface LocationData {
  county: string;
  locality: string;
  count: number;
  citizenCount: number;
  officialCount: number;
}

interface DemographicsChartsProps {
  locationData?: LocationData[];
  totalCitizens: number;
  totalOfficials: number;
}

/**
 * Demographics Charts Component
 *
 * Displays geographic distribution and demographic breakdowns
 * - County distribution map
 * - Top localities chart
 * - Citizen vs Official split
 */
export function DemographicsCharts({
  locationData = [],
  totalCitizens,
  totalOfficials,
}: DemographicsChartsProps) {
  // Aggregate by county
  const countyMap = locationData.reduce(
    (acc, loc) => {
      if (!acc[loc.county]) {
        acc[loc.county] = {
          count: 0,
          citizenCount: 0,
          officialCount: 0,
          localities: new Set<string>(),
        };
      }
      const county = acc[loc.county];
      if (county) {
        county.count += loc.count;
        county.citizenCount += loc.citizenCount;
        county.officialCount += loc.officialCount;
        county.localities.add(loc.locality);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        citizenCount: number;
        officialCount: number;
        localities: Set<string>;
      }
    >
  );

  const countyData = Object.entries(countyMap)
    .map(([county, data]) => ({
      county,
      count: data.count,
      citizenCount: data.citizenCount,
      officialCount: data.officialCount,
      localityCount: data.localities.size,
    }))
    .sort((a, b) => b.count - a.count);

  // Top localities
  const topLocalities = locationData.sort((a, b) => b.count - a.count).slice(0, 10);

  // Calculate max for scaling bars
  const maxCounty = Math.max(...countyData.map((d) => d.count), 1);
  const maxLocality = Math.max(...topLocalities.map((d) => d.count), 1);

  const total = totalCitizens + totalOfficials;
  const citizenPercentage = total > 0 ? (totalCitizens / total) * 100 : 0;
  const officialPercentage = total > 0 ? (totalOfficials / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Respondent Type Split */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribuție Respondenți
          </CardTitle>
          <CardDescription>Raportul dintre cetățeni și funcționari publici</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Citizens */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Cetățeni</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {totalCitizens} ({citizenPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-blue-500 dark:bg-blue-600"
                  style={{ width: `${citizenPercentage}%` }}
                />
              </div>
            </div>

            {/* Officials */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">Funcționari Publici</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {totalOfficials} ({officialPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-green-500 dark:bg-green-600"
                  style={{ width: `${officialPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* County Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Distribuție Județe
          </CardTitle>
          <CardDescription>
            Răspunsuri per județ ({countyData.length} {countyData.length === 1 ? "județ" : "județe"}
            )
          </CardDescription>
        </CardHeader>
        <CardContent>
          {countyData.length > 0 ? (
            <div className="space-y-3">
              {countyData.map((county, index) => (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{county.county}</span>
                      <Badge variant="outline" className="text-xs">
                        {county.localityCount}{" "}
                        {county.localityCount === 1 ? "localitate" : "localități"}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {county.count} ({((county.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600"
                      style={{ width: `${(county.count / maxCounty) * 100}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 flex gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {county.citizenCount} cetățeni
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {county.officialCount} funcționari
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <MapPin className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
              <p>Nu există date geografice disponibile</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Localities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top 10 Localități
          </CardTitle>
          <CardDescription>Localitățile cu cele mai multe răspunsuri</CardDescription>
        </CardHeader>
        <CardContent>
          {topLocalities.length > 0 ? (
            <div className="space-y-3">
              {topLocalities.map((locality, index) => (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">
                        {locality.locality}, {locality.county}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {locality.count} ({((locality.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${(locality.count / maxLocality) * 100}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground mt-1 flex gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      {locality.citizenCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                      {locality.officialCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              <BarChart3 className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
              <p>Nu există date despre localități</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
