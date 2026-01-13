import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NextStep, NextStepType } from "@/types/dashboard";

/**
 * GET /api/dashboard/next-steps
 *
 * Returns intelligent next step recommendations based on:
 * - Draft cereri (complete them)
 * - Missing documents (upload them)
 * - Pending payments (pay them)
 * - Approved cereri (download documents)
 * - Feedback requests
 * - Status updates to review
 *
 * Response format:
 * {
 *   success: true,
 *   data: NextStep[]
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const steps: NextStep[] = [];

    // 1. Check for draft cereri
    const { data: drafts } = await supabase
      .from("cereri")
      .select("id, numar_inregistrare, created_at")
      .eq("solicitant_id", user.id)
      .eq("status", "draft")
      .limit(5);

    if (drafts && drafts.length > 0) {
      drafts.forEach((draft, index: number) => {
        steps.push({
          id: `complete-draft-${draft.id}`,
          type: "complete_draft" as NextStepType,
          priority: 3 + index, // Lower priority than urgent actions
          title: `Completează cererea ${draft.numar_inregistrare}`,
          description: "Cerere în ciornă - finalizează și trimite către primărie",
          action_url: `/cereri/${draft.id}`,
          action_label: "Completează",
          metadata: { cerere_id: draft.id },
        });
      });
    }

    // 2. Check for missing documents
    const { data: cereriWithMissingDocs } = await supabase
      .from("cereri")
      .select(
        `
        id,
        numar_inregistrare,
        documente:documente(count)
      `
      )
      .eq("solicitant_id", user.id)
      .in("status", ["depusa", "in_verificare"])
      .limit(3);

    if (cereriWithMissingDocs) {
      cereriWithMissingDocs.forEach((cerere, index: number) => {
        // Simplified check - in real implementation, check required vs uploaded docs
        steps.push({
          id: `upload-docs-${cerere.id}`,
          type: "upload_documents" as NextStepType,
          priority: 2 + index, // High priority
          title: `Încarcă documente pentru ${cerere.numar_inregistrare}`,
          description: "Documente necesare pentru procesarea cererii",
          action_url: `/cereri/${cerere.id}/documents`,
          action_label: "Încarcă Documente",
          metadata: { cerere_id: cerere.id },
        });
      });
    }

    // 3. Check for pending payments
    const { data: pendingPayments } = await supabase
      .from("plati")
      .select("id, suma, cerere_id, created_at")
      .is("utilizator_id", null) // plati table doesn't have utilizator_id in schema
      .in("status", ["pending", "processing"])
      .limit(3);

    if (pendingPayments && pendingPayments.length > 0) {
      pendingPayments.forEach((payment, index: number) => {
        steps.push({
          id: `pay-pending-${payment.id}`,
          type: "pay_pending" as NextStepType,
          priority: 1 + index, // Highest priority
          title: `Plătește ${payment.suma} RON`,
          description: "Plată în așteptare - finalizează pentru a continua procesarea",
          action_url: `/plati/${payment.id}`,
          action_label: "Plătește Acum",
          deadline: new Date(
            new Date(payment.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days deadline
          metadata: { payment_id: payment.id, amount: payment.suma },
        });
      });
    }

    // 4. Check for approved cereri with downloadable documents
    const { data: approvedCereri } = await supabase
      .from("cereri")
      .select("id, numar_inregistrare")
      .eq("solicitant_id", user.id)
      .eq("status", "aprobat")
      .limit(3);

    if (approvedCereri && approvedCereri.length > 0) {
      approvedCereri.forEach((cerere, index: number) => {
        steps.push({
          id: `download-approved-${cerere.id}`,
          type: "download_approved" as NextStepType,
          priority: 4 + index,
          title: `Descarcă documentele pentru ${cerere.numar_inregistrare}`,
          description: "Cerere aprobată - documentele tale sunt gata",
          action_url: `/cereri/${cerere.id}/download`,
          action_label: "Descarcă",
          metadata: { cerere_id: cerere.id },
        });
      });
    }

    // 5. Check for cereri that need feedback (completed recently)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentCompleted } = await supabase
      .from("cereri")
      .select("id, numar_inregistrare, updated_at")
      .eq("solicitant_id", user.id)
      .in("status", ["aprobat", "respins"])
      .gte("updated_at", thirtyDaysAgo.toISOString())
      .limit(2);

    if (recentCompleted && recentCompleted.length > 0) {
      recentCompleted.forEach((cerere, index: number) => {
        steps.push({
          id: `feedback-${cerere.id}`,
          type: "provide_feedback" as NextStepType,
          priority: 6 + index,
          title: `Oferă feedback pentru ${cerere.numar_inregistrare}`,
          description: "Ajută-ne să îmbunătățim serviciile - durează 2 minute",
          action_url: `/cereri/${cerere.id}/feedback`,
          action_label: "Oferă Feedback",
          metadata: { cerere_id: cerere.id },
        });
      });
    }

    // 6. Check for status updates (cereri updated in last 7 days but not viewed)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentlyUpdated } = await supabase
      .from("cereri")
      .select("id, numar_inregistrare, status, updated_at")
      .eq("solicitant_id", user.id)
      .in("status", ["in_verificare", "in_asteptare", "in_aprobare"])
      .gte("updated_at", sevenDaysAgo.toISOString())
      .limit(2);

    if (recentlyUpdated && recentlyUpdated.length > 0) {
      recentlyUpdated.forEach((cerere, index: number) => {
        steps.push({
          id: `review-status-${cerere.id}`,
          type: "review_status" as NextStepType,
          priority: 5 + index,
          title: `Verifică statusul pentru ${cerere.numar_inregistrare}`,
          description: "Actualizare recentă - vezi ce s-a schimbat",
          action_url: `/cereri/${cerere.id}`,
          action_label: "Vezi Status",
          metadata: { cerere_id: cerere.id },
        });
      });
    }

    // Sort by priority (lower number = higher priority)
    steps.sort((a, b) => a.priority - b.priority);

    return NextResponse.json({
      success: true,
      data: steps,
    });
  } catch (error) {
    console.error("Unexpected error in next-steps:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
