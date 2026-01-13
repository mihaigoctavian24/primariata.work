"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  BookOpen,
  Search,
  ExternalLink,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "cereri" | "plati" | "general" | "getting-started";
  keywords: string[];
  relatedLinks?: { label: string; url: string }[];
}

interface HelpCenterWidgetProps {
  /** Number of active cereri (for context detection) */
  activeCereriCount?: number;
  /** Number of pending plăți (for context detection) */
  pendingPlatiCount?: number;
  /** Is this a new user? (for context detection) */
  isNewUser?: boolean;
  /** Max FAQs to show initially */
  maxFAQs?: number;
}

// Comprehensive FAQ database
const FAQ_DATABASE: FAQ[] = [
  // Getting Started FAQs
  {
    id: "gs-1",
    question: "Cum depun prima mea cerere?",
    answer:
      'Accesați secțiunea "Cereri Noi" din meniul principal, selectați tipul de cerere dorit (certificat, autorizație, etc.), completați formularul cu datele necesare și atașați documentele solicitate. După verificare, apăsați "Depune Cerere".',
    category: "getting-started",
    keywords: ["prima cerere", "depunere", "început", "tutorial"],
    relatedLinks: [
      { label: "Vezi ghidul video", url: "/help/video-prima-cerere" },
      { label: "Cereri disponibile", url: "/cereri/new" },
    ],
  },
  {
    id: "gs-2",
    question: "Ce documente sunt necesare pentru certificat de căsătorie?",
    answer:
      "Pentru certificat de căsătorie aveți nevoie de: copie CI ambii parteneri, certificat de naștere ambii parteneri, dovada domiciliului, și declarație pe proprie răspundere. Toate documentele trebuie să fie în format PDF, max 10MB fiecare.",
    category: "getting-started",
    keywords: ["documente", "certificat", "căsătorie", "necesare"],
  },
  {
    id: "gs-3",
    question: "Cum verific statusul cererii mele?",
    answer:
      'Accesați secțiunea "Cereri Active" din dashboard. Fiecare cerere are o bară de progres care arată etapa curentă: Depusă → În Verificare → Aprobată → Finalizată. Veți primi și notificări automate la fiecare schimbare de status.',
    category: "getting-started",
    keywords: ["status", "verificare", "progres", "etapă"],
    relatedLinks: [{ label: "Vezi cereri active", url: "/cereri" }],
  },

  // Cereri Process FAQs
  {
    id: "cereri-1",
    question: "Cât durează procesarea unei cereri?",
    answer:
      "Timpul de procesare variază în funcție de tipul cererii: Certificat Fiscal (3-5 zile), Certificat de Căsătorie (7-10 zile), Autorizație Construcție (15-30 zile). Puteți vedea estimarea exactă în detaliile cererii dvs.",
    category: "cereri",
    keywords: ["durată", "timp", "procesare", "estimare", "ETA"],
  },
  {
    id: "cereri-2",
    question: "Ce înseamnă status 'În Verificare'?",
    answer:
      "Status 'În Verificare' înseamnă că un funcționar revizuiește cererea și documentele dvs. pentru conformitate. Veți fi notificat dacă sunt necesare documente suplimentare sau dacă cererea a fost aprobată pentru următoarea etapă.",
    category: "cereri",
    keywords: ["status", "verificare", "procesare", "funcționar"],
  },
  {
    id: "cereri-3",
    question: "Pot modifica o cerere după depunere?",
    answer:
      "Cererile în status 'Depusă' pot fi retrase și resubmise cu modificări. Pentru cererile 'În Verificare' sau mai avansate, contactați primăria prin secțiunea Mesaje pentru a solicita modificări.",
    category: "cereri",
    keywords: ["modificare", "editare", "resubmitere", "retragere"],
  },
  {
    id: "cereri-4",
    question: "Ce se întâmplă dacă documentele mele sunt incomplete?",
    answer:
      "Veți primi o notificare cu lista documentelor lipsă și un termen limită pentru completare (de obicei 5 zile). Puteți încărca documentele suplimentare direct din pagina cererii. Dacă termenul expiră, cererea va fi respinsă automat.",
    category: "cereri",
    keywords: ["documente", "incomplete", "lipsă", "termen limită"],
  },

  // Plăți FAQs
  {
    id: "plati-1",
    question: "Cum pot plăti o taxă online?",
    answer:
      'Accesați secțiunea "Plăți" din meniu, selectați taxa de plătit (sau plătiți direct din cererea asociată), alegeți metoda de plată (card bancar sau transfer bancar), și finalizați tranzacția. Veți primi chitanță electronică pe email.',
    category: "plati",
    keywords: ["plată", "online", "taxă", "card", "transfer"],
    relatedLinks: [{ label: "Vezi plăți pending", url: "/plati" }],
  },
  {
    id: "plati-2",
    question: "Ce metode de plată sunt acceptate?",
    answer:
      "Acceptăm: Card bancar (Visa, Mastercard), Transfer bancar (IBAN), și Plata la ghișeu (generează OP pentru ghișeu). Toate plățile online sunt procesate securizat prin Ghișeul.ro.",
    category: "plati",
    keywords: ["metode", "plată", "card", "transfer", "ghișeu"],
  },
  {
    id: "plati-3",
    question: "Cât durează până când plata mea este confirmată?",
    answer:
      "Plățile cu card sunt confirmate instant. Transferurile bancare sunt confirmate în 1-2 zile lucrătoare. Veți primi notificare când plata este procesată și cererea dvs. va avansa automat la următoarea etapă.",
    category: "plati",
    keywords: ["confirmare", "durată", "procesare", "instant"],
  },
  {
    id: "plati-4",
    question: "Pot obține rambursare pentru o plată eronată?",
    answer:
      "Da, puteți solicita rambursare prin secțiunea Mesaje, specificând numărul tranzacției și motivul. Rambursările sunt procesate în 10-15 zile lucrătoare. Păstrați chitanța electronică ca dovadă.",
    category: "plati",
    keywords: ["rambursare", "refund", "eroare", "greșeală"],
  },

  // General FAQs
  {
    id: "gen-1",
    question: "Cum pot contacta primăria pentru asistență?",
    answer:
      'Puteți contacta primăria prin: Secțiunea "Mesaje" din platformă (răspuns în 24h), Email: contact@primarie.ro, Telefon: 0213-XXX-XXX (L-V, 9-17), sau vizită fizică la ghișeu cu programare online.',
    category: "general",
    keywords: ["contact", "asistență", "suport", "help", "telefon", "email"],
  },
  {
    id: "gen-2",
    question: "Cum îmi actualizez datele de contact?",
    answer:
      'Accesați "Profil" din meniul user (click pe avatar), secțiunea "Date Contact", modificați email/telefon/adresă, și salvați. Veți primi un email de confirmare la noua adresă.',
    category: "general",
    keywords: ["profil", "actualizare", "date", "contact", "email", "telefon"],
  },
  {
    id: "gen-3",
    question: "Este platforma sigură pentru date personale?",
    answer:
      "Da, platforma folosește: Criptare SSL/TLS pentru comunicare, Autentificare cu 2FA opțional, Backup zilnic al datelor, și conformitate GDPR. Datele dvs. sunt stocate securizat și nu sunt partajate cu terțe părți fără consimțământ.",
    category: "general",
    keywords: ["securitate", "GDPR", "date", "personale", "criptare"],
  },
];

