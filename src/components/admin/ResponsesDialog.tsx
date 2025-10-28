"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuestions } from "@/data/questions";
import type { RespondentType, SurveyQuestion } from "@/types/survey";

interface Response {
  id: string;
  question_id: string;
  question_type: string;
  answer_text: string | null;
  answer_choices: string[] | null;
  answer_rating: number | null;
}

interface ResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  respondent: {
    id: string;
    first_name: string;
    last_name: string;
    respondent_type: RespondentType;
    county: string;
    locality: string;
  };
}

export function ResponsesDialog({ open, onOpenChange, respondent }: ResponsesDialogProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/survey/responses/${respondent.id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponses(data || []);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }, [respondent.id]);

  useEffect(() => {
    if (open && respondent.id) {
      fetchResponses();
    }
  }, [open, respondent.id, fetchResponses]);

  // Get questions for this respondent type
  const questions = getQuestions(respondent.respondent_type);

  // Create a map of question ID to question data
  const questionMap = new Map<string, SurveyQuestion>();
  questions.forEach((q) => questionMap.set(q.id, q));

  // Create a map of question ID to response
  const responseMap = new Map<string, Response>();
  responses.forEach((r) => responseMap.set(r.question_id, r));

  const renderAnswer = (question: SurveyQuestion, response: Response | undefined) => {
    if (!response) {
      return <span className="text-muted-foreground italic">Fără răspuns</span>;
    }

    switch (response.question_type) {
      case "single_choice":
        return (
          <Badge variant="secondary" className="font-normal">
            {response.answer_choices?.[0] || "-"}
          </Badge>
        );

      case "multiple_choice":
        return (
          <div className="flex flex-wrap gap-2">
            {response.answer_choices?.map((choice, idx) => (
              <Badge key={idx} variant="secondary" className="font-normal">
                {choice}
              </Badge>
            )) || <span className="text-muted-foreground">-</span>}
          </div>
        );

      case "rating":
        return (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= (response.answer_rating || 0) ? "text-yellow-500" : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-muted-foreground text-sm">({response.answer_rating || 0}/5)</span>
          </div>
        );

      case "text":
      case "short_text":
        return (
          <p className="text-sm whitespace-pre-wrap">
            {response.answer_text || <span className="text-muted-foreground">-</span>}
          </p>
        );

      default:
        return <span className="text-muted-foreground">-</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col p-0">
        <DialogHeader className="bg-background sticky top-0 z-10 border-b px-6 py-4">
          <DialogTitle>
            Răspunsuri Survey - {respondent.first_name} {respondent.last_name}
          </DialogTitle>
          <DialogDescription>
            {respondent.locality}, {respondent.county} •{" "}
            <Badge variant={respondent.respondent_type === "citizen" ? "default" : "secondary"}>
              {respondent.respondent_type === "citizen" ? "Cetățean" : "Funcționar"}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </>
          ) : (
            // Actual responses
            questions.map((question, index) => {
              const response = responseMap.get(question.id);
              return (
                <div key={question.id} className="border-border bg-card rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <h3 className="text-sm font-medium">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {question.question_text}
                    </h3>
                    {question.is_required && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Obligatoriu
                      </Badge>
                    )}
                  </div>
                  <div className="pl-6">{renderAnswer(question, response)}</div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
