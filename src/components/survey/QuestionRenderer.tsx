"use client";

import type { SurveyQuestion, SurveyAnswer } from "@/types/survey";
import {
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  TextQuestion,
  RatingQuestion,
  ShortTextQuestion,
} from "./questions";

interface QuestionRendererProps {
  question: SurveyQuestion;
  answer?: SurveyAnswer;
  onChange: (answer: SurveyAnswer) => void;
}

export function QuestionRenderer({ question, answer, onChange }: QuestionRendererProps) {
  switch (question.question_type) {
    case "single_choice":
      return (
        <SingleChoiceQuestion question={question} value={answer?.answerText} onChange={onChange} />
      );

    case "multiple_choice":
      return (
        <MultipleChoiceQuestion
          question={question}
          value={answer?.answerChoices}
          onChange={onChange}
        />
      );

    case "text":
      return <TextQuestion question={question} value={answer?.answerText} onChange={onChange} />;

    case "rating":
      return (
        <RatingQuestion
          question={question}
          value={answer?.answerText ? parseInt(answer.answerText, 10) : undefined}
          onChange={onChange}
        />
      );

    case "short_text":
      return (
        <ShortTextQuestion question={question} value={answer?.answerText} onChange={onChange} />
      );

    default:
      return null;
  }
}
