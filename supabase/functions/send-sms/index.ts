// =====================================================
// Edge Function: send-sms
// =====================================================
// Purpose: Send SMS notifications for cereri, payments, and signatures using Twilio
// Triggered by: Database triggers, API calls, or Realtime webhooks
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Types
interface SMSRequest {
  type:
    | "cerere_submitted"
    | "status_changed"
    | "cerere_finalizata"
    | "cerere_respinsa"
    | "payment_initiated"
    | "payment_completed"
    | "payment_failed"
    | "document_signed"
    | "batch_signature_completed";
  cerereId?: string;
  plataId?: string;
  transactionId?: string;
  sessionId?: string;
  toPhone: string; // Romanian format: +40XXXXXXXXX
  toName: string;
}

interface CerereData {
  id: string;
  numar_inregistrare: string;
  tip_cerere_id: string;
  status: string;
  created_at: string;
  data_termen?: string;
  raspuns?: string;
  motiv_respingere?: string;
  solicitant_id: string;
}

interface PlataData {
  id: string;
  suma: number;
  status: string;
  created_at: string;
  metoda_plata?: string;
  numar_chitanta?: string;
  cerere_id?: string;
}

interface SignatureData {
  transaction_id: string;
  signer_name: string;
  signer_cnp: string;
  document_url: string;
  signed_document_url: string;
  created_at: string;
  certificate_serial: string;
  is_mock: boolean;
}

// Twilio API
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_PHONE = Deno.env.get("TWILIO_FROM_PHONE") || "+40XXXXXXXXX"; // Replace with actual number
const APP_URL = Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://primariata.work";

