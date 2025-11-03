import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Globe,
  Clock,
  AlertCircle,
  UserCheck,
  FileKey,
  Bell,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | primariaTa",
  description:
    "Politica de confidențialitate și prelucrare a datelor personale pentru platforma primariaTa",
};

export default function ConfidentialitatePage() {
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
            <Shield className="text-primary size-8" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Politica de Confidențialitate
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Ultima actualizare:{" "}
            {new Date().toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
            Respectăm confidențialitatea datelor tale și ne angajăm să le protejăm conform GDPR
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-2xl font-semibold">Ce date colectăm?</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Eye className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium">Date furnizate direct</h3>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Nume complet</li>
                      <li>• Adresă de email</li>
                      <li>• Informații din formulare</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Database className="text-primary size-4" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium">Date colectate automat</h3>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Adresă IP</li>
                      <li>• Tip browser și dispozitiv</li>
                      <li>• Cookie-uri tehnice</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Lock className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">De ce le folosim?</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Datele tale sunt utilizate exclusiv pentru:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Gestionarea contului tău",
                    "Furnizarea serviciilor platformei",
                    "Comunicări importante",
                    "Îmbunătățirea experienței",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rights */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <h2 className="mb-6 text-xl font-semibold">Drepturile Tale (GDPR)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Acces", desc: "Solicitarea datelor tale" },
                { title: "Rectificare", desc: "Corectarea datelor" },
                { title: "Ștergere", desc: "Dreptul de a fi uitat" },
                { title: "Portabilitate", desc: "Export date structurate" },
              ].map((right, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-4">
                  <h3 className="mb-1 font-medium">{right.title}</h3>
                  <p className="text-muted-foreground text-sm">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-6 text-sm">
              Pentru exercitarea drepturilor, contactează-ne la{" "}
              <a
                href="mailto:privacy@primariata.ro"
                className="text-primary font-medium hover:underline"
              >
                privacy@primariata.ro
              </a>
            </p>
          </div>

          {/* Legal Basis */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <FileKey className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">Baza Legală a Prelucrării</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Prelucrăm datele dumneavoastră personale pe următoarele baze legale:
                </p>
                <ul className="text-muted-foreground space-y-3">
                  {[
                    {
                      title: "Consimțământ",
                      desc: "Pentru comunicări marketing și newsletter, prelucrăm datele cu consimțământul explicit",
                    },
                    {
                      title: "Executarea contractului",
                      desc: "Pentru furnizarea serviciilor platformei și gestionarea contului",
                    },
                    {
                      title: "Obligații legale",
                      desc: "Pentru conformarea cu cerințele legale (fiscal, contabil, arhivare)",
                    },
                    {
                      title: "Interes legitim",
                      desc: "Pentru securitatea platformei, prevenirea fraudelor și îmbunătățirea serviciilor",
                    },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-primary/20 mt-1.5 size-1.5 flex-shrink-0 rounded-full" />
                      <div>
                        <span className="font-medium">{item.title}:</span>{" "}
                        <span className="text-sm">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Security & Sharing */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-card/50 rounded-lg p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Globe className="text-primary size-4" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Partajarea Datelor</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Datele sunt partajate doar cu autoritățile publice pentru procesarea cererilor
                    și cu furnizori de servicii esențiali (hosting).
                  </p>
                  <p className="text-primary mt-3 text-sm font-medium">NU vindem datele tale!</p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 rounded-lg p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Lock className="text-primary size-4" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Securitate</h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Criptare SSL/TLS</li>
                    <li>• Hash-uire parolelor</li>
                    <li>• Acces restricționat</li>
                    <li>• Backup regulat</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Retention & International */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-card/50 rounded-lg p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Clock className="text-primary size-4" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Păstrarea Datelor</h3>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li>• Cât timp contul este activ</li>
                    <li>• 90 zile după închidere</li>
                    <li>• Date anonime: indefinit</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-card/50 rounded-lg p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Globe className="text-primary size-4" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Transferuri Internaționale</h3>
                  <p className="text-muted-foreground text-sm">
                    Furnizorii din afara UE (Supabase, Google) respectă GDPR prin clauze
                    contractuale standard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Decision Making */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <UserCheck className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">Luarea Automată a Deciziilor</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  În prezent, platforma noastră nu utilizează procese automate de luare a deciziilor
                  sau profilare care ar produce efecte juridice asupra utilizatorilor.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  În cazul în care vom implementa astfel de funcționalități în viitor, vom solicita
                  consimțământul explicit și vom oferi informații detaliate despre logica utilizată
                  și consecințele potențiale.
                </p>
              </div>
            </div>
          </div>

          {/* Data Breach Notification */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex items-start gap-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Bell className="text-primary size-5" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-semibold">
                  Notificarea Încălcării Securității Datelor
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  În cazul unei încălcări a securității datelor personale care ar putea prezenta un
                  risc ridicat pentru drepturile și libertățile dumneavoastră, ne angajăm să:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  {[
                    "Notificăm ANSPDCP în termen de 72 de ore de la identificarea incidentului",
                    "Vă informăm direct despre incident prin email sau notificare în platformă",
                    "Descriem natura încălcării și consecințele posibile",
                    "Comunicăm măsurile luate sau propuse pentru remediere",
                    "Oferim recomandări pentru minimizarea impactului potențial",
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

          {/* Cookies */}
          <div className="bg-card/50 rounded-lg p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-xl font-semibold">Cookie-uri și Tehnologii Similare</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Folosim cookie-uri și tehnologii similare pentru funcționarea platformei și
              îmbunătățirea experienței utilizatorilor. Tipurile de cookie-uri utilizate:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Cookie-uri esențiale",
                  desc: "Necesare pentru funcționarea de bază a platformei (autentificare, sesiuni)",
                },
                {
                  title: "Cookie-uri de preferințe",
                  desc: "Salvează setările tale (temă, limba, preferințe interfață)",
                },
                {
                  title: "Cookie-uri de performanță",
                  desc: "Ne ajută să înțelegem cum utilizați platforma pentru îmbunătățiri",
                },
                {
                  title: "Cookie-uri de securitate",
                  desc: "Protejează împotriva atacurilor și asigură securitatea contului",
                },
              ].map((item, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3">
                  <h3 className="mb-1 text-sm font-medium">{item.title}</h3>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Nu folosim cookie-uri de tracking terță parte sau publicitate. Puteți gestiona
              preferințele de cookie-uri în setările browserului.
            </p>
          </div>

          {/* Minors */}
          <div className="rounded-lg bg-amber-50 p-6 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="mb-2 font-semibold">Protecția Minorilor</h3>
                <p className="text-muted-foreground text-sm">
                  Platforma nu este destinată persoanelor sub 16 ani. Nu colectăm cu bună știință
                  date de la minori fără consimțământul părinților/tutorilor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact DPO */}
        <div className="bg-muted/50 mt-8 rounded-lg p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold">Contact</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm">
                Responsabil Protecția Datelor (DPO)
              </h4>
              <div className="space-y-2">
                <a
                  href="mailto:dpo@primariata.ro"
                  className="text-primary flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  dpo@primariata.ro
                </a>
                <a
                  href="tel:+40123456789"
                  className="text-primary flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  +40 123 456 789
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm">Autoritate de Supraveghere</h4>
              <p className="mb-2 text-sm">ANSPDCP</p>
              <a
                href="https://www.dataprotection.ro"
                className="text-primary text-sm font-medium hover:underline"
              >
                www.dataprotection.ro
              </a>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/termeni"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" />
            Termeni și Condiții
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
