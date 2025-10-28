"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";

interface ShortTextQuestionProps {
  question: SurveyQuestion;
  value?: string;
  onChange: (answer: SurveyAnswer) => void;
}

export function ShortTextQuestion({ question, value = "", onChange }: ShortTextQuestionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      questionId: question.id,
      questionType: "short_text",
      answerText: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={question.id} className="text-base font-medium">
          {question.question_number}. {question.question_text}
          {question.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      <Input
        id={question.id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Răspunsul tău..."
        className="w-full"
      />
    </div>
  );
}
