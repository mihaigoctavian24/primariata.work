"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/survey/AnimatedLogo";

interface SurveyLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function SurveyLayout({
  children,
  currentStep,
  totalSteps,
  onBack,
  showBackButton = true,
}: SurveyLayoutProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo */}
          <Link href="/survey" className="hover:opacity-80">
            <AnimatedLogo />
          </Link>

          {/* Right: Theme + Back */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {showBackButton && onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Înapoi</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="container mx-auto">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Pasul {currentStep} din {totalSteps}
              </span>
              <span className="text-muted-foreground font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-border/50 border-t py-6 text-center">
        <p className="text-muted-foreground text-sm">
          🔒 Datele tale sunt protejate și confidențiale
        </p>
      </footer>
    </div>
  );
}