// Supabase Admin Client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Parse request
    const body = (await req.json()) as SMSRequest;
    const { type, cerereId, plataId, transactionId, sessionId, toPhone, toName } = body;

    // Validate request
    if (!type || !toPhone) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, toPhone" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate Romanian phone number format
    const phoneRegex = /^\+40[0-9]{9}$/;
    if (!phoneRegex.test(toPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid Romanian phone number format. Expected: +40XXXXXXXXX" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return new Response(JSON.stringify({ error: "Twilio credentials not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine which data to fetch based on SMS type
    const isPaymentSMS = ["payment_initiated", "payment_completed", "payment_failed"].includes(
      type
    );
    const isSignatureSMS = ["document_signed", "batch_signature_completed"].includes(type);
    const isCerereSMS = !isPaymentSMS && !isSignatureSMS;

    // Initialize data variables
    let cerere: CerereData | null = null;
    let plata: PlataData | null = null;
    let signature: SignatureData | null = null;
    let tipCerereNume = "Cerere";

    // Fetch appropriate data based on SMS type
    if (isCerereSMS && cerereId) {
      const { data: cerereData, error: cerereError } = await supabase
        .from("cereri")
        .select(
          `
          id,
          numar_inregistrare,
          status,
          created_at,
          data_termen,
          raspuns,
          motiv_respingere,
          solicitant_id,
          tip_cerere_id
        `
        )
        .eq("id", cerereId)
        .single();

      if (cerereError || !cerereData) {
        return new Response(JSON.stringify({ error: "Cerere not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      cerere = cerereData as unknown as CerereData;

      // Fetch tip_cerere separately
      if (cerere.tip_cerere_id) {
        const { data: tipCerere } = await supabase
          .from("tipuri_cereri")
          .select("nume")
          .eq("id", cerere.tip_cerere_id)
          .single();
        if (tipCerere) {
          tipCerereNume = tipCerere.nume;
        }
      }
    } else if (isPaymentSMS && plataId) {
      const { data: plataData, error: plataError } = await supabase
        .from("plati")
        .select("*")
        .eq("id", plataId)
        .single();

      if (plataError || !plataData) {
        return new Response(JSON.stringify({ error: "Plata not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      plata = plataData as unknown as PlataData;
    } else if (isSignatureSMS && transactionId) {
      const { data: signatureData, error: signatureError } = await supabase
        .from("signature_audit_log")
        .select("*")
        .eq("transaction_id", transactionId)
        .single();

      if (signatureError || !signatureData) {
        return new Response(JSON.stringify({ error: "Signature not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      signature = signatureData as unknown as SignatureData;
    } else {
      return new Response(JSON.stringify({ error: "Missing required ID for SMS type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build SMS message
    const message = buildSMSMessage(
      type,
      toName,
      cerere,
      tipCerereNume,
      plata,
      signature,
      sessionId
    );

    // Send via Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: toPhone,
          From: TWILIO_FROM_PHONE,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Twilio error:", error);
      return new Response(JSON.stringify({ error: "Failed to send SMS", details: error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const twilioResponse = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMS sent successfully",
        sid: twilioResponse.sid,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-sms function:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// =====================================================
// SMS Message Builder
// =====================================================

function buildSMSMessage(
  type: SMSRequest["type"],
  toName: string,
  cerere: CerereData | null = null,
  tipCerereNume: string = "Cerere",
  plata: PlataData | null = null,
  signature: SignatureData | null = null,
  sessionId?: string
): string {
  // Status labels in Romanian
  const statusLabels: Record<string, string> = {
    depusa: "Depusă",
    in_verificare: "În verificare",
    info_suplimentare: "Info suplimentare necesare",
    in_procesare: "În procesare",
    aprobata: "Aprobată",
    respinsa: "Respinsă",
    anulata: "Anulată",
    finalizata: "Finalizată",
  };

  switch (type) {
    case "cerere_submitted": {
      if (!cerere) throw new Error("Cerere data required for cerere_submitted SMS");
      const numarCerere = cerere.numar_inregistrare || "Fără număr";
      return `Primariata: Cerere ${numarCerere} înregistrată cu succes. Urmăriți pe ${APP_URL}`;
    }

    case "status_changed": {
      if (!cerere) throw new Error("Cerere data required for status_changed SMS");
      const numarCerere = cerere.numar_inregistrare || "Fără număr";
      const statusLabel = statusLabels[cerere.status] || cerere.status;
      return `Primariata: Cerere ${numarCerere} actualizată: ${statusLabel}. Detalii pe ${APP_URL}`;
    }

    case "cerere_finalizata": {
      if (!cerere) throw new Error("Cerere data required for cerere_finalizata SMS");
      const numarCerere = cerere.numar_inregistrare || "Fără număr";
      return `Primariata: Cerere ${numarCerere} finalizată! Descărcați documentele de pe ${APP_URL}`;
    }

    case "cerere_respinsa": {
      if (!cerere) throw new Error("Cerere data required for cerere_respinsa SMS");
      const numarCerere = cerere.numar_inregistrare || "Fără număr";
      return `Primariata: Cerere ${numarCerere} respinsă. Motiv pe ${APP_URL}`;
    }

    case "payment_initiated": {
      if (!plata) throw new Error("Plata data required for payment_initiated SMS");
      const suma = `${plata.suma.toFixed(2)} RON`;
      return `Primariata: Plată ${suma} inițiată. Urmăriți statusul pe ${APP_URL}`;
    }

    case "payment_completed": {
      if (!plata) throw new Error("Plata data required for payment_completed SMS");
      const suma = `${plata.suma.toFixed(2)} RON`;
      const numarChitanta = plata.numar_chitanta || "în procesare";
      return `Primariata: Plată ${suma} confirmată! Chitanță ${numarChitanta}. Descărcați de pe ${APP_URL}`;
    }

    case "payment_failed": {
      if (!plata) throw new Error("Plata data required for payment_failed SMS");
      const suma = `${plata.suma.toFixed(2)} RON`;
      return `Primariata: Plată ${suma} eșuată. Reîncercați pe ${APP_URL}`;
    }

    case "document_signed": {
      if (!signature) throw new Error("Signature data required for document_signed SMS");
      const documentName = signature.document_url.split("/").pop() || "document";
      return `Primariata: Document ${documentName} semnat digital. Descărcați de pe ${APP_URL}`;
    }

    case "batch_signature_completed": {
      if (!sessionId) throw new Error("Session ID required for batch_signature_completed SMS");
      return `Primariata: Semnare lot finalizată! Toate documentele disponibile pe ${APP_URL}`;
    }

    default:
      throw new Error(`Unknown SMS type: ${type}`);
  }
}
