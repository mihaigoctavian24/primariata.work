import type { SurveyQuestion, RespondentType } from "@/types/survey";

export const citizenQuestions: SurveyQuestion[] = [
  {
    id: "q1_frequency",
    surveyType: "citizen",
    questionNumber: 1,
    questionText:
      "Cât de des ai nevoie să interacționezi cu primăria (pentru cereri, documente, taxe etc.)?",
    questionType: "single_choice",
    options: ["Lunar", "O dată la câteva luni", "O dată pe an", "Foarte rar"],
    isRequired: true,
  },
  {
    id: "q2_online_usage",
    surveyType: "citizen",
    questionNumber: 2,
    questionText: "Ai folosit până acum o platformă online a primăriei tale?",
    questionType: "single_choice",
    options: ["Da, frecvent", "Da, dar a fost dificil de folosit", "Nu, niciodată"],
    isRequired: true,
  },
  {
    id: "q3_problems",
    surveyType: "citizen",
    questionNumber: 3,
    questionText: "Ce probleme întâmpini de obicei când ai nevoie de un serviciu al primăriei?",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q4_features",
    surveyType: "citizen",
    questionNumber: 4,
    questionText: "Ai folosi o aplicație web care ți-ar permite să:",
    questionType: "multiple_choice",
    options: [
      "Depui cereri și documente online",
      "Urmărești statusul cererilor trimise",
      "Primești notificări despre taxe, termene și programări",
      "Soliciți documente (adeverințe, autorizații etc.) fără deplasare la ghișeu",
      "Comunici direct cu funcționarii",
    ],
    isRequired: true,
  },
  {
    id: "q5_most_useful",
    surveyType: "citizen",
    questionNumber: 5,
    questionText: "Ce funcționalitate ți s-ar părea cea mai utilă într-o astfel de aplicație?",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q6_concerns",
    surveyType: "citizen",
    questionNumber: 6,
    questionText: "Ce te-ar face să nu folosești o astfel de aplicație?",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q7_identity",
    surveyType: "citizen",
    questionNumber: 7,
    questionText:
      "Ai încredere să îți creezi un cont folosind CNP-ul sau identitatea digitală (de exemplu, ghiseul.ro, eID)?",
    questionType: "single_choice",
    options: [
      "Da, dacă este securizată",
      "Da, indiferent",
      "Nu, prefer ceva mai anonim",
      "Nu știu / am rețineri",
    ],
    isRequired: true,
  },
  {
    id: "q8_usefulness",
    surveyType: "citizen",
    questionNumber: 8,
    questionText:
      "Pe o scară de la 1 la 5, cât de utilă ți s-ar părea o primărie complet digitală?",
    questionType: "rating",
    isRequired: true,
  },
  {
    id: "q9_recommend",
    surveyType: "citizen",
    questionNumber: 9,
    questionText: "Dacă aplicația ar fi gratuită și ușor de folosit, ai recomanda-o altora?",
    questionType: "single_choice",
    options: ["Da", "Poate", "Nu"],
    isRequired: true,
  },
  {
    id: "q10_suggestions",
    surveyType: "citizen",
    questionNumber: 10,
    questionText: "Ai alte sugestii sau idei legate de cum ar trebui să arate o primărie digitală?",
    questionType: "text",
    isRequired: false,
  },
];

