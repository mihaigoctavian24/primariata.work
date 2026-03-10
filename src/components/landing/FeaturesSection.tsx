"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Timeline } from "@/components/ui/timeline";
import { TextScramble } from "@/components/ui/text-scramble";
import { Highlight } from "@/components/ui/highlight";

function FeatureInfoCard({
  title,
  subtitle,
  bullets,
  revealed,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  revealed: boolean;
}) {
  return (
    <div className="mb-6">
      <h4 className="font-montreal text-foreground text-lg font-bold">
        <Highlight active={revealed}>
          <TextScramble trigger={revealed} speed={0.04} as="span">
            {title}
          </TextScramble>
        </Highlight>
      </h4>
      <motion.div
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      >
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        <ul className="mt-2 space-y-1">
          {bullets.map((b, i) => (
            <li key={i} className="text-muted-foreground/80 text-xs md:text-sm">
              — {b}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

const timelineData = [
  {
    title: "Cereri Online",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Depune cereri fără deplasări"
        subtitle="Platforma completă pentru interacțiunea cu primăria ta"
        bullets={[
          "Accesează și completează formulare online 24/7",
          "Încarcă documente direct din platforma web",
          "Programează întâlniri fără telefoane și cozi",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/cereri online.jpg"
            alt="Cereri Online"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Tracking Real-Time",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Urmărește statusul în timp real"
        subtitle="Transparență totală asupra progresului cererii tale"
        bullets={[
          "Notificări instant pentru fiecare schimbare de status",
          "Istoric complet al cererii cu timestampuri",
          "Estimări realiste pentru finalizare",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/traking real-time.jpg"
            alt="Tracking Real-Time"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Plăți Digitale",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Plătește taxe rapid și securizat"
        subtitle="Integrare completă cu platformele de plată românești"
        bullets={[
          "Card bancar, transfer bancar, PayPal",
          "Encriptare SSL și conformitate PCI DSS",
          "Chitanță electronică automată pe email",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/plati digitale.jpg"
            alt="Plăți Digitale"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Chat Direct",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Comunică cu funcționarii"
        subtitle="Chat live pentru întrebări și clarificări"
        bullets={[
          "Răspunsuri rapide în timpul programului",
          "Trimite documente direct în chat",
          "Istoric complet al conversațiilor",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/chat direct.jpg"
            alt="Chat Direct"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Documente Digitale",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Descarcă documente semnate digital"
        subtitle="Toate documentele tale într-un singur loc, semnate legal"
        bullets={[
          "Semnătură digitală certificată certSIGN",
          "Arhivă personală cu toate documentele",
          "Download instant format PDF",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/documente digitale.jpg"
            alt="Documente Digitale"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Survey Platform",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Ajută-ne să construim primăriaTa❤️"
        subtitle="Vocea ta contează în dezvoltarea platformei"
        bullets={[
          "Sondaje interactive despre nevoile tale",
          "Sugestii implementate în următoarea versiune",
          "Recompense pentru participare activă",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/survey platform.jpg"
            alt="Survey Platform"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "Documentație Oficială",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="Ghid complet pentru platforma primăriaTa❤️"
        subtitle="Tot ce trebuie să știi despre utilizarea platformei"
        bullets={[
          "Tutoriale pas cu pas pentru fiecare funcționalitate",
          "Video demonstrative pentru primari și cetățeni",
          "FAQ actualizat cu întrebările frecvente",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/documentatie oficiala.jpg"
            alt="Documentație Oficială"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
  },
  {
    title: "AI Research Dashboard",
    header: (revealed: boolean) => (
      <FeatureInfoCard
        title="AI-Powered Research Analysis Platform"
        subtitle="Analiză inteligentă a datelor de sondaj pentru decizii strategice"
        bullets={[
          "Procesare automată AI a răspunsurilor survey",
          "Dashboard interactiv cu metrici și insight-uri",
          "Recomandări strategice bazate pe feedback-ul cetățenilor",
          "Rapoarte detaliate pentru primari și stakeholderi",
        ]}
        revealed={revealed}
      />
    ),
    images: (
      <div>
        <div className="relative h-64 overflow-hidden rounded-lg md:h-44">
          <Image
            src="/bento grid/ai research dashboard.jpg"
            alt="AI Research Dashboard"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            style={{ boxShadow: "0 0 20px var(--accent-shadow)" }}
          />
        </div>
      </div>
    ),
    description: null,
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
