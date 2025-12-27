"use client";

import Image from "next/image";
import {
  Smartphone,
  Search,
  CreditCard,
  FileText,
  MessageCircle,
  BookOpen,
  BarChart3,
  Brain,
  CheckCircle,
  Lock,
  Mail,
  Paperclip,
  Clock,
  ShieldCheck,
  Folder,
  Download,
  Lightbulb,
  Gift,
  Video,
  HelpCircle,
  Bot,
  TrendingUp,
  Target,
  FileCheck,
  Calendar,
  Upload,
} from "lucide-react";
import { Timeline } from "@/components/ui/timeline";

/**
 * Features Section Component with Timeline
 *
 * Displays 8 key features of the platform in a modern Timeline layout.
 *
 * Features organized chronologically by user journey:
 * 1. Cereri Online - Entry point
 * 2. Tracking Real-Time - Follow-up
 * 3. Plăți Digitale - Payment flow
 * 4. Chat Direct - Support
 * 5. Documente Digitale - Delivery
 * 6. Survey Platform - Feedback
 * 7. Documentație Oficială - Learning
 * 8. AI Research Dashboard - Analytics
 */

const timelineData = [
  {
    title: "Cereri Online",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <Smartphone className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Depune cereri fără deplasări
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Platforma completă pentru interacțiunea cu primăria ta
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/cereri online.jpg"
            alt="Cereri Online"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <FileCheck className="text-primary h-4 w-4 flex-shrink-0" />
          Accesează și completează formulare online 24/7
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Upload className="text-primary h-4 w-4 flex-shrink-0" />
          Încarcă documente direct din platforma web
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Calendar className="text-primary h-4 w-4 flex-shrink-0" />
          Programează întâlniri fără telefoane și cozi
        </div>
      </div>
    ),
  },
  {
    title: "Tracking Real-Time",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <Search className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Urmărește statusul în timp real
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Transparență totală asupra progresului cererii tale
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/traking real-time.jpg"
            alt="Tracking Real-Time"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <CheckCircle className="text-primary h-4 w-4 flex-shrink-0" />
          Notificări instant pentru fiecare schimbare de status
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <CheckCircle className="text-primary h-4 w-4 flex-shrink-0" />
          Istoric complet al cererii cu timestampuri
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <CheckCircle className="text-primary h-4 w-4 flex-shrink-0" />
          Estimări realiste pentru finalizare
        </div>
      </div>
    ),
  },
  {
    title: "Plăți Digitale",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <CreditCard className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Plătește taxe rapid și securizat
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Integrare completă cu platformele de plată românești
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/plati digitale.jpg"
            alt="Plăți Digitale"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <CreditCard className="text-primary h-4 w-4 flex-shrink-0" />
          Card bancar, transfer bancar, PayPal
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Lock className="text-primary h-4 w-4 flex-shrink-0" />
          Encriptare SSL și conformitate PCI DSS
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Mail className="text-primary h-4 w-4 flex-shrink-0" />
          Chitanță electronică automată pe email
        </div>
      </div>
    ),
  },
  {
    title: "Chat Direct",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <MessageCircle className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Comunică cu funcționarii
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Chat live pentru întrebări și clarificări
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/chat direct.jpg"
            alt="Chat Direct"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <MessageCircle className="text-primary h-4 w-4 flex-shrink-0" />
          Răspunsuri rapide în timpul programului
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Paperclip className="text-primary h-4 w-4 flex-shrink-0" />
          Trimite documente direct în chat
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Clock className="text-primary h-4 w-4 flex-shrink-0" />
          Istoric complet al conversațiilor
        </div>
      </div>
    ),
  },
  {
    title: "Documente Digitale",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <FileText className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Descarcă documente semnate digital
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Toate documentele tale într-un singur loc, semnate legal
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/documente digitale.jpg"
            alt="Documente Digitale"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <ShieldCheck className="text-primary h-4 w-4 flex-shrink-0" />
          Semnătură digitală certificată certSIGN
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Folder className="text-primary h-4 w-4 flex-shrink-0" />
          Arhivă personală cu toate documentele
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Download className="text-primary h-4 w-4 flex-shrink-0" />
          Download instant format PDF
        </div>
      </div>
    ),
  },
  {
    title: "Survey Platform",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <BarChart3 className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Ajută-ne să construim primăriaTa❤️
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Vocea ta contează în dezvoltarea platformei
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/survey platform.jpg"
            alt="Survey Platform"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <BarChart3 className="text-primary h-4 w-4 flex-shrink-0" />
          Sondaje interactive despre nevoile tale
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Lightbulb className="text-primary h-4 w-4 flex-shrink-0" />
          Sugestii implementate în următoarea versiune
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Gift className="text-primary h-4 w-4 flex-shrink-0" />
          Recompense pentru participare activă
        </div>
      </div>
    ),
  },
  {
    title: "Documentație Oficială",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <BookOpen className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            Ghid complet pentru platforma primăriaTa❤️
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Tot ce trebuie să știi despre utilizarea platformei
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/documentatie oficiala.jpg"
            alt="Documentație Oficială"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <BookOpen className="text-primary h-4 w-4 flex-shrink-0" />
          Tutoriale pas cu pas pentru fiecare funcționalitate
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Video className="text-primary h-4 w-4 flex-shrink-0" />
          Video demonstrative pentru primari și cetățeni
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <HelpCircle className="text-primary h-4 w-4 flex-shrink-0" />
          FAQ actualizat cu întrebările frecvente
        </div>
      </div>
    ),
  },
  {
    title: "AI Research Dashboard",
    header: (
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 rounded-lg p-3">
          <Brain className="text-primary h-6 w-6" />
        </div>
        <div>
          <h4 className="font-montreal text-lg font-bold font-medium text-white dark:text-gray-900">
            AI-Powered Research Analysis Platform
          </h4>
          <p className="text-sm text-gray-400 dark:text-gray-700">
            Analiză inteligentă a datelor de sondaj pentru decizii strategice
          </p>
        </div>
      </div>
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/ai research dashboard.jpg"
            alt="AI Research Dashboard"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover shadow-[0_0_20px_rgba(190,49,68,0.15)]"
          />
        </div>
      </div>
    ),
    description: (
      <div className="mb-6">
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Bot className="text-primary h-4 w-4 flex-shrink-0" />
          Procesare automată AI a răspunsurilor survey
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <TrendingUp className="text-primary h-4 w-4 flex-shrink-0" />
          Dashboard interactiv cu metrici și insight-uri
        </div>
        <div className="font-montreal mb-2 flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <Target className="text-primary h-4 w-4 flex-shrink-0" />
          Recomandări strategice bazate pe feedback-ul cetățenilor
        </div>
        <div className="font-montreal flex items-center gap-2 text-xs font-medium text-gray-300 md:text-sm dark:text-gray-600">
          <BarChart3 className="text-primary h-4 w-4 flex-shrink-0" />
          Rapoarte detaliate pentru primari și stakeholderi
        </div>
      </div>
    ),
  },
];

export function FeaturesSection({
  scrollContainer,
}: {
  scrollContainer?: React.RefObject<HTMLElement>;
}) {
  return (
    <section className="relative w-full bg-transparent">
      <Timeline data={timelineData} scrollContainer={scrollContainer} />
    </section>
  );
}
