/**
 * PDF Receipt Generator
 *
 * Generates official-looking PDF receipts (chitante) with:
 * - Romanian diacritics support via embedded Roboto font
 * - QR code for verification
 * - Primarie branding (name, address, CUI)
 * - Payment details and citizen information
 */

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { robotoNormalBase64 } from "./fonts/roboto-normal";
import { robotoBoldBase64 } from "./fonts/roboto-bold";

export interface ReceiptData {
  numarChitanta: string;
  suma: number;
  dataEmitere: Date;
  primarieName: string;
  primarieAdresa: string;
  primarieCui: string;
  primarieEmail: string;
  primarieTelefon: string;
  cetateanNume: string;
  cerereNumar: string;
  cerereType: string;
  cerereDescriere: string;
  metodaPlata: string;
  verificationUrl: string;
}

/**
 * Register Roboto fonts with jsPDF for Romanian diacritics support.
 */
function registerFonts(doc: jsPDF): void {
  doc.addFileToVFS("Roboto-Regular.ttf", robotoNormalBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

  doc.addFileToVFS("Roboto-Bold.ttf", robotoBoldBase64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
}

/**
 * Format a number as Romanian currency (LEI)
 */
function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} LEI`;
}

/**
 * Format date in Romanian format
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate a PDF receipt with Romanian diacritics and QR code.
 *
 * @param data - Receipt data including primarie info, payment details, and citizen info
 * @returns PDF as Uint8Array
 */
export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  registerFonts(doc);
  doc.setFont("Roboto", "normal");

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // === HEADER: Primarie branding ===
  doc.setFont("Roboto", "bold");
  doc.setFontSize(16);
  doc.text(data.primarieName, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.text(data.primarieAdresa, pageWidth / 2, y, { align: "center" });
  y += 5;

  const contactLine = [
    data.primarieCui !== "N/A" ? `CUI: ${data.primarieCui}` : null,
    data.primarieEmail ? `Email: ${data.primarieEmail}` : null,
    data.primarieTelefon ? `Tel: ${data.primarieTelefon}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  if (contactLine) {
    doc.text(contactLine, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  // Horizontal line
  y += 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === TITLE ===
  doc.setFont("Roboto", "bold");
  doc.setFontSize(20);
  doc.text("CHITANȚĂ DE PLATĂ", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Receipt number and date
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  doc.text(`Nr. chitanță: ${data.numarChitanta}`, margin, y);
  doc.text(`Data: ${formatDate(data.dataEmitere)}`, pageWidth - margin, y, { align: "right" });
  y += 8;

  // Separator
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === PAYMENT DETAILS TABLE ===
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.text("Detalii plată", margin, y);
  y += 8;

  const drawRow = (label: string, value: string, bold = false): void => {
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.text(label, margin + 2, y);
    doc.setFont("Roboto", bold ? "bold" : "normal");
    doc.text(value, margin + 55, y);
    y += 6;
  };

  drawRow("Nr. cerere:", data.cerereNumar);
  drawRow("Tip cerere:", data.cerereType);
  if (data.cerereDescriere) {
    // Handle long descriptions with text wrapping
    doc.setFont("Roboto", "bold");
    doc.setFontSize(10);
    doc.text("Descriere:", margin + 2, y);
    doc.setFont("Roboto", "normal");
    const descLines = doc.splitTextToSize(data.cerereDescriere, contentWidth - 57);
    doc.text(descLines, margin + 55, y);
    y += 6 * Math.max(1, descLines.length);
  }
  drawRow("Metodă plată:", data.metodaPlata);

  y += 2;

  // Amount highlight box
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(70, 130, 180);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

  doc.setFont("Roboto", "bold");
  doc.setFontSize(13);
  doc.text("Sumă plătită:", margin + 5, y + 9);
  doc.text(formatCurrency(data.suma), pageWidth - margin - 5, y + 9, { align: "right" });
  y += 22;

  // Separator
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === CITIZEN INFO ===
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.text("Plătitor", margin, y);
  y += 7;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  doc.text(data.cetateanNume, margin + 2, y);
  y += 15;

  // === QR CODE (bottom right) ===
  const qrSize = 30; // 30mm x 30mm
  const qrX = pageWidth - margin - qrSize;
  const qrY = 250;

  try {
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.text("Scanați pentru verificare", qrX + qrSize / 2, qrY + qrSize + 4, {
      align: "center",
    });
  } catch {
    // QR generation failed -- continue without QR code
    doc.setFont("Roboto", "normal");
    doc.setFontSize(7);
    doc.text("Verificare: " + data.verificationUrl, qrX, qrY + 5);
  }

  // === FOOTER ===
  doc.setFont("Roboto", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Document generat electronic - nu necesită semnătură și ștampilă", margin, 285);
  doc.text(`Generat la ${formatDate(new Date())} | ${data.primarieName}`, margin, 289);
  doc.setTextColor(0, 0, 0);

  // Return as Uint8Array
  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
