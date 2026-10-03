import { BadRequestException } from "@nestjs/common";
import { memoryStorage } from "multer";
import { extname } from "path";

const ALLOWED = [
  { ext: [".pdf"], mime: ["application/pdf"] },
  { ext: [".jpg", ".jpeg", ".png", ".webp"], mime: ["image/jpeg", "image/png", "image/webp"] },
];

export function documentUploadOptions(maxMb: number) {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req: unknown, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
      const ext = extname(file.originalname).toLowerCase();
      const ok = ALLOWED.some((rule) => rule.ext.includes(ext) && rule.mime.includes(file.mimetype));
      if (!ok) return cb(new BadRequestException("Format non supporté : PDF, JPG, PNG ou WebP uniquement."), false);
      cb(null, true);
    },
  };
}
