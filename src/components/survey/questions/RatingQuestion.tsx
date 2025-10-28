"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";

interface RatingQuestionProps {
  question: SurveyQuestion;
  value?: number;
  onChange: (answer: SurveyAnswer) => void;
}

export function RatingQuestion({ question, value, onChange }: RatingQuestionProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(value);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    onChange({
      questionId: question.id,
      questionType: "rating",
      answerText: rating.toString(),
    });
  };

  const ratingLabels = ["Deloc utilă", "Puțin utilă", "Moderat utilă", "Utilă", "Foarte utilă"];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">
          {question.question_number}. {question.question_text}
          {question.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleStarClick(rating)}
              onMouseEnter={() => setHoveredStar(rating)}
              onMouseLeave={() => setHoveredStar(null)}
              className="focus:ring-primary rounded transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
              aria-label={`${rating} ${rating === 1 ? "stea" : "stele"}`}
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  (hoveredStar !== null && rating <= hoveredStar) ||
                  (hoveredStar === null && selectedRating && rating <= selectedRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {selectedRating && (
          <p className="text-muted-foreground text-sm">
            {selectedRating} {selectedRating === 1 ? "stea" : "stele"} -{" "}
            {ratingLabels[selectedRating - 1]}
          </p>
        )}
      </div>
    </div>
  );
}
