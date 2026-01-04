import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";
import { addSignatureWatermark, validateSignatureOptions } from "@/lib/pdf/signature-watermark";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * POST /api/mock-certsign/sign
 * Sign a single PDF document with digital signature watermark
 *
 * Request body:
 * - document_url: string (Storage URL of unsigned document)
 * - cerere_id: string (UUID of cerere)
 * - cnp: string (13 digits - signer CNP)
 * - signature_reason?: string (Optional: "Aprobare cerere", "Respingere cerere", etc.)
 *
 * Returns:
 * - signed_document_url: string (Storage URL of signed document)
 * - transaction_id: string (Unique signature transaction ID)
 * - timestamp: string (ISO timestamp of signature)
 * - certificate_serial: string (Signer's certificate serial)
 */
export async function POST(request: NextRequest) {
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
    const { document_url, cerere_id, cnp, signature_reason } = body;

    // Validate required fields
    if (!document_url || !cerere_id || !cnp) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Câmpuri obligatorii lipsă: document_url, cerere_id, cnp",
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

    // Validate cerere_id is UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cerere_id)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_CERERE_ID",
          message: "cerere_id trebuie să fie UUID valid",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch certificate for signer
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

    // Fetch cerere to get primarie_id
    const { data: cerere, error: cerereError } = await supabase
      .from("cereri")
      .select("id, primarie_id")
      .eq("id", cerere_id)
      .single();

    if (cerereError || !cerere) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERERE_NOT_FOUND",
          message: "Cererea nu a fost găsită",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Download unsigned document from Storage
    const documentPath = document_url.replace(/^.*\/storage\/v1\/object\/public\//, "");
    const { data: documentData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(documentPath);

    if (downloadError || !documentData) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DOCUMENT_DOWNLOAD_FAILED",
          message: "Nu s-a putut descărca documentul pentru semnare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Load PDF document
    const arrayBuffer = await documentData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Prepare signature options
    const signatureTimestamp = new Date();
    const signatureOptions = {
      signerName: certificate.user_name,
      cnp: certificate.cnp,
      certificateSerial: certificate.certificate_serial,
      timestamp: signatureTimestamp,
      isMock: certificate.is_mock ?? true,
      position: "bottom-right" as const,
    };

    // Validate signature options
    const validation = validateSignatureOptions(signatureOptions);
    if (!validation.valid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_SIGNATURE_OPTIONS",
          message: validation.error || "Opțiuni semnătură invalide",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Add signature watermark
    await addSignatureWatermark(pdfDoc, signatureOptions);

    // Save signed PDF
    const signedPdfBytes = await pdfDoc.save();
    const signedPdfBlob = new Blob([new Uint8Array(signedPdfBytes)], { type: "application/pdf" });

    // Generate unique filename for signed document
    const originalFilename = documentPath.split("/").pop() || "document.pdf";
    const signedFilename = originalFilename.replace(".pdf", `_signed_${Date.now()}.pdf`);
    const signedPath = `${cerere.primarie_id}/cereri/${cerere_id}/signed/${signedFilename}`;

    // Upload signed document to Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(signedPath, signedPdfBlob, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError || !uploadData) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: "Nu s-a putut încărca documentul semnat",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Get public URL for signed document
    const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(signedPath);
    const signedDocumentUrl = publicUrlData.publicUrl;

    // Generate transaction ID
    const transactionId = `MOCK-SIG-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create audit log entry
    const { error: auditError } = await supabase.from("signature_audit_log").insert({
      transaction_id: transactionId,
      cerere_id: cerere_id,
      primarie_id: cerere.primarie_id,
      signer_name: certificate.user_name,
      signer_cnp: certificate.cnp,
      certificate_serial: certificate.certificate_serial,
      document_url: document_url,
      signed_document_url: signedDocumentUrl,
      timestamp: signatureTimestamp.toISOString(),
      algorithm: "SHA256withRSA",
      signature_reason: signature_reason || "Semnătură digitală",
      status: "success",
      is_mock: certificate.is_mock ?? true,
      created_by: user.id,
      ip_address:
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
      user_agent: request.headers.get("user-agent") || null,
    });

    if (auditError) {
      console.error("Failed to create audit log entry:", auditError);
      // Don't fail the request, just log the error
    }

    // Return success response
    const response: ApiResponse<{
      signed_document_url: string;
      transaction_id: string;
      timestamp: string;
      certificate_serial: string;
      signer_name: string;
    }> = {
      success: true,
      data: {
        signed_document_url: signedDocumentUrl,
        transaction_id: transactionId,
        timestamp: signatureTimestamp.toISOString(),
        certificate_serial: certificate.certificate_serial,
        signer_name: certificate.user_name,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store", // Don't cache signature responses
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/mock-certsign/sign:", error);
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
