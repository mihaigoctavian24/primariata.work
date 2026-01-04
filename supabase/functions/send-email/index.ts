// =====================================================
// Edge Function: send-email
// =====================================================
// Purpose: Send email notifications for cereri events using SendGrid
// Triggered by: Database triggers, API calls, or Realtime webhooks
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Types
interface EmailRequest {
  type:
    | "cerere_submitted"
    | "status_changed"
    | "cerere_finalizata"
    | "cerere_respinsa"
    | "payment_initiated"
    | "payment_completed"
    | "payment_failed"
    | "document_signed"
    | "batch_signature_completed"
    | "welcome"
    | "password_reset"
    | "weekly_digest";
  cerereId?: string;
  toEmail: string;
  toName: string;
  // Payment-specific fields
  plataId?: string;
  // Signature-specific fields
  transactionId?: string;
  sessionId?: string; // For batch signatures
  // Auth-specific fields
  resetLink?: string;
  // Weekly digest fields
  cererePending?: number;
  cerereInProgress?: number;
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

interface SendGridMessage {
  to: { email: string; name: string };
  from: { email: string; name: string };
  subject: string;
  text: string;
  html: string;
}

// SendGrid API
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@primariata.work";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Primăriata";
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
    const body = (await req.json()) as EmailRequest;
    const { type, cerereId, plataId, transactionId, sessionId, toEmail, toName } = body;

