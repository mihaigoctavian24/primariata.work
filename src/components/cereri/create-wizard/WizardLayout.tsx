"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardStep } from "@/types/wizard";
import { Progress } from "@/components/ui/progress";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface WizardLayoutProps {
  currentStep: WizardStep;
  children: React.ReactNode;
  onStepClick?: (step: WizardStep) => void;
}

const STEPS = [
  {
    step: WizardStep.SELECT_TYPE,
    title: "Tip cerere",
    description: "Selectează tipul",
  },
  {
    step: WizardStep.FILL_DETAILS,
    title: "Detalii",
    description: "Completează formularul",
  },
  {
    step: WizardStep.UPLOAD_DOCUMENTS,
    title: "Documente",
    description: "Încarcă fișierele",
  },
  {
    step: WizardStep.REVIEW_SUBMIT,
    title: "Revizuire",
    description: "Verifică și trimite",
  },
];

export function WizardLayout({ currentStep, children, onStepClick }: WizardLayoutProps) {
  const router = useRouter();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Static header - Progress indicator */}
      <div className="bg-background sticky top-0 z-10 flex-shrink-0 border-b">
        <div className="container mx-auto max-w-5xl space-y-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Cerere nouă</h1>

            <div className="flex items-center gap-6">
              {/* Back Button */}
              <motion.button
                onClick={() => router.back()}
                onMouseEnter={() => setIsBackHovered(true)}
                onMouseLeave={() => setIsBackHovered(false)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
              >
                <motion.div
                  animate={{ x: isBackHovered ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </motion.div>
                Înapoi
              </motion.button>

              <p className="text-muted-foreground text-sm">
                Pasul {currentStep + 1} din {STEPS.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-4">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.step;
              const isCurrent = currentStep === step.step;
              const isPending = currentStep < step.step;
              const isClickable = isCompleted || isCurrent;

              const handleStepClick = () => {
                if (isClickable && onStepClick) {
                  onStepClick(step.step);
                }
              };

              return (
                <div
                  key={step.step}
                  className={`relative ${
                    index < STEPS.length - 1
                      ? "after:absolute after:top-5 after:left-1/2 after:-z-10 after:h-0.5 after:w-full"
                      : ""
                  } ${isCompleted ? "after:bg-primary" : "after:bg-muted"}`}
                >
                  <button
                    onClick={handleStepClick}
                    disabled={!isClickable}
                    aria-label={`${step.title}: ${step.description}`}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex w-full flex-col items-center text-center transition-transform ${
                      isClickable
                        ? "focus:ring-primary cursor-pointer hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {/* Step circle */}
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary text-primary bg-background"
                            : "border-muted text-muted-foreground bg-background"
                      } ${isClickable ? "group-hover:shadow-md" : ""}`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>

                    {/* Step label */}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-foreground"
                            : isPending
                              ? "text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-muted-foreground hidden text-xs sm:block">
                        {step.description}
                      </p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-5xl py-8">
          <div className="bg-card rounded-lg border p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
