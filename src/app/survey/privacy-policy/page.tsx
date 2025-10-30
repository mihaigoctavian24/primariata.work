"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurveyLandingHeader } from "@/components/survey/SurveyLandingHeader";

/**
 * GDPR Privacy Policy Page - Redesigned
 *
 * Modern, animated privacy policy page aligned with primariaTa theme
 * Compliant with GDPR (UE 2016/679) and Legea 190/2018
 */

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen">
      <SurveyLandingHeader />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="bg-primary/10 mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
            <Shield className="text-primary h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            Politica de <span className="text-primary">Confidențialitate</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Ne angajăm să protejăm confidențialitatea datelor tale personale conform GDPR și
            legislației românești
          </p>
          <div className="text-muted-foreground mt-4 text-sm">
            Ultima actualizare: {new Date().toLocaleDateString("ro-RO")} | Conform GDPR (UE
            2016/679) și Legii 190/2018
          </div>
        </motion.div>

        {/* Quick Summary Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-12 grid gap-4 md:grid-cols-3"
        >
          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-green-500/20 bg-green-500/10 p-6"
          >
            <CheckCircle2 className="mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
            <h3 className="mb-2 font-semibold">Date Minime</h3>
            <p className="text-muted-foreground text-sm">
              Colectăm doar informațiile strict necesare pentru analiză
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6"
          >
            <Lock className="mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h3 className="mb-2 font-semibold">Criptare Completă</h3>
            <p className="text-muted-foreground text-sm">
              Toate datele sunt protejate prin SSL/TLS și criptare
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-6"
          >
            <Shield className="mb-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h3 className="mb-2 font-semibold">Controlul Tău</h3>
            <p className="text-muted-foreground text-sm">
              Poți accesa, modifica sau șterge datele oricând
            </p>
          </motion.div>
        </motion.div>

        {/* Main Content Sections */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-12"
        >
          {/* Introducere */}
          <motion.section
            variants={fadeInUp}
            className="prose prose-slate dark:prose-invert max-w-none"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <h2 className="m-0 text-2xl font-bold">1. Introducere</h2>
            </div>
            <p className="text-muted-foreground">
              <strong className="text-foreground">primariaTa❤️_</strong> respectă dreptul tău la
              confidențialitate și se angajează să protejeze datele personale pe care ni le
              furnizezi prin completarea chestionarului de digitalizare.
            </p>
            <p className="text-muted-foreground">
              Această politică explică ce date colectăm, de ce le colectăm, cum le folosim, cât timp
              le păstrăm și care sunt drepturile tale conform{" "}
              <strong className="text-foreground">GDPR</strong> și{" "}
              <strong className="text-foreground">Legii 190/2018</strong>.
            </p>
          </motion.section>

          {/* Operator de Date */}
          <motion.section variants={fadeInUp}>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Database className="text-primary h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">2. Operator de Date Personale</h2>
            </div>
            <div className="bg-muted/50 rounded-xl border p-6">
              <p className="mb-2 font-semibold">Operator:</p>
              <p className="text-muted-foreground">
                primariaTa❤️_
                <br />
                România
                <br />
                Email:{" "}
                <a href="mailto:gdpr@primariata.work" className="text-primary hover:underline">
                  gdpr@primariata.work
                </a>
              </p>
            </div>
            <p className="text-muted-foreground mt-4">
              În calitate de operator de date, suntem responsabili pentru colectarea, prelucrarea și
              protecția datelor tale personale în conformitate cu legislația în vigoare.
            </p>
          </motion.section>

          {/* Date Colectate */}
          <motion.section variants={fadeInUp}>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Eye className="text-primary h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">3. Ce Date Personale Colectăm</h2>
            </div>

            <div className="space-y-6">
              <div className="border-primary border-l-4 pl-6">
                <h3 className="mb-2 text-lg font-semibold">3.1. Date Obligatorii</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>
                      <strong className="text-foreground">Nume și Prenume</strong> - pentru
                      identificare și validare răspunsuri
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>
                      <strong className="text-foreground">Județ și Localitate</strong> - pentru
                      analiză geografică și statistici regionale
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>
                      <strong className="text-foreground">Tip Respondent</strong> - cetățean sau
                      funcționar public
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="mb-2 text-lg font-semibold">3.2. Date Opționale</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>
                      <strong className="text-foreground">Adresa de Email</strong> - doar dacă
                      dorești să fii contactat pentru rezultate
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  ℹ️ Important: NU colectăm CNP, adresă fizică completă, date bancare, date de
                  sănătate sau alte date sensibile.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Drepturile Tale */}
          <motion.section variants={fadeInUp}>
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Shield className="text-primary h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">4. Drepturile Tale conform GDPR</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5">
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Dreptul de Acces
                </h4>
                <p className="text-muted-foreground text-sm">
                  Poți solicita o copie a tuturor datelor personale pe care le deținem despre tine.
                </p>
              </div>

              <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 p-5">
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Dreptul de Rectificare
                </h4>
                <p className="text-muted-foreground text-sm">
                  Poți solicita corectarea datelor incorecte sau incomplete.
                </p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 p-5">
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  Dreptul la Ștergere
                </h4>
                <p className="text-muted-foreground text-sm">
                  Poți solicita ștergerea completă a datelor tale din sistemele noastre.
                </p>
              </div>

              <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5">
                <h4 className="mb-2 flex items-center gap-2 font-semibold">
                  <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Dreptul la Portabilitate
                </h4>
                <p className="text-muted-foreground text-sm">
                  Poți primi datele într-un format structurat (CSV, JSON) pentru transfer.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border-primary/20 mt-6 rounded-xl border p-6">
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Mail className="text-primary h-5 w-5" />
                Cum Exerciți Aceste Drepturi?
              </h4>
              <p className="text-muted-foreground text-sm">
                Trimite un email la:{" "}
                <a
                  href="mailto:gdpr@primariata.work"
                  className="text-primary font-medium hover:underline"
                >
                  gdpr@primariata.work
                </a>
                <br />
                Răspundem la toate solicitările în maximum{" "}
                <strong className="text-foreground">30 de zile</strong> (conform Art. 12.3 GDPR).
              </p>
            </div>
          </motion.section>

          {/* Securitate */}
          <motion.section variants={fadeInUp}>
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Lock className="text-primary h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">5. Cum Protejăm Datele Tale</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Măsuri Tehnice</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Criptare SSL/TLS pentru transmisie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Criptare în bază de date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Backup automat zilnic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Firewall și monitorizare 24/7</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Măsuri Organizatorice</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Acces limitat doar la personal autorizat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Acorduri de confidențialitate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Audit și log-uri complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Plan de răspuns la incidente</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 mt-6 rounded-xl border p-6">
              <h4 className="mb-3 font-semibold">Furnizori de Servicii (Certificați GDPR)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-muted-foreground text-sm">ISO 27001, SOC 2 Type II</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">Vercel</p>
                    <p className="text-muted-foreground text-sm">SOC 2, servere în UE</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            variants={fadeInUp}
            className="from-primary/10 to-primary/5 border-primary/20 rounded-2xl border bg-gradient-to-br p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold">6. Contact și Plângeri</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="mb-2 font-semibold">📧 Contact Operator Date:</h4>
                <p className="text-muted-foreground">
                  Email:{" "}
                  <a
                    href="mailto:gdpr@primariata.work"
                    className="text-primary font-medium hover:underline"
                  >
                    gdpr@primariata.work
                  </a>
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">🏛️ Autoritate de Supraveghere (România):</h4>
                <div className="text-muted-foreground space-y-1">
                  <p className="text-foreground font-medium">
                    Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
                    (ANSPDCP)
                  </p>
                  <p>B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București</p>
                  <p>Telefon: +40.318.059.211 / +40.318.059.212</p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:anspdcp@dataprotection.ro"
                      className="text-primary hover:underline"
                    >
                      anspdcp@dataprotection.ro
                    </a>
                  </p>
                  <p>
                    Website:{" "}
                    <a
                      href="https://www.dataprotection.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      www.dataprotection.ro
                    </a>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-sm font-semibold">
                  ⚖️ Ai dreptul de a depune o plângere la ANSPDCP dacă consideri că drepturile tale
                  GDPR au fost încălcate.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Footer Legal */}
          <motion.section
            variants={fadeInUp}
            className="text-muted-foreground border-t pt-8 text-sm"
          >
            <p className="text-foreground mb-2 font-semibold">Legislație aplicabilă:</p>
            <ul className="ml-4 space-y-1">
              <li>• Regulamentul (UE) 2016/679 (GDPR)</li>
              <li>• Legea nr. 190/2018 privind măsuri de punere în aplicare a GDPR</li>
              <li>• Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal</li>
            </ul>
            <p className="mt-4">
              Ultima actualizare:{" "}
              <strong className="text-foreground">{new Date().toLocaleDateString("ro-RO")}</strong>
            </p>
          </motion.section>
        </motion.div>

        {/* Back to Survey Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center pt-12 pb-8"
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Chestionar
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