export const officialQuestions: SurveyQuestion[] = [
  {
    id: "q1_department",
    surveyType: "official",
    questionNumber: 1,
    questionText: "În ce departament activați?",
    questionType: "short_text",
    isRequired: true,
  },
  {
    id: "q2_citizen_interaction",
    surveyType: "official",
    questionNumber: 2,
    questionText:
      "Cât de des interacționați cu cetățenii în mod direct (la ghișeu, telefon sau e-mail)?",
    questionType: "single_choice",
    options: ["Zilnic", "De câteva ori pe săptămână", "Rar", "Deloc"],
    isRequired: true,
  },
  {
    id: "q3_time_consuming",
    surveyType: "official",
    questionNumber: 3,
    questionText: "Ce activități din cadrul biroului dumneavoastră vă ocupă cel mai mult timp?",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q4_difficulties",
    surveyType: "official",
    questionNumber: 4,
    questionText:
      "Ce dificultăți întâmpinați în gestionarea documentelor sau a cererilor depuse de cetățeni?",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q5_it_usage",
    surveyType: "official",
    questionNumber: 5,
    questionText:
      "Ați utilizat până acum aplicații sau sisteme informatice pentru activitatea de birou (ex: registratură electronică, CRM, platforme e-guvernare)?",
    questionType: "single_choice",
    options: ["Da, frecvent", "Da, ocazional", "Nu"],
    isRequired: true,
  },
  {
    id: "q6_manual_errors",
    surveyType: "official",
    questionNumber: 6,
    questionText:
      "Cât de des apar erori sau întârzieri din cauza fluxurilor manuale (documente pe hârtie, lipsa semnăturilor, pierderea trasabilității etc.)?",
    questionType: "single_choice",
    options: ["Foarte des", "Uneori", "Rar", "Niciodată"],
    isRequired: true,
  },
  {
    id: "q7_digitalization_improvement",
    surveyType: "official",
    questionNumber: 7,
    questionText:
      "Considerați că digitalizarea ar putea îmbunătăți modul de lucru din instituția dumneavoastră?",
    questionType: "single_choice",
    options: ["Da, semnificativ", "Parțial", "Nu sunt sigur(ă)", "Nu"],
    isRequired: true,
  },
  {
    id: "q8_useful_features",
    surveyType: "official",
    questionNumber: 8,
    questionText:
      "Ce funcționalități ați considera cele mai utile într-o aplicație de primărie digitală?",
    questionType: "multiple_choice",
    options: [
      "Gestionarea electronică a cererilor și documentelor",
      "Generarea automată de formulare și răspunsuri",
      "Urmărirea în timp real a statusului cererilor",
      "Comunicarea internă între birouri",
      "Notificări automate și rapoarte de activitate",
    ],
    isRequired: true,
  },
  {
    id: "q9_concerns",
    surveyType: "official",
    questionNumber: 9,
    questionText: "Ce preocupări aveți în legătură cu o astfel de platformă digitală?",
    questionType: "multiple_choice",
    options: [
      "Securitatea și protecția datelor",
      "Lipsa instruirii personalului",
      "Timpul necesar pentru învățare și adaptare",
      "Stabilitatea tehnică a sistemului",
      "Costurile de implementare",
      "Alt motiv",
    ],
    isRequired: true,
  },
  {
    id: "q9b_concerns_other",
    surveyType: "official",
    questionNumber: 9,
    questionText: "Dacă ați selectat 'Alt motiv', vă rugăm să specificați:",
    questionType: "text",
    isRequired: false,
  },
  {
    id: "q10_readiness",
    surveyType: "official",
    questionNumber: 10,
    questionText:
      "Pe o scară de la 1 la 5, cât de pregătită considerați că este instituția pentru digitalizare?",
    questionType: "rating",
    isRequired: true,
  },
  {
    id: "q11_training",
    surveyType: "official",
    questionNumber: 11,
    questionText:
      "Ați fi dispus(ă) să participați la un program scurt de instruire pentru utilizarea platformei digitale?",
    questionType: "single_choice",
    options: ["Da", "Poate", "Nu"],
    isRequired: true,
  },
  {
    id: "q12_suggestions",
    surveyType: "official",
    questionNumber: 12,
    questionText: "Alte sugestii sau observații privind digitalizarea activității administrative:",
    questionType: "text",
    isRequired: false,
  },
];

export function getQuestions(respondentType: RespondentType): SurveyQuestion[] {
  return respondentType === "citizen" ? citizenQuestions : officialQuestions;
}
