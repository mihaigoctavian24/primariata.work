"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";

interface MultipleChoiceQuestionProps {
  question: SurveyQuestion;
  value?: string[];
  onChange: (answer: SurveyAnswer) => void;
}

export function MultipleChoiceQuestion({
  question,
  value = [],
  onChange,
}: MultipleChoiceQuestionProps) {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    let newChoices: string[];

    if (checked) {
      newChoices = [...value, option];
    } else {
      newChoices = value.filter((choice) => choice !== option);
    }

    onChange({
      questionId: question.id,
      questionType: "multiple_choice",
      answerChoices: newChoices,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">
          {question.question_number}. {question.question_text}
          {question.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      <div className="space-y-3">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox
              id={`${question.id}-${index}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
            />
            <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
