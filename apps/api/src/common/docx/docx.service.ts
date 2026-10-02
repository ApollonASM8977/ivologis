import { Injectable } from "@nestjs/common";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { ContractBlock, ContractDocumentData, buildContractBlocks } from "../documents/contract-builder";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const BRAND_BLUE = "0B5FFF";
const BRAND_DARK = "0B1F3A";
const INK = "111827";
const INK_MUTED = "6B7280";

@Injectable()
export class DocxService {
  async generateContractDocx(data: ContractDocumentData): Promise<string> {
    const dir = join(UPLOAD_DIR, "contracts");
    ensureDir(dir);
    const filename = `${data.contractNumber}.docx`;
    const filePath = join(dir, filename);

    const blocks: ContractBlock[] = buildContractBlocks(data);
    const children: (Paragraph | Table)[] = [];

    for (const block of blocks) {
      switch (block.kind) {
        case "title":
          children.push(
            new Paragraph({
              spacing: { after: 80 },
              children: [new TextRun({ text: block.text, bold: true, size: 36, color: BRAND_DARK })],
            }),
          );
          break;
        case "subtitle":
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 60 },
              children: [new TextRun({ text: block.text, bold: true, size: 26, color: INK })],
            }),
          );
          break;
        case "meta":
          children.push(
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun({ text: block.text, size: 18, color: INK_MUTED })],
            }),
          );
          break;
        case "heading":
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 100 },
              children: [new TextRun({ text: block.text, bold: true, size: 22, color: BRAND_BLUE })],
            }),
          );
          break;
        case "paragraph":
          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 100 },
              children: [new TextRun({ text: block.text, size: 21, color: INK })],
            }),
          );
          break;
        case "spacer":
          children.push(new Paragraph({ text: "" }));
          break;
        case "signatures":
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: "none", size: 0, color: "FFFFFF" },
                bottom: { style: "none", size: 0, color: "FFFFFF" },
                left: { style: "none", size: 0, color: "FFFFFF" },
                right: { style: "none", size: 0, color: "FFFFFF" },
                insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
                insideVertical: { style: "none", size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          spacing: { before: 400 },
                          children: [new TextRun({ text: block.left, bold: true, size: 21, color: INK })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          spacing: { before: 400 },
                          children: [new TextRun({ text: block.right, bold: true, size: 21, color: INK })],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          );
          break;
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const buffer = await Packer.toBuffer(doc);
    writeFileSync(filePath, buffer);

    return `/uploads/contracts/${filename}`;
  }
}
