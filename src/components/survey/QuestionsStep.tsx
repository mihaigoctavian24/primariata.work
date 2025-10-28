"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "./QuestionRenderer";
import { getQuestions } from "@/data/questions";
import type { RespondentType, SurveyAnswer } from "@/types/survey";

interface QuestionsStepProps {
  respondentType: RespondentType;
  defaultAnswers?: Record<string, SurveyAnswer>;
  onSubmit: (answers: Record<string, SurveyAnswer>) => void;
  onBack?: () => void;
}

export function QuestionsStep({
  respondentType,
  defaultAnswers = {},
  onSubmit,
  onBack,
}: QuestionsStepProps) {
  const questions = getQuestions(respondentType);
  const [answers, setAnswers] = useState<Record<string, SurveyAnswer>>(defaultAnswers);

  useEffect(() => {
    setAnswers(defaultAnswers);
  }, [defaultAnswers]);

  const handleAnswerChange = (answer: SurveyAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [answer.questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // Check if all required questions are answered
  const requiredQuestions = questions.filter((q) => q.isRequired);
  const allRequiredAnswered = requiredQuestions.every((q) => {
    const answer = answers[q.id];
    if (!answer) return false;

    // For multiple choice, check if at least one choice is selected
    if (q.questionType === "multiple_choice") {
      return answer.answerChoices && answer.answerChoices.length > 0;
    }

    // For other types, check if answerText exists and is not empty
    return answer.answerText && answer.answerText.trim().length > 0;
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Întrebări</h1>
        <p className="text-muted-foreground">
          Răspunde la următoarele întrebări. Câmpurile marcate cu * sunt obligatorii.
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <QuestionRenderer
              question={question}
              answer={answers[question.id]}
              onChange={handleAnswerChange}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Înapoi
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!allRequiredAnswered} className="flex-1">
          Continuă
        </Button>
      </div>

      {!allRequiredAnswered && (
        <p className="text-destructive mt-4 text-center text-sm">
          Vă rugăm să răspundeți la toate întrebările obligatorii (marcate cu *)
        </p>
      )}
    </div>
  );
}
