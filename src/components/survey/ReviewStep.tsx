"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQuestions } from "@/data/questions";
import type {
  PersonalDataForm,
  RespondentType,
  SurveyAnswer,
  SurveyQuestion,
} from "@/types/survey";
import { Pencil, User, UserCircle, Mail, Calendar, MapPin } from "lucide-react";

interface ReviewStepProps {
  personalData: PersonalDataForm;
  respondentType: RespondentType;
  answers: Record<string, SurveyAnswer>;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

export function ReviewStep({
  personalData,
  respondentType,
  answers,
  onEdit,
  onSubmit,
  onBack,
  isSubmitting = false,
}: ReviewStepProps) {
  const questions = getQuestions(respondentType);

  const getAnswerDisplay = (question: SurveyQuestion, answer: SurveyAnswer | undefined) => {
    if (!answer) return <span className="text-muted-foreground italic">Fără răspuns</span>;

    switch (question.questionType) {
      case "single_choice":
      case "short_text":
      case "text":
        return (
          answer.answerText || <span className="text-muted-foreground italic">Fără răspuns</span>
        );

      case "multiple_choice":
        return answer.answerChoices && answer.answerChoices.length > 0 ? (
          <ul className="list-inside list-disc space-y-1">
            {answer.answerChoices.map((choice, idx) => (
              <li key={idx}>{choice}</li>
            ))}
          </ul>
        ) : (
          <span className="text-muted-foreground italic">Fără răspuns</span>
        );

      case "rating":
        const rating = answer.answerText ? parseInt(answer.answerText, 10) : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold">{rating}/5 stele</span>
            <span className="text-muted-foreground">
              {rating === 1 && "(Deloc utilă)"}
              {rating === 2 && "(Puțin utilă)"}
              {rating === 3 && "(Moderat utilă)"}
              {rating === 4 && "(Utilă)"}
              {rating === 5 && "(Foarte utilă)"}
            </span>
          </div>
        );

      default:
        return <span className="text-muted-foreground italic">Fără răspuns</span>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Verifică răspunsurile</h1>
        <p className="text-muted-foreground">
          Revizuiește informațiile tale înainte de a trimite chestionarul
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Data Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Date personale
                </CardTitle>
                <CardDescription>Informațiile tale de contact și locație</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifică
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <UserCircle className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Nume complet:</span>
                <span>
                  {personalData.firstName} {personalData.lastName}
                </span>
              </div>
              {personalData.email && (
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span>{personalData.email}</span>
                </div>
              )}
              {personalData.ageCategory && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Vârstă:</span>
                  <span>{personalData.ageCategory}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Locație:</span>
                <span>
                  {personalData.locality}, {personalData.county}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respondent Type Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tip respondent</CardTitle>
                <CardDescription>Categoria selectată pentru chestionar</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifică
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Badge
              variant={respondentType === "citizen" ? "default" : "secondary"}
              className="px-3 py-1 text-base"
            >
              {respondentType === "citizen" ? "Cetățean" : "Funcționar public"}
            </Badge>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Răspunsuri la întrebări</CardTitle>
                <CardDescription>
                  {questions.filter((q) => answers[q.id]).length} din {questions.length} întrebări
                  completate
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifică
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <p className="mb-2 font-medium">
                  {question.questionNumber}. {question.questionText}
                  {question.isRequired && <span className="text-destructive ml-1">*</span>}
                </p>
                <div className="text-foreground pl-4">
                  {getAnswerDisplay(question, answers[question.id])}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            Înapoi
          </Button>
        )}
        <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Se trimite..." : "Trimite chestionarul"}
        </Button>
      </div>
    </div>
  );
}
