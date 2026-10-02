import { Injectable } from "@nestjs/common";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import PDFDocument from "pdfkit";

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

  async generateContractPdf(params: {
    contractNumber: string;
    companyName: string;
    ownerName: string;
    tenantName: string;
    propertyName: string;
    propertyAddress: string;
    startDate: Date;
    endDate: Date;
    rentAmount: number | string;
    deposit: number | string;
    advance: number | string;
    specialConditions?: string | null;
  }): Promise<string> {
    const dir = join(UPLOAD_DIR, "contracts");
    ensureDir(dir);
    const filename = `${params.contractNumber}.pdf`;
    const filePath = join(dir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).fillColor("#0B1F3A").text(params.companyName, { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#111827").text("CONTRAT DE BAIL", { align: "left" });
    doc.fontSize(10).fillColor("#6B7280").text(`N° ${params.contractNumber}`);
    doc.moveDown();

    doc.fontSize(11).fillColor("#111827");
    doc.text(`Entre le bailleur : ${params.ownerName}`);
    doc.text(`Et le locataire : ${params.tenantName}`);
    doc.moveDown();
    doc.text(`Bien loué : ${params.propertyName} — ${params.propertyAddress}`);
    doc.text(`Durée : du ${formatDate(params.startDate)} au ${formatDate(params.endDate)}`);
    doc.moveDown();
    doc.text(`Loyer mensuel : ${formatXOF(params.rentAmount)}`);
    doc.text(`Caution : ${formatXOF(params.deposit)}`);
    doc.text(`Avance : ${formatXOF(params.advance)}`);

    if (params.specialConditions) {
      doc.moveDown();
      doc.text("Conditions particulières :");
      doc.text(params.specialConditions);
    }

    doc.moveDown(3);
    doc.text("Signature bailleur : ______________________", { continued: false });
    doc.moveDown();
    doc.text("Signature locataire : ______________________");

    doc.end();

    await new Promise<void>((resolve) => stream.on("finish", () => resolve()));
    return `/uploads/contracts/${filename}`;
  }
}
