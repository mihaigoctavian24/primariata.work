/**
 * PDF Signature Watermark Utility
 *
 * Adds professional-looking digital signature watermarks to PDF documents
 * for mock certSIGN implementation.
 *
 * Note: These are MOCK signatures for development/PoC purposes only.
 * They are NOT legally valid and are clearly labeled as such.
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface SignatureWatermarkOptions {
  signerName: string;
  cnp: string;
  certificateSerial: string;
  timestamp: Date;
  isMock: boolean; // Always true for mock service
  position?: "bottom-right" | "bottom-left" | "top-right" | "custom";
}

/**
 * Add a visual signature watermark to the last page of a PDF document
 *
 * Creates a professional-looking signature box with:
 * - "SEMNAT DIGITAL" header with lock icon
 * - Signer name and masked CNP
 * - Timestamp in Romanian format
 * - Certificate serial number (abbreviated)
 * - Prominent "MOCK" warning in orange
 * - QR code placeholder for future verification
 *
 * @param pdfDoc - The PDF document to sign (loaded with pdf-lib)
 * @param options - Signature details and positioning
 */
export async function addSignatureWatermark(
  pdfDoc: PDFDocument,
  options: SignatureWatermarkOptions
): Promise<void> {
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  if (!lastPage) {
    throw new Error("PDF document has no pages");
  }

  const { width, height } = lastPage.getSize();

  // Signature box dimensions
  const boxWidth = 220;
  const boxHeight = 95;

  // Calculate position based on option
  let boxX: number, boxY: number;

  switch (options.position || "bottom-right") {
    case "bottom-right":
      boxX = width - boxWidth - 25;
      boxY = 25;
      break;
    case "bottom-left":
      boxX = 25;
      boxY = 25;
      break;
    case "top-right":
      boxX = width - boxWidth - 25;
      boxY = height - boxHeight - 25;
      break;
    default:
      boxX = width - boxWidth - 25;
      boxY = 25;
  }

  // Draw signature box background (light blue with border)
  lastPage.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(0.2, 0.4, 0.8), // Blue border
    borderWidth: 2,
    color: rgb(0.95, 0.97, 1), // Light blue background
  });

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Add digital signature icon (using Unicode character)
  lastPage.drawText("🔏", {
    x: boxX + 12,
    y: boxY + boxHeight - 32,
    size: 28,
  });

  // Add "SEMNAT DIGITAL" header
  lastPage.drawText("SEMNAT DIGITAL", {
    x: boxX + 50,
    y: boxY + boxHeight - 25,
    size: 11,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.8),
  });

  // Add signer name
  lastPage.drawText(options.signerName, {
    x: boxX + 50,
    y: boxY + boxHeight - 42,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Add CNP (partially masked for privacy)
  const maskedCNP = `${options.cnp.substring(0, 3)}****${options.cnp.substring(9)}`;
  lastPage.drawText(`CNP: ${maskedCNP}`, {
    x: boxX + 50,
    y: boxY + boxHeight - 55,
    size: 7,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add timestamp in Romanian format
  const formattedDate = options.timestamp.toLocaleString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Bucharest",
  });

  lastPage.drawText(`Data: ${formattedDate}`, {
    x: boxX + 12,
    y: boxY + boxHeight - 68,
    size: 7,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add certificate serial (abbreviated)
  const shortSerial =
    options.certificateSerial.length > 20
      ? `${options.certificateSerial.substring(0, 20)}...`
      : options.certificateSerial;

  lastPage.drawText(`Certificat: ${shortSerial}`, {
    x: boxX + 12,
    y: boxY + boxHeight - 80,
    size: 6,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Add mock warning (prominent)
  if (options.isMock) {
    lastPage.drawRectangle({
      x: boxX + 8,
      y: boxY + 8,
      width: boxWidth - 16,
      height: 14,
      color: rgb(1, 0.95, 0.85), // Light orange background
      borderColor: rgb(1, 0.6, 0),
      borderWidth: 1,
    });

    lastPage.drawText("⚠️  SEMNĂTURĂ MOCK (PoC - NU E VALIDĂ LEGAL)", {
      x: boxX + 14,
      y: boxY + 11,
      size: 6,
      font: boldFont,
      color: rgb(0.8, 0.3, 0), // Orange-red text
    });
  }

  // Add verification QR code placeholder (future enhancement)
  // For now, just add a small square indicating where QR would go
  lastPage.drawRectangle({
    x: boxX + boxWidth - 45,
    y: boxY + boxHeight - 75,
    width: 35,
    height: 35,
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  lastPage.drawText("QR", {
    x: boxX + boxWidth - 36,
    y: boxY + boxHeight - 62,
    size: 8,
    font: italicFont,
    color: rgb(0.5, 0.5, 0.5),
  });
}

/**
 * Helper to validate signature options before applying watermark
 */
export function validateSignatureOptions(options: SignatureWatermarkOptions): {
  valid: boolean;
  error?: string;
} {
  if (!options.signerName || options.signerName.length === 0) {
    return { valid: false, error: "Signer name is required" };
  }

  if (!options.cnp || options.cnp.length !== 13) {
    return { valid: false, error: "CNP must be exactly 13 digits" };
  }

  if (!options.certificateSerial || options.certificateSerial.length === 0) {
    return { valid: false, error: "Certificate serial is required" };
  }

  if (!options.timestamp || !(options.timestamp instanceof Date)) {
    return { valid: false, error: "Valid timestamp is required" };
  }

  return { valid: true };
}
