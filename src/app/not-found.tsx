import type { Metadata } from "next";
import { NotFoundShowcase } from "@/components/404/NotFoundShowcase";

export const metadata: Metadata = {
  title: "404 - Pagina nu a fost găsită | Primăriața.work",
  description:
    "Se pare că pagina pe care o cauți nu există sau a fost mutată. Explorează design system-ul nostru în timp ce navighezi înapoi acasă.",
  keywords: ["404", "pagina negăsită", "design system", "primăriața", "componente UI"],
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return <NotFoundShowcase />;
}
