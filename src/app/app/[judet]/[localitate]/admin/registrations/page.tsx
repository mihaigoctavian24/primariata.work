"use client";

import { use, useState, useEffect } from "react";
import { RegistrationQueue } from "@/components/admin/RegistrationQueue";
import { createClient } from "@/lib/supabase/client";

interface Props {
  params: Promise<{ judet: string; localitate: string }>;
}

export default function AdminRegistrationsPage({ params }: Props) {
  const { judet, localitate } = use(params);
  const [primarieId, setPrimarieId] = useState<string | null>(null);

  useEffect(() => {
    async function resolve(): Promise<void> {
      const supabase = createClient();
      const { data } = await supabase
        .from("primarii")
        .select("id, localitati!inner(slug, judete!inner(slug))")
        .eq("localitati.slug", localitate)
        .eq("localitati.judete.slug", judet)
        .eq("activa", true)
        .single();
      if (data) setPrimarieId(data.id);
    }
    resolve();
  }, [judet, localitate]);

  if (!primarieId) return null;

  return <RegistrationQueue judet={judet} localitate={localitate} primarieId={primarieId} />;
}
