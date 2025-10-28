"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";

interface TextQuestionProps {
  question: SurveyQuestion;
  value?: string;
  onChange: (answer: SurveyAnswer) => void;
}

export function TextQuestion({ question, value = "", onChange }: TextQuestionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      questionId: question.id,
      questionType: "text",
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

      <Textarea
        id={question.id}
        value={value}
        onChange={handleChange}
        placeholder="Scrie răspunsul tău aici..."
        rows={6}
        className="resize-y"
      />
    </div>
  );
}
