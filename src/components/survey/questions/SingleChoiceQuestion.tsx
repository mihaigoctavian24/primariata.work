"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";

interface SingleChoiceQuestionProps {
  question: SurveyQuestion;
  value?: string;
  onChange: (answer: SurveyAnswer) => void;
}

export function SingleChoiceQuestion({ question, value, onChange }: SingleChoiceQuestionProps) {
  const handleValueChange = (selectedValue: string) => {
    onChange({
      questionId: question.id,
      questionType: "single_choice",
      answerText: selectedValue,
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

      <RadioGroup value={value} onValueChange={handleValueChange} className="space-y-3">
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-3">
            <RadioGroupItem value={option} id={`${question.id}-${index}`} />
            <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer font-normal">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
