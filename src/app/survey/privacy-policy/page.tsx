"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * GDPR Privacy Policy Page
 *
 * Complete privacy policy compliant with:
 * - GDPR (Regulamentul UE 2016/679)
 * - Legea 190/2018 (Romania)
 * - Directive UE pentru protecția datelor
 */
export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Chestionar
          </Button>
          <Shield className="text-primary h-8 w-8" />
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Shield className="text-primary h-8 w-8" />
              Politică de Confidențialitate și Protecția Datelor
            </CardTitle>
            <CardDescription className="text-base">
              Ultima actualizare: {new Date().toLocaleDateString("ro-RO")} | Conform GDPR (UE
              2016/679) și Legii 190/2018
            </CardDescription>
          </CardHeader>

          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            {/* Introducere */}
            <section>
              <h2 className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                1. Introducere
              </h2>
              <p>
                <strong>primariaTa❤️_</strong> (&quot;noi&quot;, &quot;noastră&quot;) respectă
                dreptul dumneavoastră la confidențialitate și se angajează să protejeze datele
                personale pe care ni le furnizați prin completarea chestionarului de digitalizare.
              </p>
              <p>
                Această politică explică ce date colectăm, de ce le colectăm, cum le folosim, cât
                timp le păstrăm și care sunt drepturile dumneavoastră conform{" "}
                <strong>Regulamentului General privind Protecția Datelor (GDPR)</strong> și{" "}
                <strong>Legii 190/2018</strong> privind măsuri de punere în aplicare a GDPR în
                România.
              </p>
            </section>

            {/* Operator de Date */}
            <section>
              <h2 className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                2. Operator de Date Personale
              </h2>
              <div className="bg-muted rounded-lg p-4">
                <p className="font-semibold">Operator:</p>
                <p>
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
              <p className="mt-4">
                În calitate de operator de date, suntem responsabili pentru colectarea, prelucrarea
                și protecția datelor dumneavoastră personale în conformitate cu legislația în
                vigoare.
              </p>
            </section>

            {/* Date Colectate */}
            <section>
              <h2 className="flex items-center gap-2">
                <Eye className="h-6 w-6" />
                3. Ce Date Personale Colectăm
              </h2>
              <p>Prin completarea chestionarului, colectăm următoarele categorii de date:</p>

              <h3>3.1. Date Obligatorii</h3>
              <ul>
                <li>
                  <strong>Nume și Prenume</strong> - pentru identificare și validare răspunsuri
                </li>
                <li>
                  <strong>Județ și Localitate</strong> - pentru analiză geografică și statistici
                  regionale
                </li>
                <li>
                  <strong>Tip Respondent</strong> - cetățean sau funcționar public (pentru
                  personalizarea întrebărilor)
                </li>
              </ul>

              <h3>3.2. Date Opționale</h3>
              <ul>
                <li>
                  <strong>Adresa de Email</strong> - doar dacă doriți să fiți contactat pentru
                  rezultate sau clarificări
                </li>
              </ul>

              <h3>3.3. Date Tehnice (Automate)</h3>
              <ul>
                <li>
                  <strong>Timestamp</strong> - data și ora completării chestionarului
                </li>
                <li>
                  <strong>ID Unic Răspuns</strong> - generat automat pentru gestionarea tehnică
                </li>
                <li>
                  <strong>Status Completare</strong> - indicator tehnic pentru validare
                </li>
              </ul>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  ℹ️ Important: NU colectăm CNP, adresă fizică completă, date bancare, date de
                  sănătate sau alte date sensibile.
                </p>
              </div>
            </section>

            {/* Scop și Temei Legal */}
            <section>
              <h2 className="flex items-center gap-2">
                <Lock className="h-6 w-6" />
                4. De Ce Colectăm Datele (Scop și Temei Legal)
              </h2>

              <h3>4.1. Scopul Prelucrării</h3>
              <p>Datele dumneavoastră sunt utilizate exclusiv pentru:</p>
              <ul>
                <li>
                  <strong>Cercetare și Analiză</strong> - înțelegerea nevoilor de digitalizare a
                  serviciilor publice
                </li>
                <li>
                  <strong>Statistici Agregate</strong> - generarea de rapoarte și grafice anonime la
                  nivel național/regional
                </li>
                <li>
                  <strong>Îmbunătățirea Platformei</strong> - dezvoltarea funcționalităților bazate
                  pe feedback real
                </li>
                <li>
                  <strong>Contact (Opțional)</strong> - dacă ați furnizat email, pentru comunicarea
                  rezultatelor sau clarificări
                </li>
              </ul>

              <h3>4.2. Temei Legal (Art. 6 GDPR)</h3>
              <p>Prelucrăm datele dumneavoastră pe baza:</p>
              <ul>
                <li>
                  <strong>Consimțământul explicit (Art. 6.1.a GDPR)</strong> - prin bifarea
                  checkbox-ului GDPR înainte de trimitere
                </li>
                <li>
                  <strong>Interest legitim (Art. 6.1.f GDPR)</strong> - pentru îmbunătățirea
                  serviciilor publice digitale
                </li>
              </ul>
            </section>

            {/* Cât Timp Păstrăm Datele */}
            <section>
              <h2>5. Cât Timp Păstrăm Datele Dumneavoastră</h2>
              <div className="bg-muted rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Tip Date</th>
                      <th className="text-left">Perioadă Păstrare</th>
                      <th className="text-left">Justificare</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Date personale (nume, email)</td>
                      <td>
                        <strong>24 luni</strong>
                      </td>
                      <td>Necesare pentru validare și contact</td>
                    </tr>
                    <tr>
                      <td>Răspunsuri chestionar</td>
                      <td>
                        <strong>36 luni</strong>
                      </td>
                      <td>Analiză longitudinală și tendințe</td>
                    </tr>
                    <tr>
                      <td>Date anonimizate (statistici)</td>
                      <td>
                        <strong>Permanent</strong>
                      </td>
                      <td>Studii științifice (fără identificare)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                După expirarea perioadelor de mai sus, datele personale vor fi{" "}
                <strong>șterse definitiv</strong> sau <strong>anonimizate complet</strong> (astfel
                încât să nu mai permită identificarea).
              </p>
            </section>

            {/* Drepturile Dumneavoastră */}
            <section>
              <h2>6. Drepturile Dumneavoastră conform GDPR</h2>
              <p>
                Aveți următoarele drepturi în legătură cu datele personale pe care le deținem despre
                dumneavoastră:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
                  <h4 className="font-semibold">🔍 Dreptul de Acces (Art. 15 GDPR)</h4>
                  <p className="text-sm">
                    Puteți solicita o copie a tuturor datelor personale pe care le deținem despre
                    dumneavoastră.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-950">
                  <h4 className="font-semibold">✏️ Dreptul de Rectificare (Art. 16 GDPR)</h4>
                  <p className="text-sm">
                    Puteți solicita corectarea datelor incorecte sau incomplete.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 bg-red-50 p-4 dark:bg-red-950">
                  <h4 className="font-semibold">
                    🗑️ Dreptul la Ștergere (&quot;Right to be Forgotten&quot;, Art. 17 GDPR)
                  </h4>
                  <p className="text-sm">
                    Puteți solicita ștergerea completă a datelor dumneavoastră din sistemele
                    noastre.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
                  <h4 className="font-semibold">⏸️ Dreptul la Restricționare (Art. 18 GDPR)</h4>
                  <p className="text-sm">
                    Puteți solicita limitarea prelucrării datelor în anumite circumstanțe.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-950">
                  <h4 className="font-semibold">📦 Dreptul la Portabilitate (Art. 20 GDPR)</h4>
                  <p className="text-sm">
                    Puteți primi datele într-un format structurat (CSV, JSON) pentru transfer la alt
                    operator.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-950">
                  <h4 className="font-semibold">🚫 Dreptul la Opoziție (Art. 21 GDPR)</h4>
                  <p className="text-sm">
                    Puteți vă opune prelucrării datelor bazate pe interest legitim.
                  </p>
                </div>

                <div className="border-l-4 border-pink-500 bg-pink-50 p-4 dark:bg-pink-950">
                  <h4 className="font-semibold">↩️ Dreptul de Retragere a Consimțământului</h4>
                  <p className="text-sm">
                    Puteți retrage oricând consimțământul acordat, fără a afecta legalitatea
                    prelucrării anterioare.
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 mt-6 rounded-lg p-4">
                <h4 className="font-semibold">📧 Cum Exercitați Aceste Drepturi?</h4>
                <p className="text-sm">
                  Trimiteți un email la:{" "}
                  <a href="mailto:gdpr@primariata.work" className="text-primary hover:underline">
                    gdpr@primariata.work
                  </a>
                  <br />
                  Răspundem la toate solicitările în maximum <strong>30 de zile</strong> (conform
                  Art. 12.3 GDPR).
                </p>
              </div>
            </section>

            {/* Securitatea Datelor */}
            <section>
              <h2 className="flex items-center gap-2">
                <Lock className="h-6 w-6" />
                7. Cum Protejăm Datele Dumneavoastră
              </h2>
              <p>Implementăm măsuri tehnice și organizatorice pentru securitatea datelor:</p>

              <h3>7.1. Măsuri Tehnice</h3>
              <ul>
                <li>
                  <strong>Criptare SSL/TLS</strong> - toate datele sunt transmise printr-o conexiune
                  securizată (HTTPS)
                </li>
                <li>
                  <strong>Criptare în Bază de Date</strong> - datele personale sunt criptate at-rest
                </li>
                <li>
                  <strong>Backup Automat</strong> - copii de siguranță zilnice cu criptare
                </li>
                <li>
                  <strong>Firewall și Monitorizare</strong> - protecție împotriva accesului
                  neautorizat
                </li>
              </ul>

              <h3>7.2. Măsuri Organizatorice</h3>
              <ul>
                <li>
                  <strong>Acces Limitat</strong> - doar personalul autorizat are acces la date
                </li>
                <li>
                  <strong>Confidențialitate</strong> - acorduri de confidențialitate pentru tot
                  personalul
                </li>
                <li>
                  <strong>Audit și Monitorizare</strong> - log-uri pentru toate accesările datelor
                </li>
                <li>
                  <strong>Proceduri de Incident</strong> - plan de răspuns la breșe de securitate
                </li>
              </ul>

              <h3>7.3. Furnizori de Servicii (Sub-procesatori)</h3>
              <p>Datele sunt stocate la:</p>
              <ul>
                <li>
                  <strong>Supabase (Cloud Database)</strong> - certificat ISO 27001, SOC 2 Type II,
                  GDPR compliant
                </li>
                <li>
                  <strong>Vercel (Hosting)</strong> - certificat SOC 2, GDPR compliant, servere în
                  UE
                </li>
              </ul>
              <p>
                Toți sub-procesatorii noștri au acorduri DPA (Data Processing Agreement) și respectă
                GDPR.
              </p>
            </section>

            {/* Transfer Internațional */}
            <section>
              <h2>8. Transfer Internațional de Date</h2>
              <p>
                Datele dumneavoastră sunt procesate și stocate în <strong>Uniunea Europeană</strong>{" "}
                (UE/EEA). Nu transferăm date personale în afara UE fără garanții adecvate conform
                Capitolului V GDPR.
              </p>
              <p>
                În cazul în care este necesar un transfer internațional, vom folosi{" "}
                <strong>Clauze Contractuale Standard (SCC)</strong> aprobate de Comisia Europeană.
              </p>
            </section>

            {/* Modificări Politică */}
            <section>
              <h2>9. Modificări ale Acestei Politici</h2>
              <p>
                Ne rezervăm dreptul de a actualiza această politică pentru a reflecta modificări
                legislative sau operaționale. Versiunea actualizată va fi publicată pe această
                pagină cu data modificării.
              </p>
              <p>
                Modificările semnificative vor fi comunicate prin email (dacă ați furnizat adresa)
                sau printr-o notificare vizibilă pe platformă.
              </p>
            </section>

            {/* Contact DPO */}
            <section className="bg-primary/10 rounded-lg p-6">
              <h2 className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                10. Contact și Plângeri
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">📧 Contact Operator Date:</h4>
                  <p>
                    Email:{" "}
                    <a href="mailto:gdpr@primariata.work" className="text-primary hover:underline">
                      gdpr@primariata.work
                    </a>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">🏛️ Autoritate de Supraveghere (România):</h4>
                  <p>
                    <strong>
                      Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
                      Personal (ANSPDCP)
                    </strong>
                    <br />
                    B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București
                    <br />
                    Telefon: +40.318.059.211 / +40.318.059.212
                    <br />
                    Email:{" "}
                    <a
                      href="mailto:anspdcp@dataprotection.ro"
                      className="text-primary hover:underline"
                    >
                      anspdcp@dataprotection.ro
                    </a>
                    <br />
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

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                    ⚖️ Aveți dreptul de a depune o plângere la ANSPDCP dacă considerați că
                    drepturile dumneavoastră GDPR au fost încălcate.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Legal */}
            <section className="text-muted-foreground border-t pt-6 text-sm">
              <p>
                <strong>Legislație aplicabilă:</strong>
              </p>
              <ul className="list-disc pl-6">
                <li>Regulamentul (UE) 2016/679 (GDPR)</li>
                <li>Legea nr. 190/2018 privind măsuri de punere în aplicare a GDPR</li>
                <li>Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal</li>
              </ul>
              <p className="mt-4">
                Ultima actualizare: <strong>{new Date().toLocaleDateString("ro-RO")}</strong>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Back to Survey Button */}
        <div className="flex justify-center pb-8">
          <Button size="lg" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Chestionar
          </Button>
        </div>
      </div>
    </div>
  );
}
