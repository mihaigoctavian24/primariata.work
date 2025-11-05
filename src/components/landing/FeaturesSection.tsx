"use client";

import {
  Smartphone,
  Search,
  CreditCard,
  FileText,
  MessageCircle,
  BookOpen,
  BarChart3,
  Brain,
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

/**
 * Features Section Component with Bento Grid
 *
 * Displays 8 key features of the platform in a Bento Grid layout.
 *
 * Layout (based on image):
 * Row 1: Tracking Real-Time (tall) | Cereri Online (wide) | Documentatie (tall)
 * Row 2: Plati Digitale | Cereri Online (cont) | Survey Platform
 * Row 3: Chat Direct | Documente Digitale | AI Research
 *
 * Features:
 * - Bento Grid layout with varying card sizes
 * - Lucide React icons
 * - Hover effects with scale and shadow
 * - CTA buttons on hover
 */

const features = [
  // COLOANA 1
  {
    Icon: Search,
    name: "Tracking Real-Time",
    description: "Urmărește statusul în timp real",
    href: "#",
    cta: "Explorează",
    background: (
      <>
        <img
          src="/bento grid/traking real-time.jpg"
          alt="Tracking Real-Time"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2", // Card mic
  },
  {
    Icon: CreditCard,
    name: "Plăți Digitale",
    description: "Plătește taxe rapid și securizat",
    href: "#",
    cta: "Descoperă",
    background: (
      <>
        <img
          src="/bento grid/plati digitale.jpg"
          alt="Plăți Digitale"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-4", // Card mediu (2 rows)
  },
  {
    Icon: MessageCircle,
    name: "Chat Direct",
    description: "Comunică cu funcționarii",
    href: "#",
    cta: "Începe chat",
    background: (
      <>
        <img
          src="/bento grid/chat direct.jpg"
          alt="Chat Direct"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-4 lg:row-end-6", // Card mediu (2 rows)
  },

  // COLOANA 2
  {
    Icon: Smartphone,
    name: "Cereri Online",
    description: "Depune cereri fără deplasări",
    href: "#",
    cta: "Află mai mult",
    background: (
      <>
        <img
          src="/bento grid/cereri online.jpg"
          alt="Cereri Online"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-6", // Card mare (5 rows)
  },

  // COLOANA 3
  {
    Icon: BookOpen,
    name: "Documentație Oficială",
    description: "Ghid complet pentru prezentare, evaluare și utilizare a platformei primăriaTa❤️",
    href: "https://docs.primariata.work",
    cta: "Citește ghidul",
    background: (
      <>
        <img
          src="/bento grid/documentatie oficiala.jpg"
          alt="Documentație Oficială"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2", // Card mic
  },
  {
    Icon: BarChart3,
    name: "Survey Platform",
    description: "Ajută-ne să construim primăriaTa❤️",
    href: "https://survey.primariata.work",
    cta: "Participă",
    background: (
      <>
        <img
          src="/bento grid/survey platform.jpg"
          alt="Survey Platform"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4", // Card mediu (2 rows)
  },
  {
    Icon: FileText,
    name: "Documente Digitale",
    description: "Descarcă documente semnate digital",
    href: "#",
    cta: "Vezi mai mult",
    background: (
      <>
        <img
          src="/bento grid/documente digitale.jpg"
          alt="Documente Digitale"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-4 lg:row-end-5", // Card mic
  },
  {
    Icon: Brain,
    name: "AI Research Dashboard",
    description: "AI-Powered Research Analysis Platform for Survey Data",
    href: "#",
    cta: "Explorează AI",
    background: (
      <>
        <img
          src="/bento grid/ai research dashboard.jpg"
          alt="AI Research Dashboard"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </>
    ),
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-5 lg:row-end-6", // Card mic
  },
];

export function FeaturesSection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-transparent via-gray-900/30 to-black px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Section Heading */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            De ce primăriaTa❤️?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Platformă SaaS white-label care digitalizează complet procesele administrative locale
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="auto-rows-[14rem] lg:grid-rows-5">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