/**
 * Help Center Widget - Contextual FAQ System
 *
 * Features:
 * - Contextual FAQs based on user state (active cereri, pending plăți, new user)
 * - Expand/collapse individual FAQs
 * - Search functionality
 * - Related links for deeper help
 * - Responsive design
 *
 * Context Detection:
 * - New users → Getting started FAQs
 * - Active cereri → Process FAQs
 * - Pending plăți → Payment FAQs
 * - Default → General FAQs
 */
export function HelpCenterWidget({
  activeCereriCount = 0,
  pendingPlatiCount = 0,
  isNewUser = false,
  maxFAQs = 4,
}: HelpCenterWidgetProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllFAQs, setShowAllFAQs] = useState(false);

  // Context detection: determine which FAQs to show
  const contextualFAQs = useMemo(() => {
    let faqs: FAQ[] = [];

    if (searchQuery.trim()) {
      // Search mode: filter by keywords
      const query = searchQuery.toLowerCase();
      faqs = FAQ_DATABASE.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.keywords.some((kw) => kw.toLowerCase().includes(query))
      );
    } else {
      // Context mode: show relevant FAQs based on user state
      if (isNewUser) {
        // New user: prioritize getting-started
        faqs = FAQ_DATABASE.filter((f) => f.category === "getting-started");
      } else if (activeCereriCount > 0 && pendingPlatiCount > 0) {
        // Both active: mix cereri and plăți
        faqs = [
          ...FAQ_DATABASE.filter((f) => f.category === "cereri").slice(0, 2),
          ...FAQ_DATABASE.filter((f) => f.category === "plati").slice(0, 2),
        ];
      } else if (activeCereriCount > 0) {
        // Active cereri: show process FAQs
        faqs = FAQ_DATABASE.filter((f) => f.category === "cereri");
      } else if (pendingPlatiCount > 0) {
        // Pending plăți: show payment FAQs
        faqs = FAQ_DATABASE.filter((f) => f.category === "plati");
      } else {
        // Default: show general + mix
        faqs = [
          ...FAQ_DATABASE.filter((f) => f.category === "general").slice(0, 2),
          ...FAQ_DATABASE.filter((f) => f.category === "getting-started").slice(0, 2),
        ];
      }
    }

    return showAllFAQs ? faqs : faqs.slice(0, maxFAQs);
  }, [activeCereriCount, pendingPlatiCount, isNewUser, searchQuery, showAllFAQs, maxFAQs]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getCategoryIcon = (category: FAQ["category"]) => {
    switch (category) {
      case "cereri":
        return <FileText className="h-4 w-4" />;
      case "plati":
        return <CreditCard className="h-4 w-4" />;
      case "getting-started":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: FAQ["category"]) => {
    switch (category) {
      case "cereri":
        return "Cereri";
      case "plati":
        return "Plăți";
      case "getting-started":
        return "Ghid Inițial";
      default:
        return "General";
    }
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
      {/* Header */}
      <div className="border-border bg-muted/30 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary rounded-md p-2">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Centru Ajutor</h3>
            <p className="text-muted-foreground text-xs">
              {isNewUser
                ? "Bun venit! Ghid pentru primii pași"
                : activeCereriCount > 0
                  ? `Ajutor pentru ${activeCereriCount} ${activeCereriCount === 1 ? "cerere activă" : "cereri active"}`
                  : pendingPlatiCount > 0
                    ? `Ajutor pentru plăți (${pendingPlatiCount} pending)`
                    : "Întrebări frecvente"}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-border border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută în întrebări..."
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-9 w-full rounded-md border pr-3 pl-9 text-sm focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-h-[400px] overflow-y-auto">
        {contextualFAQs.length === 0 ? (
          <div className="p-8 text-center">
            <HelpCircle className="text-muted-foreground/50 mx-auto h-12 w-12" />
            <p className="text-foreground mt-3 text-sm font-medium">Niciun rezultat</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Încercați cu alți termeni de căutare
            </p>
          </div>
        ) : (
          <div className="divide-border divide-y">
            {contextualFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFAQ === faq.id}
                onToggle={() => toggleFAQ(faq.id)}
                categoryIcon={getCategoryIcon(faq.category)}
                categoryLabel={getCategoryLabel(faq.category)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!searchQuery && contextualFAQs.length > 0 && (
        <div className="border-border bg-muted/30 border-t p-3">
          <button
            onClick={() => setShowAllFAQs(!showAllFAQs)}
            className="bg-background text-foreground hover:bg-muted w-full rounded-md px-3 py-2 text-sm font-medium"
          >
            {showAllFAQs ? "Arată mai puține" : "Vezi toate întrebările"}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual FAQ Item Component
 */
function FAQItem({
  faq,
  isExpanded,
  onToggle,
  categoryIcon,
  categoryLabel,
}: {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
  categoryIcon: React.ReactNode;
  categoryLabel: string;
}) {
  return (
    <div className="p-3">
      {/* Question Header */}
      <button onClick={onToggle} className="flex w-full items-start gap-3 text-left">
        <div className="bg-primary/10 text-primary flex-shrink-0 rounded-md p-1.5">
          {categoryIcon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-foreground text-sm font-medium">{faq.question}</p>
            {isExpanded ? (
              <ChevronUp className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            )}
          </div>
          <span className="bg-muted text-muted-foreground mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs">
            {categoryLabel}
          </span>
        </div>
      </button>

      {/* Answer Content (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 ml-10 space-y-3">
              <p className="text-muted-foreground text-sm">{faq.answer}</p>

              {/* Related Links */}
              {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                <div className="space-y-1">
                  <p className="text-foreground text-xs font-medium">Link-uri utile:</p>
                  {faq.relatedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      className="text-primary flex items-center gap-1 text-xs hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
