import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const FILE_URL_PREFIX = "/api/files/";

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  async save(params: { buffer: Buffer; filename: string; mimeType: string }): Promise<string> {
    const file = await this.prisma.storedFile.create({
      data: {
        filename: params.filename,
        mimeType: params.mimeType,
        size: params.buffer.length,
        data: params.buffer,
      },
      select: { id: true },
    });
    return `${FILE_URL_PREFIX}${file.id}`;
  }

  async get(id: string) {
    const file = await this.prisma.storedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException("Fichier introuvable.");
    return file;
  }

  async deleteByUrl(url?: string | null) {
    if (!url?.startsWith(FILE_URL_PREFIX)) return;
    const id = url.slice(FILE_URL_PREFIX.length);
    await this.prisma.storedFile.deleteMany({ where: { id } });
  }
}
