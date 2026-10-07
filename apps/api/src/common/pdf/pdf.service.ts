import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { ContractBlock, ContractDocumentData, buildContractBlocks } from "../documents/contract-builder";
import { StorageService } from "../../storage/storage.service";

function formatXOF(amount: number | string) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(amount)))} FCFA`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

const BRAND_PRIMARY = "#0B5FFF";
const BRAND_PRIMARY_DARK = "#0B1F3A";
const INK = "#111827";
const INK_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const SUCCESS_BG = "#ECFDF5";
const SUCCESS_BORDER = "#86EFAC";
const SUCCESS = "#15803D";

/** Dessine la marque IVOLOGIS (deux parcelles superposées) en vecteur, sans dépendre d'une image. */
function drawBrandMark(doc: PDFKit.PDFDocument, x: number, y: number, size: number, color = "#FFFFFF") {
  const scale = size / 24;
  doc.save();
  doc.translate(x, y).scale(scale);
  doc.roundedRect(9, 5, 10, 10, 2.2).fillOpacity(0.5).fill(color);
  doc.roundedRect(5, 9, 10, 10, 2.2).fillOpacity(1).fill(color);
  doc.restore();
  doc.fillOpacity(1);
}

export function renderPdf(margin: number, build: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin, info: { Producer: "IVOLOGIS" } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    build(doc);
    doc.end();
  });
}

@Injectable()
export class PdfService {
  constructor(private storage: StorageService) {}

  async generateReceiptPdf(params: {
    receiptNumber: string;
    companyName: string;
    companyAddress?: string | null;
    companyEmail?: string | null;
    companyPhone?: string | null;
    tenantName: string;
    propertyName: string;
    propertyAddress: string;
    amount: number | string;
    periodMonth: Date;
    paymentDate: Date;
    method: string;
  }): Promise<string> {
    const MARGIN = 48;
    const HEADER_H = 118;

    const buffer = await renderPdf(MARGIN, (doc) => {
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - MARGIN * 2;

      // --- Bandeau d'en-tête ---
      doc.rect(0, 0, pageWidth, HEADER_H).fill(BRAND_PRIMARY_DARK);
      drawBrandMark(doc, MARGIN, 32, 34);
      doc.fontSize(17).font("Helvetica-Bold").fillColor("#FFFFFF").text(params.companyName, MARGIN + 46, 34);
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillOpacity(0.75)
        .fillColor("#FFFFFF")
        .text(params.companyAddress || "Abidjan, Côte d'Ivoire", MARGIN + 46, 56, { width: contentWidth - 250 });
      doc.fillOpacity(1);

      const rightColWidth = 220;
      const rightColX = pageWidth - MARGIN - rightColWidth;
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#FFFFFF")
        .text("QUITTANCE DE LOYER", rightColX, 34, { width: rightColWidth, align: "right" });
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillOpacity(0.75)
        .fillColor("#FFFFFF")
        .text(`N° ${params.receiptNumber}`, rightColX, 52, { width: rightColWidth, align: "right" })
        .text(`Émise le ${formatDate(new Date())}`, rightColX, 65, { width: rightColWidth, align: "right" });
      doc.fillOpacity(1);

      // --- Carte d'informations ---
      const cardY = HEADER_H + 28;
      const cardPad = 20;
      const rowGap = 30;
      const rows: [string, string][] = [
        ["Locataire", params.tenantName],
        ["Bien concerné", `${params.propertyName}, ${params.propertyAddress}`],
        ["Période concernée", formatDate(params.periodMonth)],
        ["Date de paiement", formatDate(params.paymentDate)],
        ["Moyen de paiement", params.method],
      ];
      const cardH = cardPad * 2 + rowGap * rows.length - 10;
      doc.roundedRect(MARGIN, cardY, contentWidth, cardH, 10).fillAndStroke("#F8FAFC", BORDER);

      rows.forEach(([label, value], i) => {
        const y = cardY + cardPad + i * rowGap;
        doc
          .fontSize(8.5)
          .font("Helvetica-Bold")
          .fillColor(INK_MUTED)
          .text(label.toUpperCase(), MARGIN + cardPad, y, { width: 150, characterSpacing: 0.4 });
        doc
          .fontSize(10.5)
          .font("Helvetica")
          .fillColor(INK)
          .text(value, MARGIN + cardPad + 160, y - 1, { width: contentWidth - cardPad * 2 - 160 });
      });

      // --- Montant payé ---
      const amountY = cardY + cardH + 22;
      const amountH = 70;
      doc.roundedRect(MARGIN, amountY, contentWidth, amountH, 10).fillAndStroke(SUCCESS_BG, SUCCESS_BORDER);
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(SUCCESS)
        .text("MONTANT PAYÉ EN TOTALITÉ", MARGIN, amountY + 16, { width: contentWidth, align: "center", characterSpacing: 0.6 });
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor(SUCCESS)
        .text(formatXOF(params.amount), MARGIN, amountY + 32, { width: contentWidth, align: "center" });

      // --- Pied de page ---
      const footerY = amountY + amountH + 30;
      doc.moveTo(MARGIN, footerY).lineTo(pageWidth - MARGIN, footerY).lineWidth(0.5).strokeColor(BORDER).stroke();
      const contactLine = [params.companyAddress, params.companyPhone, params.companyEmail].filter(Boolean).join("  ·  ");
      doc
        .fontSize(8.5)
        .font("Helvetica")
        .fillColor(INK_MUTED)
        .text(contactLine, MARGIN, footerY + 12, { width: contentWidth, align: "center" });
      doc
        .fontSize(8)
        .fillColor(INK_MUTED)
        .text(
          "Ce document atteste du paiement du loyer pour la période mentionnée ci-dessus. Document généré automatiquement.",
          MARGIN,
          footerY + 26,
          { width: contentWidth, align: "center" },
        );

      doc.rect(0, doc.page.height - 6, pageWidth, 6).fill(BRAND_PRIMARY);
    });

    return this.storage.save({
      buffer,
      filename: `${params.receiptNumber}.pdf`,
      mimeType: "application/pdf",
    });
  }

  async generateContractPdf(data: ContractDocumentData): Promise<string> {
    const blocks: ContractBlock[] = buildContractBlocks(data);

    const buffer = await renderPdf(56, (doc) => {
      for (const block of blocks) {
        switch (block.kind) {
          case "title":
            doc.fontSize(18).fillColor("#0B1F3A").font("Helvetica-Bold").text(block.text);
            break;
          case "subtitle":
            doc.moveDown(0.3).fontSize(13).fillColor("#111827").font("Helvetica-Bold").text(block.text);
            break;
          case "meta":
            doc.moveDown(0.15).fontSize(9).fillColor("#6B7280").font("Helvetica").text(block.text);
            break;
          case "heading":
            doc.moveDown(0.6).fontSize(11).fillColor("#0B5FFF").font("Helvetica-Bold").text(block.text);
            break;
          case "paragraph":
            doc.moveDown(0.25).fontSize(10.5).fillColor("#111827").font("Helvetica").text(block.text, {
              align: "justify",
              lineGap: 2,
            });
            break;
          case "spacer":
            doc.moveDown(0.5);
            break;
          case "signatures": {
            doc.moveDown(1);
            const y = doc.y;
            const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / 2 - 10;
            doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold");
            doc.text(block.left, doc.page.margins.left, y, { width: colWidth });
            doc.text(block.right, doc.page.margins.left + colWidth + 20, y, { width: colWidth });
            doc.moveDown(3);
            break;
          }
        }
      }
    });

    return this.storage.save({
      buffer,
      filename: `${data.contractNumber}.pdf`,
      mimeType: "application/pdf",
    });
  }
}
