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
  type: "cerere_submitted" | "status_changed" | "cerere_finalizata" | "cerere_respinsa";
  cerereId: string;
  toEmail: string;
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
    const { type, cerereId, toEmail, toName } = body;

    // Validate request
    if (!type || !cerereId || !toEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, cerereId, toEmail" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!SENDGRID_API_KEY) {
      return new Response(JSON.stringify({ error: "SendGrid API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch cerere data (without join to avoid issues)
    const { data: cerere, error: cerereError } = await supabase
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

    // Fetch tip_cerere separately if cerere exists
    let tipCerereNume = "Cerere";
    if (cerere && cerere.tip_cerere_id) {
      const { data: tipCerere } = await supabase
        .from("tipuri_cereri")
        .select("nume")
        .eq("id", cerere.tip_cerere_id)
        .single();
      if (tipCerere) {
        tipCerereNume = tipCerere.nume;
      }
    }

    if (cerereError || !cerere) {
      return new Response(JSON.stringify({ error: "Cerere not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build email message with tip cerere name
    const message = buildEmailMessage(
      type,
      cerere as unknown as CerereData,
      toEmail,
      toName,
      tipCerereNume
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
  cerere: CerereData,
  toEmail: string,
  toName: string,
  tipCerereNume: string
): SendGridMessage {
  const cerereLink = `${APP_URL}/app/cereri/${cerere.id}`;
  const tipCerere = tipCerereNume || "Cerere";
  const numarCerere = cerere.numar_inregistrare || "Fără număr";

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

  const statusLabel = statusLabels[cerere.status] || cerere.status;

  switch (type) {
    case "cerere_submitted":
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

    case "status_changed":
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

    case "cerere_finalizata":
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

    case "cerere_respinsa":
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
  };

  return templates[type] || "";
}
