"use client";

import { useState } from "react";
import { Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/animated-card";
import type { RespondentType } from "@/types/survey";

interface RespondentTypeStepProps {
  defaultValue?: RespondentType;
  onSubmit: (type: RespondentType) => void;
  onBack?: () => void;
}

export function RespondentTypeStep({ defaultValue, onSubmit, onBack }: RespondentTypeStepProps) {
  const [selectedType, setSelectedType] = useState<RespondentType | null>(defaultValue || null);

  const handleSubmit = () => {
    if (selectedType) {
      onSubmit(selectedType);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Selectează categoria</h1>
        <p className="text-muted-foreground">
          Alege categoria care te descrie cel mai bine. Chestionarul se va adapta în funcție de
          alegerea ta.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Citizen Card */}
        <AnimatedCard
          delay={0.1}
          className={`cursor-pointer border-2 p-6 transition-all hover:shadow-lg ${
            selectedType === "citizen"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => setSelectedType("citizen")}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                selectedType === "citizen" ? "bg-primary/20" : "bg-primary/10"
              }`}
            >
              <Users
                className={`h-10 w-10 ${selectedType === "citizen" ? "text-primary" : "text-primary/70"}`}
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Cetățean</h3>
            <p className="text-muted-foreground text-sm">
              Sunt cetățean și vreau să împărtășesc experiența mea cu serviciile publice digitale.
            </p>
          </div>
        </AnimatedCard>

        {/* Official Card */}
        <AnimatedCard
          delay={0.2}
          className={`cursor-pointer border-2 p-6 transition-all hover:shadow-lg ${
            selectedType === "official"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => setSelectedType("official")}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                selectedType === "official" ? "bg-primary/20" : "bg-primary/10"
              }`}
            >
              <Building2
                className={`h-10 w-10 ${selectedType === "official" ? "text-primary" : "text-primary/70"}`}
              />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Funcționar public</h3>
            <p className="text-muted-foreground text-sm">
              Lucrez în administrația publică și vreau să contribui cu perspectiva mea profesională.
            </p>
          </div>
        </AnimatedCard>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Înapoi
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!selectedType} className="flex-1">
          Continuă
        </Button>
      </div>
    </div>
  );
}
