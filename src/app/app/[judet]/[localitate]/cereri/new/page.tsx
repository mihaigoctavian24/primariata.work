import { redirect } from "next/navigation";

interface CereriNewPageProps {
  params: Promise<{ judet: string; localitate: string }>;
}

export default async function CereriNewPage({ params }: CereriNewPageProps): Promise<never> {
  const { judet, localitate } = await params;
  redirect(`/app/${judet}/${localitate}/cereri/wizard`);
}