    // Validate request
    if (!type || !toEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, toEmail" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!SENDGRID_API_KEY) {
      return new Response(JSON.stringify({ error: "SendGrid API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine which data to fetch based on email type
    const isPaymentEmail = ["payment_initiated", "payment_completed", "payment_failed"].includes(
      type
    );
    const isSignatureEmail = ["document_signed", "batch_signature_completed"].includes(type);
    const isCerereEmail = !isPaymentEmail && !isSignatureEmail;

    // Initialize data variables
    let cerere: CerereData | null = null;
    let plata: PlataData | null = null;
    let signature: SignatureData | null = null;
    let tipCerereNume = "Cerere";

    // Fetch appropriate data based on email type
    if (isCerereEmail && cerereId) {
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
    } else if (isPaymentEmail && plataId) {
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

      // For payment_completed, fetch chitanta to get numar_chitanta
      if (type === "payment_completed") {
        const { data: chitantaData } = await supabase
          .from("chitante")
          .select("numar_chitanta")
          .eq("plata_id", plataId)
          .single();

        if (chitantaData) {
          plata.numar_chitanta = chitantaData.numar_chitanta;
        }
      }
    } else if (isSignatureEmail && transactionId) {
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
      return new Response(JSON.stringify({ error: "Missing required ID for email type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build email message
    const message = buildEmailMessage(
      type,
      toEmail,
      toName,
      cerere,
      tipCerereNume,
      plata,
      signature,
      sessionId
    );

    // Send via SendGrid
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: message.to.email, name: message.to.name }],
            subject: message.subject,
          },
        ],
        from: { email: message.from.email, name: message.from.name },
        content: [
          { type: "text/plain", value: message.text },
          { type: "text/html", value: message.html },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("SendGrid error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email", details: error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// =====================================================
// Email Message Builder
// =====================================================

function buildEmailMessage(
  type: EmailRequest["type"],
  toEmail: string,
  toName: string,
  cerere: CerereData | null = null,
  tipCerereNume: string = "Cerere",
  plata: PlataData | null = null,
  signature: SignatureData | null = null,
  sessionId?: string
): SendGridMessage {
  // Status labels in Romanian
  const statusLabels: Record<string, string> = {
    depusa: "Depusă",
    in_verificare: "În verificare",
    info_suplimentare: "Informații suplimentare necesare",
    in_procesare: "În procesare",
    aprobata: "Aprobată",
    respinsa: "Respinsă",
    anulata: "Anulată",
    finalizata: "Finalizată",
  };

  const paymentStatusLabels: Record<string, string> = {
    pending: "În așteptare",
    completed: "Finalizată",
    failed: "Eșuată",
    cancelled: "Anulată",
  };

  switch (type) {
    case "cerere_submitted": {
      if (!cerere) throw new Error("Cerere data required for cerere_submitted email");
      const cerereLink = `${APP_URL}/app/cereri/${cerere.id}`;
      const tipCerere = tipCerereNume || "Cerere";
      const numarCerere = cerere.numar_inregistrare || "Fără număr";

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `Cerere depusă: ${numarCerere}`,
        text: buildTextTemplate("cerere_submitted", {
          toName,
          tipCerere,
          numarCerere,
          cerereLink,
        }),
        html: buildHtmlTemplate("cerere_submitted", {
          toName,
          tipCerere,
          numarCerere,
          cerereLink,
        }),
      };
    }

    case "status_changed": {
      if (!cerere) throw new Error("Cerere data required for status_changed email");
      const cerereLink = `${APP_URL}/app/cereri/${cerere.id}`;
      const tipCerere = tipCerereNume || "Cerere";
      const numarCerere = cerere.numar_inregistrare || "Fără număr";
      const statusLabel = statusLabels[cerere.status] || cerere.status;

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `Actualizare cerere: ${numarCerere} - ${statusLabel}`,
        text: buildTextTemplate("status_changed", {
          toName,
          tipCerere,
          numarCerere,
          statusLabel,
          cerereLink,
        }),
        html: buildHtmlTemplate("status_changed", {
          toName,
          tipCerere,
          numarCerere,
          statusLabel,
          cerereLink,
        }),
      };
    }

    case "cerere_finalizata": {
      if (!cerere) throw new Error("Cerere data required for cerere_finalizata email");
      const cerereLink = `${APP_URL}/app/cereri/${cerere.id}`;
      const tipCerere = tipCerereNume || "Cerere";
      const numarCerere = cerere.numar_inregistrare || "Fără număr";

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `Cerere finalizată: ${numarCerere}`,
        text: buildTextTemplate("cerere_finalizata", {
          toName,
          tipCerere,
          numarCerere,
          cerereLink,
        }),
        html: buildHtmlTemplate("cerere_finalizata", {
          toName,
          tipCerere,
          numarCerere,
          cerereLink,
        }),
      };
    }

    case "cerere_respinsa": {
      if (!cerere) throw new Error("Cerere data required for cerere_respinsa email");
      const cerereLink = `${APP_URL}/app/cereri/${cerere.id}`;
      const tipCerere = tipCerereNume || "Cerere";
      const numarCerere = cerere.numar_inregistrare || "Fără număr";

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `Cerere respinsă: ${numarCerere}`,
        text: buildTextTemplate("cerere_respinsa", {
          toName,
          tipCerere,
          numarCerere,
          raspuns: cerere.raspuns || "Nu a fost furnizat un motiv.",
          cerereLink,
        }),
        html: buildHtmlTemplate("cerere_respinsa", {
          toName,
          tipCerere,
          numarCerere,
          raspuns: cerere.raspuns || "Nu a fost furnizat un motiv.",
          cerereLink,
        }),
      };
    }

    case "payment_initiated": {
      if (!plata) throw new Error("Plata data required for payment_initiated email");
      const plataLink = `${APP_URL}/app/plati/${plata.id}`;
      const suma = `${plata.suma.toFixed(2)} RON`;

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `Plată inițiată: ${suma}`,
        text: buildTextTemplate("payment_initiated", {
          toName,
          suma,
          plataLink,
        }),
        html: buildHtmlTemplate("payment_initiated", {
          toName,
          suma,
          plataLink,
        }),
      };
    }

    case "payment_completed": {
      if (!plata) throw new Error("Plata data required for payment_completed email");
      const plataLink = `${APP_URL}/app/plati/${plata.id}`;
      const suma = `${plata.suma.toFixed(2)} RON`;
      const numarChitanta = plata.numar_chitanta || "Se va genera în curând";

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `✅ Plată confirmată: ${suma}`,
        text: buildTextTemplate("payment_completed", {
          toName,
          suma,
          numarChitanta,
          plataLink,
        }),
        html: buildHtmlTemplate("payment_completed", {
          toName,
          suma,
          numarChitanta,
          plataLink,
        }),
      };
    }

    case "payment_failed": {
      if (!plata) throw new Error("Plata data required for payment_failed email");
      const plataLink = `${APP_URL}/app/plati/${plata.id}`;
      const suma = `${plata.suma.toFixed(2)} RON`;

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `❌ Plată eșuată: ${suma}`,
        text: buildTextTemplate("payment_failed", {
          toName,
          suma,
          plataLink,
        }),
        html: buildHtmlTemplate("payment_failed", {
          toName,
          suma,
          plataLink,
        }),
      };
    }

    case "document_signed": {
      if (!signature) throw new Error("Signature data required for document_signed email");
      const documentName = signature.document_url.split("/").pop() || "document.pdf";
      const signerName = signature.signer_name;
      const signedDocLink = signature.signed_document_url;

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `✍️ Document semnat: ${documentName}`,
        text: buildTextTemplate("document_signed", {
          toName,
          documentName,
          signerName,
          signedDocLink,
        }),
        html: buildHtmlTemplate("document_signed", {
          toName,
          documentName,
          signerName,
          signedDocLink,
        }),
      };
    }

