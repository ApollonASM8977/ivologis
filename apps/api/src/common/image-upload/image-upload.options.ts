import { BadRequestException } from "@nestjs/common";
import { memoryStorage } from "multer";
import { extname } from "path";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function imageUploadOptions(maxMb: number) {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const extOk = [".jpg", ".jpeg", ".png", ".webp"].includes(extname(file.originalname).toLowerCase());
      if (!extOk || !IMAGE_MIME_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException("Format d'image non supporté (JPG, PNG ou WebP uniquement)."), false);
      }
      cb(null, true);
    },
  };
}
