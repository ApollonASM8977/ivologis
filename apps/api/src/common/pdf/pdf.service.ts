import { Injectable } from "@nestjs/common";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";
import { ContractBlock, ContractDocumentData, buildContractBlocks } from "../documents/contract-builder";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function formatXOF(amount: number | string) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(Number(amount)))} FCFA`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

@Injectable()
export class PdfService {
  async generateReceiptPdf(params: {
    receiptNumber: string;
    companyName: string;
    tenantName: string;
    propertyName: string;
    propertyAddress: string;
    amount: number | string;
    periodMonth: Date;
    paymentDate: Date;
    method: string;
  }): Promise<string> {
    const dir = join(UPLOAD_DIR, "receipts");
    ensureDir(dir);
    const filename = `${params.receiptNumber}.pdf`;
    const filePath = join(dir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).fillColor("#0B5FFF").text(params.companyName, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#111827").text("QUITTANCE DE LOYER", { align: "left" });
    doc.moveDown();
    doc.fontSize(10).fillColor("#6B7280").text(`N° ${params.receiptNumber}`);
    doc.text(`Émise le ${formatDate(new Date())}`);
    doc.moveDown();

    doc.fontSize(11).fillColor("#111827");
    doc.text(`Locataire : ${params.tenantName}`);
    doc.text(`Bien : ${params.propertyName} — ${params.propertyAddress}`);
    doc.text(`Période concernée : ${formatDate(params.periodMonth)}`);
    doc.text(`Date de paiement : ${formatDate(params.paymentDate)}`);
    doc.text(`Moyen de paiement : ${params.method}`);
    doc.moveDown();

    doc.fontSize(14).fillColor("#16A34A").text(`Montant payé : ${formatXOF(params.amount)}`);
    doc.moveDown(2);

    doc.fontSize(9).fillColor("#6B7280").text(
      "Ce document atteste du paiement du loyer pour la période mentionnée ci-dessus. Document généré automatiquement par IVOLOGIS.",
      { align: "left" },
    );

    doc.end();

    await new Promise<void>((resolve) => stream.on("finish", () => resolve()));
    return `/uploads/receipts/${filename}`;
  }

  async generateContractPdf(data: ContractDocumentData): Promise<string> {
    const dir = join(UPLOAD_DIR, "contracts");
    ensureDir(dir);
    const filename = `${data.contractNumber}.pdf`;
    const filePath = join(dir, filename);

    const doc = new PDFDocument({ margin: 56 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    const blocks: ContractBlock[] = buildContractBlocks(data);

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

    doc.end();

    await new Promise<void>((resolve) => stream.on("finish", () => resolve()));
    return `/uploads/contracts/${filename}`;
  }
}