    case "batch_signature_completed": {
      if (!sessionId) throw new Error("Session ID required for batch_signature_completed email");
      const batchLink = `${APP_URL}/app/semnaturi/${sessionId}`;

      return {
        to: { email: toEmail, name: toName },
        from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
        subject: `✍️ Semnare lot finalizată`,
        text: buildTextTemplate("batch_signature_completed", {
          toName,
          batchLink,
        }),
        html: buildHtmlTemplate("batch_signature_completed", {
          toName,
          batchLink,
        }),
      };
    }

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// =====================================================
// Text Templates (Plain Text)
// =====================================================

function buildTextTemplate(type: string, data: Record<string, string>): string {
  const templates: Record<string, string> = {
    cerere_submitted: `
Bună ziua ${data.toName},

Cererea dumneavoastră de tip "${data.tipCerere}" a fost înregistrată cu succes.

Număr înregistrare: ${data.numarCerere}

Puteți urmări statusul cererii accesând: ${data.cerereLink}

Veți primi notificări pe email la fiecare actualizare a cererii.

Cu stimă,
Echipa Primăriata
    `.trim(),

    status_changed: `
Bună ziua ${data.toName},

Cererea dumneavoastră "${data.tipCerere}" (${data.numarCerere}) a fost actualizată.

Status nou: ${data.statusLabel}

Pentru mai multe detalii, accesați: ${data.cerereLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    cerere_finalizata: `
Bună ziua ${data.toName},

Cererea dumneavoastră "${data.tipCerere}" (${data.numarCerere}) a fost finalizată!

Puteți descărca documentele semnate accesând: ${data.cerereLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    cerere_respinsa: `
Bună ziua ${data.toName},

Cererea dumneavoastră "${data.tipCerere}" (${data.numarCerere}) a fost respinsă.

Motiv: ${data.raspuns}

Pentru mai multe informații, accesați: ${data.cerereLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    payment_initiated: `
Bună ziua ${data.toName},

Plata dumneavoastră în valoare de ${data.suma} a fost inițiată cu succes.

Statusul plății va fi actualizat automat după confirmarea de la procesatorul de plăți.

Pentru mai multe detalii, accesați: ${data.plataLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    payment_completed: `
Bună ziua ${data.toName},

Plata dumneavoastră în valoare de ${data.suma} a fost finalizată cu succes!

Număr chitanță: ${data.numarChitanta}

Puteți descărca chitanța accesând: ${data.plataLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    payment_failed: `
Bună ziua ${data.toName},

Din păcate, plata dumneavoastră în valoare de ${data.suma} a eșuat.

Vă rugăm să încercați din nou sau să contactați banca emitentă pentru mai multe detalii.

Pentru a reîncerca plata, accesați: ${data.plataLink}

Cu stimă,
Echipa Primăriata
    `.trim(),

    document_signed: `
Bună ziua ${data.toName},

Documentul "${data.documentName}" a fost semnat digital cu succes de către ${data.signerName}.

Puteți descărca documentul semnat accesând: ${data.signedDocLink}

Documentul semnat conține toate informațiile despre semnătura digitală aplicată.

Cu stimă,
Echipa Primăriata
    `.trim(),

    batch_signature_completed: `
Bună ziua ${data.toName},

Procesul de semnare în lot a fost finalizat cu succes!

Toate documentele au fost semnate digital și sunt disponibile pentru descărcare.

Pentru mai multe detalii, accesați: ${data.batchLink}

Cu stimă,
Echipa Primăriata
    `.trim(),
  };

  return templates[type] || "";
}

// =====================================================
// HTML Templates
// =====================================================

function buildHtmlTemplate(type: string, data: Record<string, string>): string {
  // Common email layout
  const layout = (content: string) =>
    `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Primăriata</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #be3144 0%, #8b1e2f 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">primariaTa<span style="color: #fca5a5;">❤️</span></h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px;">
                © ${new Date().getFullYear()} Primăriata. Toate drepturile rezervate.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Acest email a fost trimis automat. Pentru asistență, contactați primăria dumneavoastră.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Payment and signature templates
  const paymentInitiatedTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px; font-weight: 600;">Plată inițiată</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Plata dumneavoastră a fost inițiată cu succes.
    </p>
    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sumă</p>
      <p style="margin: 0; color: #18181b; font-size: 20px; font-weight: bold;">${data.suma}</p>
    </div>
    <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Statusul plății va fi actualizat automat după confirmarea de la procesatorul de plăți.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.plataLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi detalii plată</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const paymentCompletedTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #059669; font-size: 24px; font-weight: 600;">✅ Plată confirmată!</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Vă confirmăm că plata dumneavoastră a fost finalizată cu succes!
    </p>
    <div style="background-color: #d1fae5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sumă plătită</p>
      <p style="margin: 0 0 15px 0; color: #047857; font-size: 20px; font-weight: bold;">${data.suma}</p>
      <p style="margin: 0 0 5px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Număr chitanță</p>
      <p style="margin: 0; color: #047857; font-size: 16px; font-weight: 600;">${data.numarChitanta}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.plataLink}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Descarcă chitanță</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const paymentFailedTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 24px; font-weight: 600;">❌ Plată eșuată</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Din păcate, plata dumneavoastră nu a putut fi procesată.
    </p>
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sumă</p>
      <p style="margin: 0; color: #7f1d1d; font-size: 20px; font-weight: bold;">${data.suma}</p>
    </div>
    <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Vă rugăm să încercați din nou sau să contactați banca emitentă pentru mai multe detalii despre eșecul tranzacției.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.plataLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Reîncearcă plata</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const documentSignedTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #059669; font-size: 24px; font-weight: 600;">✍️ Document semnat digital</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Documentul dumneavoastră a fost semnat digital cu succes!
    </p>
    <div style="background-color: #d1fae5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Document</p>
      <p style="margin: 0 0 15px 0; color: #047857; font-size: 18px; font-weight: bold;">${data.documentName}</p>
      <p style="margin: 0 0 5px 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Semnat de</p>
      <p style="margin: 0; color: #047857; font-size: 16px; font-weight: 600;">${data.signerName}</p>
    </div>
    <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Documentul semnat conține toate informațiile despre semnătura digitală aplicată și poate fi verificat în orice moment.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.signedDocLink}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Descarcă document semnat</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const batchSignatureCompletedTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #059669; font-size: 24px; font-weight: 600;">✍️ Semnare lot finalizată!</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Procesul de semnare digitală în lot a fost finalizat cu succes!
    </p>
    <div style="background-color: #d1fae5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin: 25px 0;">
      <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">✓ Toate documentele au fost semnate digital și sunt disponibile pentru descărcare.</p>
    </div>
    <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Fiecare document semnat conține informațiile complete despre semnătura digitală aplicată.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.batchLink}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi toate documentele</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const welcomeTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #059669; font-size: 24px; font-weight: 600;">🎉 Bun venit la Primăriata!</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Vă mulțumim că v-ați creat cont pe platforma Primăriata! Acum puteți gestiona toate cererile dumneavoastră online, rapid și simplu.
    </p>
    <div style="background-color: #d1fae5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin: 25px 0;">
      <p style="margin: 0 0 15px 0; color: #065f46; font-size: 16px; font-weight: 600;">Ce puteți face:</p>
      <ul style="margin: 0; padding-left: 20px; color: #047857;">
        <li style="margin-bottom: 8px;">Depuneți cereri online fără să vizitați primăria</li>
        <li style="margin-bottom: 8px;">Urmăriți statusul cererilor în timp real</li>
        <li style="margin-bottom: 8px;">Plătiți taxele online cu cardul</li>
        <li style="margin-bottom: 8px;">Descărcați documentele semnate digital</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/app" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Acces în cont</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const passwordResetTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #be3144; font-size: 24px; font-weight: 600;">🔐 Resetare parolă</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Am primit o cerere de resetare a parolei pentru contul dumneavoastră Primăriata.
    </p>
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 25px 0;">
      <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">⚠️ IMPORTANT</p>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
        Linkul de resetare este valabil doar 1 oră. Dacă nu ați solicitat resetarea parolei, vă rugăm să ignorați acest email.
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Resetează parola</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const weeklyDigestTemplate = layout(`
    <h2 style="margin: 0 0 20px 0; color: #be3144; font-size: 24px; font-weight: 600;">📊 Raport săptămânal cereri</h2>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
    <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Iată un rezumat al cererilor dumneavoastră active în această săptămână:
    </p>
    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #71717a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">În așteptare</p>
        <p style="margin: 0; color: #f59e0b; font-size: 24px; font-weight: bold;">${data.cererePending || 0}</p>
      </div>
      <div>
        <p style="margin: 0 0 5px 0; color: #71717a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">În procesare</p>
        <p style="margin: 0; color: #3b82f6; font-size: 24px; font-weight: bold;">${data.cerereInProgress || 0}</p>
      </div>
    </div>
    <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
      Pentru a vedea detalii complete despre fiecare cerere, accesați contul dumneavoastră.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/app/cereri" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi toate cererile</a>
    </div>
    <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
      Cu stimă,<br>
      <strong>Echipa Primăriata</strong>
    </p>
  `);

  const templates: Record<string, string> = {
    cerere_submitted: layout(`
      <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px; font-weight: 600;">Cerere înregistrată cu succes!</h2>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Cererea dumneavoastră de tip <strong>${data.tipCerere}</strong> a fost înregistrată cu succes.
      </p>
      <div style="background-color: #f4f4f5; padding: 20px; border-radius: 6px; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Număr înregistrare</p>
        <p style="margin: 0; color: #18181b; font-size: 20px; font-weight: bold;">${data.numarCerere}</p>
      </div>
      <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Veți primi notificări pe email la fiecare actualizare a cererii.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.cerereLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi cererea</a>
      </div>
      <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
        Cu stimă,<br>
        <strong>Echipa Primăriata</strong>
      </p>
    `),

    status_changed: layout(`
      <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px; font-weight: 600;">Actualizare cerere</h2>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Cererea dumneavoastră <strong>${data.tipCerere}</strong> (${data.numarCerere}) a fost actualizată.
      </p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status nou</p>
        <p style="margin: 0; color: #78350f; font-size: 20px; font-weight: bold;">${data.statusLabel}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.cerereLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi detalii</a>
      </div>
      <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
        Cu stimă,<br>
        <strong>Echipa Primăriata</strong>
      </p>
    `),

    cerere_finalizata: layout(`
      <h2 style="margin: 0 0 20px 0; color: #059669; font-size: 24px; font-weight: 600;">🎉 Cerere finalizată!</h2>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Vă informăm cu plăcere că cererea dumneavoastră <strong>${data.tipCerere}</strong> (${data.numarCerere}) a fost finalizată!
      </p>
      <div style="background-color: #d1fae5; padding: 20px; border-radius: 6px; border-left: 4px solid #059669; margin: 25px 0;">
        <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">✓ Documentele semnate sunt disponibile pentru descărcare.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.cerereLink}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Descarcă documente</a>
      </div>
      <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
        Cu stimă,<br>
        <strong>Echipa Primăriata</strong>
      </p>
    `),

    cerere_respinsa: layout(`
      <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 24px; font-weight: 600;">Cerere respinsă</h2>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">Bună ziua <strong>${data.toName}</strong>,</p>
      <p style="margin: 0 0 15px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Din păcate, cererea dumneavoastră <strong>${data.tipCerere}</strong> (${data.numarCerere}) a fost respinsă.
      </p>
      <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 25px 0;">
        <p style="margin: 0 0 10px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Motiv</p>
        <p style="margin: 0; color: #7f1d1d; font-size: 16px; line-height: 1.5;">${data.raspuns}</p>
      </div>
      <p style="margin: 0 0 25px 0; color: #52525b; font-size: 16px; line-height: 1.5;">
        Pentru mai multe informații sau pentru a depune o nouă cerere, vă rugăm să contactați primăria.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.cerereLink}" style="display: inline-block; background-color: #be3144; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Vezi detalii</a>
      </div>
      <p style="margin: 30px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.5;">
        Cu stimă,<br>
        <strong>Echipa Primăriata</strong>
      </p>
    `),

    payment_initiated: paymentInitiatedTemplate,
    payment_completed: paymentCompletedTemplate,
    payment_failed: paymentFailedTemplate,
    document_signed: documentSignedTemplate,
    batch_signature_completed: batchSignatureCompletedTemplate,
    welcome: welcomeTemplate,
    password_reset: passwordResetTemplate,
    weekly_digest: weeklyDigestTemplate,
  };

  return templates[type] || "";
}
