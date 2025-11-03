import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  Lock,
  Scale,
  AlertTriangle,
  RefreshCw,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Termeni și Condiții | primariaTa",
  description: "Termeni și condiții de utilizare pentru platforma primariaTa",
};

export default function TermeniPage() {
  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Header Section */}
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/auth/register"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Înapoi la înregistrare
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="bg-primary/10 mb-6 inline-flex rounded-full p-4">
            <FileText className="text-primary size-8" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Termeni și Condiții
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Ultima actualizare:{" "}
            {new Date().toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Shield className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">1. Acceptarea Termenilor</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Prin accesarea și utilizarea platformei primariaTa, sunteți de acord să respectați
                  acești termeni și condiții în totalitate. Dacă nu sunteți de acord cu acești
                  termeni, vă rugăm să nu utilizați serviciile noastre.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Acești termeni constituie un contract legal între dumneavoastră (utilizatorul) și
                  primariaTa. Utilizarea continuă a platformei reprezintă acceptarea termenilor și
                  condițiilor actualizate. Vă recomandăm să revizuiți periodic această pagină pentru
                  a fi la curent cu orice modificări.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <FileText className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">2. Descrierea Serviciului</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  primariaTa este o platformă digitală care facilitează interacțiunea dintre
                  cetățeni și administrația publică locală. Serviciile includ:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  {[
                    "Accesarea informațiilor publice locale",
                    "Completarea și trimiterea de cereri și formulare",
                    "Urmărirea statusului cererilor",
                    "Comunicare directă cu instituțiile publice",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Users className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">
                  3. Înregistrarea și Utilizarea Contului
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Pentru a utiliza anumite funcționalități ale platformei, trebuie să vă creați un
                  cont. Prin crearea unui cont, vă angajați să:
                </p>
                <ul className="text-muted-foreground mb-4 space-y-2">
                  {[
                    "Furnizați informații corecte, complete și actualizate despre identitatea dumneavoastră",
                    "Mențineți securitatea parolei și a credențialelor de autentificare",
                    "Notificați imediat echipa primariaTa despre orice utilizare neautorizată a contului",
                    "Nu partajați contul cu alte persoane sau entități",
                    "Nu creați conturi false sau multiple pentru aceeași persoană",
                    "Actualizați prompt informațiile de contact în cazul modificărilor",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sunteți responsabil pentru toate activitățile desfășurate prin contul
                  dumneavoastră. Ne rezervăm dreptul de a suspenda sau închide conturile care
                  încalcă acești termeni.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Lock className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">4. Protecția Datelor</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Colectăm și procesăm datele dvs. personale în conformitate cu{" "}
                  <Link
                    href="/confidentialitate"
                    className="text-primary font-medium hover:underline"
                  >
                    Politica de Confidențialitate
                  </Link>
                  . Datele sunt utilizate exclusiv pentru furnizarea serviciilor și îmbunătățirea
                  experienței utilizatorilor.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 - Utilizare Responsabilă */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Scale className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">
                  5. Utilizarea Responsabilă și Conduita Utilizatorilor
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Platforma trebuie utilizată conform legislației în vigoare. Prin utilizarea
                  serviciilor noastre, vă angajați să nu desfășurați următoarele activități:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  {[
                    "Încărcarea sau transmiterea de conținut ilegal, obscen, defăimător sau care încalcă drepturile altora",
                    "Utilizarea platformei pentru activități frauduloase sau înșelătoare",
                    "Încercarea de a accesa neautorizat sisteme, servere sau rețele",
                    "Distribuirea de malware, viruși sau cod dăunător",
                    "Hărțuirea, amenințarea sau intimidarea altor utilizatori",
                    "Interferarea cu funcționarea normală a platformei",
                    "Colectarea datelor altor utilizatori fără consimțământ",
                    "Utilizarea platformei pentru spam sau publicitate nesolicită",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6 - Limitare Răspundere */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <AlertTriangle className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">6. Limitarea Răspunderii</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Platforma este furnizată &ldquo;în starea în care se află&rdquo; (AS-IS) fără
                  garanții de niciun fel, exprese sau implicite. În limitele permise de lege:
                </p>
                <ul className="text-muted-foreground mb-4 space-y-2">
                  {[
                    "Nu garantăm că serviciile vor fi neîntrerupte, fără erori sau disponibile permanent",
                    "Nu suntem responsabili pentru pierderi de date rezultate din probleme tehnice",
                    "Nu garantăm acuratețea, completitudinea sau utilitatea informațiilor furnizate",
                    "Nu răspundem pentru daunele indirecte, incidentale sau consecințiale",
                    "Limitele de răspundere se aplică în măsura permisă de legislația în vigoare",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  În cazul unor probleme tehnice, ne angajăm să depunem eforturi rezonabile pentru
                  restabilirea serviciilor în cel mai scurt timp posibil.
                </p>
              </div>
            </div>
          </div>

          {/* Section 7 - Proprietate Intelectuală */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <BookOpen className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">7. Proprietate Intelectuală</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Tot conținutul, designul, logotipurile, mărcile comerciale și alte materiale
                  prezente pe platformă sunt protejate de legile privind proprietatea intelectuală.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Utilizatorii primesc o licență limitată, non-exclusivă și revocabilă de a accesa
                  și utiliza platforma pentru scopurile personale, non-comerciale. Orice altă
                  utilizare necesită acordul nostru scris prealabil.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Conținutul generat de utilizatori rămâne proprietatea acestora, dar prin
                  încărcarea pe platformă, acordați primariaTa o licență de a utiliza, modifica și
                  distribui acest conținut în scopul furnizării serviciilor.
                </p>
              </div>
            </div>
          </div>

          {/* Section 8 - Modificări Termeni */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <RefreshCw className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">
                  8. Modificări ale Termenilor și Condițiilor
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Ne rezervăm dreptul de a modifica acești termeni și condiții în orice moment.
                  Modificările vor fi publicate pe această pagină cu data actualizării.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Pentru modificări semnificative, vom încerca să vă notificăm prin email sau
                  printr-o notificare vizibilă pe platformă. Utilizarea continuă a serviciilor după
                  publicarea modificărilor constituie acceptarea acestora.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dacă nu sunteți de acord cu modificările, vă rugăm să încetați utilizarea
                  platformei și să ne contactați pentru închiderea contului.
                </p>
              </div>
            </div>
          </div>

          {/* Section 9 - Reziliere */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <AlertTriangle className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">9. Rezilierea Contului</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Puteți închide contul în orice moment prin accesarea setărilor de cont sau
                  contactându-ne direct. Ne rezervăm dreptul de a suspenda sau închide conturile
                  care:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  {[
                    "Încalcă acești termeni și condiții",
                    "Sunt utilizate pentru activități ilegale sau frauduloase",
                    "Au rămas inactive pentru o perioadă îndelungată",
                    "Prezintă un risc pentru securitatea platformei sau a altor utilizatori",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 10 - Jurisdicție */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Scale className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">10. Legea Aplicabilă și Jurisdicție</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Acești termeni și condiții sunt guvernați de legile României. Orice litigiu
                  rezultat din utilizarea platformei va fi soluționat de instanțele competente din
                  România.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  În cazul în care anumite prevederi ale acestor termeni sunt considerate invalide
                  sau inaplicabile, celelalte prevederi rămân în vigoare.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-muted/50 mt-8 rounded-lg p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold">Ai întrebări?</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            Pentru întrebări sau nelămuriri legate de acești termeni, ne poți contacta la:
          </p>
          <a
            href="mailto:contact@primariata.ro"
            className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
          >
            contact@primariata.ro
          </a>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/confidentialitate"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            Politica de Confidențialitate
            <ArrowLeft className="size-4 rotate-180" />
          </Link>
          <Link
            href="/auth/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Înapoi la înregistrare
          </Link>
        </div>
      </div>
    </div>
  );
}
