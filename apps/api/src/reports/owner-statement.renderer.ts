import {
  MAINTENANCE_ISSUE_LABELS,
  MAINTENANCE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@ivologis/shared";
import { renderPdf } from "../common/pdf/pdf.service";

export interface OwnerStatement {
  owner: { fullName: string } | null;
  summary: {
    totalRevenue: number;
    maintenanceCosts: number;
    commission: number;
    netBalance: number;
  };
  payments: {
    paymentDate: Date;
    amount: unknown;
    method: string;
    property: { name: string } | null;
    tenant: { fullName: string } | null;
  }[];
  maintenance: {
    createdAt: Date;
    issueType: string;
    status: string;
    finalCost: unknown;
    property: { name: string } | null;
  }[];
  companyName: string;
  commissionRate: number;
  generatedAt: Date;
}

const methodLabel = (m: string) => PAYMENT_METHOD_LABELS[m as PaymentMethod] ?? m;
const issueLabel = (t: string) => MAINTENANCE_ISSUE_LABELS[t as keyof typeof MAINTENANCE_ISSUE_LABELS] ?? t;
const statusLabel = (s: string) => MAINTENANCE_STATUS_LABELS[s as keyof typeof MAINTENANCE_STATUS_LABELS] ?? s;
const fr = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));
const date = (d: Date) => new Date(d).toLocaleDateString("fr-FR");

function csvCell(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ownerStatementCsv(st: OwnerStatement): Buffer {
  const rows: unknown[][] = [
    ["Relevé financier", st.companyName],
    ["Propriétaire", st.owner?.fullName ?? ""],
    ["Généré le", new Date(st.generatedAt).toLocaleString("fr-FR")],
    [],
    ["Synthèse"],
    ["Revenus encaissés (FCFA)", Math.round(st.summary.totalRevenue)],
    [`Commission ${st.companyName} (${st.commissionRate} %)`, Math.round(st.summary.commission)],
    ["Dépenses de maintenance (FCFA)", Math.round(st.summary.maintenanceCosts)],
    ["Solde net (FCFA)", Math.round(st.summary.netBalance)],
    [],
    ["Encaissements"],
    ["Date", "Bien", "Locataire", "Moyen", "Montant (FCFA)"],
    ...st.payments.map((p) => [
      date(p.paymentDate),
      p.property?.name,
      p.tenant?.fullName,
      methodLabel(p.method),
      Math.round(Number(p.amount)),
    ]),
    [],
    ["Maintenance"],
    ["Date", "Bien", "Nature", "Statut", "Coût final (FCFA)"],
    ...st.maintenance.map((m) => [
      date(m.createdAt),
      m.property?.name,
      issueLabel(m.issueType),
      statusLabel(m.status),
      m.finalCost ? Math.round(Number(m.finalCost)) : "",
    ]),
  ];

  const body = rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
  return Buffer.from(`﻿${body}`, "utf8");
}

export function ownerStatementPdf(st: OwnerStatement): Promise<Buffer> {
  const money = (n: number) => `${fr(n)} FCFA`;

  return renderPdf(40, (doc) => {
    const left = doc.page.margins.left;
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(20).fillColor("#0B5FFF").font("Helvetica-Bold").text(st.companyName);
    doc.fontSize(13).fillColor("#111827").text("Relevé financier propriétaire");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor("#6B7280");
    doc.text(`Propriétaire : ${st.owner?.fullName ?? "-"}`);
    doc.text(`Généré le ${new Date(st.generatedAt).toLocaleString("fr-FR")}`);
    doc.moveDown(1);

    const cards: [string, string][] = [
      ["Revenus encaissés", money(st.summary.totalRevenue)],
      [`Commission (${st.commissionRate} %)`, money(st.summary.commission)],
      ["Maintenance", money(st.summary.maintenanceCosts)],
      ["Solde net", money(st.summary.netBalance)],
    ];
    const cardWidth = (width - 3 * 10) / 4;
    const cardTop = doc.y;
    cards.forEach(([label, value], i) => {
      const x = left + i * (cardWidth + 10);
      doc.roundedRect(x, cardTop, cardWidth, 54, 6).fillAndStroke("#F3F7FF", "#D7E4FF");
      doc.fillColor("#6B7280").fontSize(8).text(label, x + 10, cardTop + 10, { width: cardWidth - 20 });
      doc.fillColor(i === 3 ? "#16A34A" : "#111827").font("Helvetica-Bold").fontSize(11).text(value, x + 10, cardTop + 26, { width: cardWidth - 20 });
      doc.font("Helvetica");
    });
    doc.y = cardTop + 70;

    const table = (title: string, headers: string[], widths: number[], rows: string[][]) => {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(title);
      doc.moveDown(0.4);
      const drawRow = (cells: string[], bold: boolean, fill?: string) => {
        if (doc.y > doc.page.height - 80) doc.addPage();
        const y = doc.y;
        if (fill) doc.rect(left, y - 3, width, 16).fill(fill);
        doc.fillColor(bold ? "#111827" : "#374151").font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8.5);
        let x = left + 4;
        cells.forEach((cell, i) => {
          doc.text(cell, x, y, { width: widths[i] - 8, lineBreak: false, ellipsis: true });
          x += widths[i];
        });
        doc.y = y + 16;
      };
      drawRow(headers, true, "#F3F4F6");
      if (rows.length === 0) drawRow(["Aucune opération sur la période."], false);
      rows.forEach((r) => drawRow(r, false));
    };

    table(
      "Encaissements",
      ["Date", "Bien", "Locataire", "Moyen", "Montant"],
      [70, 170, 150, 90, width - 480],
      st.payments.map((p) => [
        date(p.paymentDate),
        p.property?.name ?? "-",
        p.tenant?.fullName ?? "-",
        methodLabel(p.method),
        money(Number(p.amount)),
      ]),
    );

    table(
      "Maintenance",
      ["Date", "Bien", "Nature", "Statut", "Coût final"],
      [70, 170, 150, 90, width - 480],
      st.maintenance.map((m) => [
        date(m.createdAt),
        m.property?.name ?? "-",
        issueLabel(m.issueType),
        statusLabel(m.status),
        m.finalCost ? money(Number(m.finalCost)) : "-",
      ]),
    );
  });
}
