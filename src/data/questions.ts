import type { SurveyQuestion, RespondentType } from "@/types/survey";

export const citizenQuestions: SurveyQuestion[] = [
  {
    id: "q1_frequency",
    survey_type: "citizen",
    question_number: 1,
    question_text:
      "Cât de des ai nevoie să interacționezi cu primăria (pentru cereri, documente, taxe etc.)?",
    question_type: "single_choice",
    options: ["Lunar", "O dată la câteva luni", "O dată pe an", "Foarte rar"],
    is_required: true,
  },
  {
    id: "q2_online_usage",
    survey_type: "citizen",
    question_number: 2,
    question_text: "Ai folosit până acum o platformă online a primăriei tale?",
    question_type: "single_choice",
    options: ["Da, frecvent", "Da, dar a fost dificil de folosit", "Nu, niciodată"],
    is_required: true,
  },
  {
    id: "q3_problems",
    survey_type: "citizen",
    question_number: 3,
    question_text: "Ce probleme întâmpini de obicei când ai nevoie de un serviciu al primăriei?",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q4_features",
    survey_type: "citizen",
    question_number: 4,
    question_text: "Ai folosi o aplicație web care ți-ar permite să:",
    question_type: "multiple_choice",
    options: [
      "Depui cereri și documente online",
      "Urmărești statusul cererilor trimise",
      "Primești notificări despre taxe, termene și programări",
      "Soliciți documente (adeverințe, autorizații etc.) fără deplasare la ghișeu",
      "Comunici direct cu funcționarii",
    ],
    is_required: true,
  },
  {
    id: "q5_most_useful",
    survey_type: "citizen",
    question_number: 5,
    question_text: "Ce funcționalitate ți s-ar părea cea mai utilă într-o astfel de aplicație?",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q6_concerns",
    survey_type: "citizen",
    question_number: 6,
    question_text: "Ce te-ar face să nu folosești o astfel de aplicație?",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q7_identity",
    survey_type: "citizen",
    question_number: 7,
    question_text:
      "Ai încredere să îți creezi un cont folosind CNP-ul sau identitatea digitală (de exemplu, ghiseul.ro, eID)?",
    question_type: "single_choice",
    options: [
      "Da, dacă este securizată",
      "Da, indiferent",
      "Nu, prefer ceva mai anonim",
      "Nu știu / am rețineri",
    ],
    is_required: true,
  },
  {
    id: "q8_usefulness",
    survey_type: "citizen",
    question_number: 8,
    question_text:
      "Pe o scară de la 1 la 5, cât de utilă ți s-ar părea o primărie complet digitală?",
    question_type: "rating",
    is_required: true,
  },
  {
    id: "q9_recommend",
    survey_type: "citizen",
    question_number: 9,
    question_text: "Dacă aplicația ar fi gratuită și ușor de folosit, ai recomanda-o altora?",
    question_type: "single_choice",
    options: ["Da", "Poate", "Nu"],
    is_required: true,
  },
  {
    id: "q10_suggestions",
    survey_type: "citizen",
    question_number: 10,
    question_text:
      "Ai alte sugestii sau idei legate de cum ar trebui să arate o primărie digitală?",
    question_type: "text",
    is_required: false,
  },
];

export const officialQuestions: SurveyQuestion[] = [
  {
    id: "q1_department",
    survey_type: "official",
    question_number: 1,
    question_text: "În ce departament activați?",
    question_type: "short_text",
    is_required: true,
  },
  {
    id: "q2_citizen_interaction",
    survey_type: "official",
    question_number: 2,
    question_text:
      "Cât de des interacționați cu cetățenii în mod direct (la ghișeu, telefon sau e-mail)?",
    question_type: "single_choice",
    options: ["Zilnic", "De câteva ori pe săptămână", "Rar", "Deloc"],
    is_required: true,
  },
  {
    id: "q3_time_consuming",
    survey_type: "official",
    question_number: 3,
    question_text: "Ce activități din cadrul biroului dumneavoastră vă ocupă cel mai mult timp?",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q4_difficulties",
    survey_type: "official",
    question_number: 4,
    question_text:
      "Ce dificultăți întâmpinați în gestionarea documentelor sau a cererilor depuse de cetățeni?",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q5_it_usage",
    survey_type: "official",
    question_number: 5,
    question_text:
      "Ați utilizat până acum aplicații sau sisteme informatice pentru activitatea de birou (ex: registratură electronică, CRM, platforme e-guvernare)?",
    question_type: "single_choice",
    options: ["Da, frecvent", "Da, ocazional", "Nu"],
    is_required: true,
  },
  {
    id: "q6_manual_errors",
    survey_type: "official",
    question_number: 6,
    question_text:
      "Cât de des apar erori sau întârzieri din cauza fluxurilor manuale (documente pe hârtie, lipsa semnăturilor, pierderea trasabilității etc.)?",
    question_type: "single_choice",
    options: ["Foarte des", "Uneori", "Rar", "Niciodată"],
    is_required: true,
  },
  {
    id: "q7_digitalization_improvement",
    survey_type: "official",
    question_number: 7,
    question_text:
      "Considerați că digitalizarea ar putea îmbunătăți modul de lucru din instituția dumneavoastră?",
    question_type: "single_choice",
    options: ["Da, semnificativ", "Parțial", "Nu sunt sigur(ă)", "Nu"],
    is_required: true,
  },
  {
    id: "q8_useful_features",
    survey_type: "official",
    question_number: 8,
    question_text:
      "Ce funcționalități ați considera cele mai utile într-o aplicație de primărie digitală?",
    question_type: "multiple_choice",
    options: [
      "Gestionarea electronică a cererilor și documentelor",
      "Generarea automată de formulare și răspunsuri",
      "Urmărirea în timp real a statusului cererilor",
      "Comunicarea internă între birouri",
      "Notificări automate și rapoarte de activitate",
    ],
    is_required: true,
  },
  {
    id: "q9_concerns",
    survey_type: "official",
    question_number: 9,
    question_text: "Ce preocupări aveți în legătură cu o astfel de platformă digitală?",
    question_type: "multiple_choice",
    options: [
      "Securitatea și protecția datelor",
      "Lipsa instruirii personalului",
      "Timpul necesar pentru învățare și adaptare",
      "Stabilitatea tehnică a sistemului",
      "Costurile de implementare",
      "Alt motiv",
    ],
    is_required: true,
  },
  {
    id: "q9b_concerns_other",
    survey_type: "official",
    question_number: 9,
    question_text: "Dacă ați selectat 'Alt motiv', vă rugăm să specificați:",
    question_type: "text",
    is_required: false,
  },
  {
    id: "q10_readiness",
    survey_type: "official",
    question_number: 10,
    question_text:
      "Pe o scară de la 1 la 5, cât de pregătită considerați că este instituția pentru digitalizare?",
    question_type: "rating",
    is_required: true,
  },
  {
    id: "q11_training",
    survey_type: "official",
    question_number: 11,
    question_text:
      "Ați fi dispus(ă) să participați la un program scurt de instruire pentru utilizarea platformei digitale?",
    question_type: "single_choice",
    options: ["Da", "Poate", "Nu"],
    is_required: true,
  },
  {
    id: "q12_suggestions",
    survey_type: "official",
    question_number: 12,
    question_text: "Alte sugestii sau observații privind digitalizarea activității administrative:",
    question_type: "text",
    is_required: false,
  },
];

export function getQuestions(respondentType: RespondentType): SurveyQuestion[] {
  return respondentType === "citizen" ? citizenQuestions : officialQuestions;
}
