"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SurveyLayout } from "@/components/survey/SurveyLayout";
import { PersonalDataStep } from "@/components/survey/PersonalDataStep";
import { RespondentTypeStep } from "@/components/survey/RespondentTypeStep";
import { QuestionsStep } from "@/components/survey/QuestionsStep";
import { ReviewStep } from "@/components/survey/ReviewStep";
import { CompletionStep } from "@/components/survey/CompletionStep";
import { toast } from "sonner";
import type { PersonalDataForm, SurveyState, RespondentType, SurveyAnswer } from "@/types/survey";

const TOTAL_STEPS = 5; // Personal Data → Type Selection → Questions → Review → Complete

export default function SurveyStartPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyState, setSurveyState] = useState<Partial<SurveyState>>({
    personalData: null,
    respondentType: null,
    answers: {},
    currentStep: 1,
    totalSteps: TOTAL_STEPS,
    isCompleted: false,
    isDraft: true,
  });

  const handlePersonalDataSubmit = (data: PersonalDataForm) => {
    setSurveyState((prev) => ({
      ...prev,
      personalData: data,
      lastSavedAt: new Date(),
    }));

    // Move to next step (type selection)
    setCurrentStep(2);
  };

  const handleRespondentTypeSubmit = (type: RespondentType) => {
    setSurveyState((prev) => ({
      ...prev,
      respondentType: type,
      lastSavedAt: new Date(),
    }));

    // Move to next step (questions)
    setCurrentStep(3);
  };

  const handleQuestionsSubmit = (answers: Record<string, SurveyAnswer>) => {
    setSurveyState((prev) => ({
      ...prev,
      answers: answers,
      lastSavedAt: new Date(),
    }));

    // Move to next step (review)
    setCurrentStep(4);
  };

  const handleReviewSubmit = async () => {
    if (!surveyState.personalData || !surveyState.respondentType || !surveyState.answers) {
      toast.error("Date incomplete", {
        description: "Vă rugăm să completați toate pașii anteriori.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/survey/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalData: surveyState.personalData,
          respondentType: surveyState.respondentType,
          answers: surveyState.answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit survey");
      }

      // Update state with respondent ID and completion status
      setSurveyState((prev) => ({
        ...prev,
        respondentId: data.respondentId,
        isCompleted: true,
        isDraft: false,
        completedAt: new Date(),
      }));

      toast.success("Chestionar trimis cu succes!", {
        description: "Mulțumim pentru participare!",
      });

      // Move to completion step
      setCurrentStep(5);
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Eroare la trimiterea chestionarului", {
        description: error instanceof Error ? error.message : "Vă rugăm să încercați din nou.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFromReview = (step: number) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on first step, go back to landing page
      router.push("/survey");
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDataStep
            defaultValues={surveyState.personalData || undefined}
            onSubmit={handlePersonalDataSubmit}
            onBack={handleBack}
          />
        );

      case 2:
        return (
          <RespondentTypeStep
            defaultValue={surveyState.respondentType || undefined}
            onSubmit={handleRespondentTypeSubmit}
            onBack={handleBack}
          />
        );

      case 3:
        return surveyState.respondentType ? (
          <QuestionsStep
            respondentType={surveyState.respondentType}
            defaultAnswers={surveyState.answers}
            onSubmit={handleQuestionsSubmit}
            onBack={handleBack}
          />
        ) : (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">Please select respondent type first</p>
          </div>
        );

      case 4:
        return surveyState.personalData && surveyState.respondentType && surveyState.answers ? (
          <ReviewStep
            personalData={surveyState.personalData}
            respondentType={surveyState.respondentType}
            answers={surveyState.answers}
            onEdit={handleEditFromReview}
            onSubmit={handleReviewSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold">Error</h1>
            <p className="text-muted-foreground">Please complete all previous steps first</p>
          </div>
        );

      case 5:
        return <CompletionStep respondentId={surveyState.respondentId} />;

      default:
        return (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold">Step {currentStep}</h1>
            <p className="text-muted-foreground">Coming soon</p>
          </div>
        );
    }
  };

  return (
    <SurveyLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onBack={handleBack}
      showBackButton={currentStep !== 5}
    >
      {renderStep()}
    </SurveyLayout>
  );
}
