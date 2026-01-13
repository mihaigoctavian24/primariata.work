import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";
import { addSignatureWatermark, validateSignatureOptions } from "@/lib/pdf/signature-watermark";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

interface SignResult {
  cerere_id: string;
  signed_document_url?: string;
  transaction_id?: string;
  status: "success" | "failed";
  error?: string;
}

/**
 * POST /api/mock-certsign/sign/batch
 * Sign multiple PDF documents in a single batch operation
 *
 * Scenario 9: Sign 13 documents in ~30 seconds
 *
 * Request body:
 * - documents: SignRequest[] (Array of documents to sign)
 * - cnp: string (13 digits - signer CNP)
 * - batch_reason?: string (Optional: "Bulk approval", "Monthly batch", etc.)
 *
 * Returns:
 * - session_id: string (Batch session identifier)
 * - results: SignResult[] (Per-document results)
 * - summary: { total: number, succeeded: number, failed: number, duration_ms: number }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentificare necesară",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { documents, cnp, batch_reason } = body;

    // Validate required fields
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_DOCUMENTS",
          message: "Câmpul 'documents' trebuie să fie un array non-vid",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!cnp) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "MISSING_CNP",
          message: "CNP obligatoriu pentru semnare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate CNP format
    if (cnp.length !== 13 || !/^\d{13}$/.test(cnp)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_CNP",
          message: "CNP invalid. CNP trebuie să conțină exact 13 cifre.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch certificate for signer (once for all documents)
    const { data: certificate, error: certError } = await supabase
      .from("mock_certificates")
      .select("id, user_name, cnp, certificate_serial, status, valid_from, valid_until, is_mock")
      .eq("cnp", cnp)
      .single();

    if (certError || !certificate) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_NOT_FOUND",
          message: "Nu există certificat digital pentru acest CNP",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate certificate status
    const now = new Date();
    const validFrom = new Date(certificate.valid_from);
    const validUntil = new Date(certificate.valid_until);

    if (certificate.status !== "active" || now > validUntil || now < validFrom) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_INVALID",
          message: "Certificatul nu este valid pentru semnare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Generate batch session ID
    const sessionId = `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Process each document
    const results: SignResult[] = [];
    const auditLogEntries = [];

    for (const doc of documents) {
      try {
        // Validate document structure
        if (!doc.document_url || !doc.cerere_id) {
          results.push({
            cerere_id: doc.cerere_id || "unknown",
            status: "failed",
            error: "Lipsesc câmpuri obligatorii: document_url sau cerere_id",
          });
          continue;
        }

        // Validate cerere_id is UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(doc.cerere_id)) {
          results.push({
            cerere_id: doc.cerere_id,
            status: "failed",
            error: "cerere_id trebuie să fie UUID valid",
          });
          continue;
        }

        // Fetch cerere to get primarie_id
        const { data: cerere, error: cerereError } = await supabase
          .from("cereri")
          .select("id, primarie_id")
          .eq("id", doc.cerere_id)
          .single();

        if (cerereError || !cerere) {
          results.push({
            cerere_id: doc.cerere_id,
            status: "failed",
            error: "Cererea nu a fost găsită",
          });
          continue;
        }

        // Download unsigned document
        const documentPath = doc.document_url.replace(/^.*\/storage\/v1\/object\/public\//, "");
        const { data: documentData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(documentPath);

        if (downloadError || !documentData) {
          results.push({
            cerere_id: doc.cerere_id,
            status: "failed",
            error: "Nu s-a putut descărca documentul",
          });
          continue;
        }

        // Load and sign PDF
        const arrayBuffer = await documentData.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        const signatureTimestamp = new Date();
        const signatureOptions = {
          signerName: certificate.user_name,
          cnp: certificate.cnp,
          certificateSerial: certificate.certificate_serial,
          timestamp: signatureTimestamp,
          isMock: certificate.is_mock ?? true,
          position: "bottom-right" as const,
        };

        // Validate and add watermark
        const validation = validateSignatureOptions(signatureOptions);
        if (!validation.valid) {
          results.push({
            cerere_id: doc.cerere_id,
            status: "failed",
            error: validation.error || "Opțiuni semnătură invalide",
          });
          continue;
        }

        await addSignatureWatermark(pdfDoc, signatureOptions);

        // Save signed PDF
        const signedPdfBytes = await pdfDoc.save();
        const signedPdfBlob = new Blob([new Uint8Array(signedPdfBytes)], {
          type: "application/pdf",
        });

        // Upload signed document
        const originalFilename = documentPath.split("/").pop() || "document.pdf";
        const signedFilename = originalFilename.replace(".pdf", `_signed_${Date.now()}.pdf`);
        const signedPath = `${cerere.primarie_id}/cereri/${doc.cerere_id}/signed/${signedFilename}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(signedPath, signedPdfBlob, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError || !uploadData) {
          results.push({
            cerere_id: doc.cerere_id,
            status: "failed",
            error: "Nu s-a putut încărca documentul semnat",
          });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(signedPath);
        const signedDocumentUrl = publicUrlData.publicUrl;

        // Generate transaction ID
        const transactionId = `MOCK-SIG-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        // Prepare audit log entry (will be bulk inserted later)
        auditLogEntries.push({
          transaction_id: transactionId,
          session_id: sessionId,
          cerere_id: doc.cerere_id,
          primarie_id: cerere.primarie_id,
          signer_name: certificate.user_name,
          signer_cnp: certificate.cnp,
          certificate_serial: certificate.certificate_serial,
          document_url: doc.document_url,
          signed_document_url: signedDocumentUrl,
          timestamp: signatureTimestamp.toISOString(),
          algorithm: "SHA256withRSA",
          signature_reason: doc.signature_reason || batch_reason || "Semnătură batch",
          status: "success",
          is_mock: certificate.is_mock ?? true,
          created_by: user.id,
          ip_address:
            request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
          user_agent: request.headers.get("user-agent") || null,
        });

        // Add success result
        results.push({
          cerere_id: doc.cerere_id,
          signed_document_url: signedDocumentUrl,
          transaction_id: transactionId,
          status: "success",
        });
      } catch (docError) {
        console.error(`Error signing document for cerere ${doc.cerere_id}:`, docError);
        results.push({
          cerere_id: doc.cerere_id,
          status: "failed",
          error: "Eroare internă la procesare",
        });
      }
    }

    // Calculate summary
    const endTime = Date.now();
    const duration = endTime - startTime;
    const succeededCount = results.filter((r) => r.status === "success").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    // Bulk insert audit log entries
    if (auditLogEntries.length > 0) {
      const { error: auditError } = await supabase
        .from("signature_audit_log")
        .insert(auditLogEntries);
      if (auditError) {
        console.error("Failed to create audit log entries:", auditError);
      }
    }

    // Create batch log entry
    const { error: batchLogError } = await supabase.from("batch_signature_log").insert({
      session_id: sessionId,
      primarie_id: results[0]?.cerere_id ? "unknown" : "unknown", // Will be updated with actual primarie_id from first cerere
      signer_name: certificate.user_name,
      signer_cnp: certificate.cnp,
      total_documents: documents.length,
      succeeded_count: succeededCount,
      failed_count: failedCount,
      duration_ms: duration,
      batch_reason: batch_reason || "Batch signing operation",
      is_mock: certificate.is_mock ?? true,
      created_by: user.id,
    });

    if (batchLogError) {
      console.error("Failed to create batch log entry:", batchLogError);
    }

    // Return batch results
    const response: ApiResponse<{
      session_id: string;
      results: SignResult[];
      summary: {
        total: number;
        succeeded: number;
        failed: number;
        duration_ms: number;
      };
    }> = {
      success: true,
      data: {
        session_id: sessionId,
        results,
        summary: {
          total: documents.length,
          succeeded: succeededCount,
          failed: failedCount,
          duration_ms: duration,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/mock-certsign/sign/batch:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare internă de server",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
